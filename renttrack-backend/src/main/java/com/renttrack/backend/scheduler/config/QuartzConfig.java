package com.renttrack.backend.scheduler.config;

import com.renttrack.backend.scheduler.job.LeaseExpiryJob;
import com.renttrack.backend.scheduler.job.OverdueCheckerJob;
import com.renttrack.backend.scheduler.job.RentReminderJob;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

@Configuration
public class QuartzConfig {

    @Autowired
    private ApplicationContext applicationContext;

    @Bean
    public SpringBeanJobFactory springBeanJobFactory() {
        SpringBeanJobFactory factory = new SpringBeanJobFactory();
        factory.setApplicationContext(applicationContext);
        return factory;
    }

   @Bean
public SchedulerFactoryBean schedulerFactoryBean(
        SpringBeanJobFactory springBeanJobFactory) {

    SchedulerFactoryBean factory = new SchedulerFactoryBean();
    factory.setJobFactory(springBeanJobFactory);
    factory.setOverwriteExistingJobs(true);
    factory.setAutoStartup(true);
    factory.setJobDetails(                          // ← add this
            rentReminderJobDetail(),
            overdueCheckerJobDetail(),
            leaseExpiryJobDetail()
    );
    factory.setTriggers(
            rentReminderTrigger(rentReminderJobDetail()),
            overdueCheckerTrigger(overdueCheckerJobDetail()),
            leaseExpiryTrigger(leaseExpiryJobDetail())
    );
    return factory;
}
    @Bean
    public JobDetail rentReminderJobDetail() {
        return JobBuilder.newJob(RentReminderJob.class)
                .withIdentity("rentReminderJob")
                .withDescription("Monthly rent reminders to all active tenants")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger rentReminderTrigger(JobDetail rentReminderJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(rentReminderJobDetail)
                .withIdentity("rentReminderTrigger")
                .withSchedule(
                        CronScheduleBuilder
                                .cronSchedule("0 0 0 1 * ?")
                                .withMisfireHandlingInstructionFireAndProceed()
                )
                .build();
    }

    @Bean
    public JobDetail overdueCheckerJobDetail() {
        return JobBuilder.newJob(OverdueCheckerJob.class)
                .withIdentity("overdueCheckerJob")
                .withDescription("Daily overdue payment checker")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger overdueCheckerTrigger(JobDetail overdueCheckerJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(overdueCheckerJobDetail)
                .withIdentity("overdueCheckerTrigger")
                .withSchedule(
                        CronScheduleBuilder
                                .cronSchedule("0 0 8 * * ?")
                                .withMisfireHandlingInstructionFireAndProceed()
                )
                .build();
    }

    @Bean
    public JobDetail leaseExpiryJobDetail() {
        return JobBuilder.newJob(LeaseExpiryJob.class)
                .withIdentity("leaseExpiryJob")
                .withDescription("Daily lease expiry warning")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger leaseExpiryTrigger(JobDetail leaseExpiryJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(leaseExpiryJobDetail)
                .withIdentity("leaseExpiryTrigger")
                .withSchedule(
                        CronScheduleBuilder
                                .cronSchedule("0 0 10 * * ?")
                                .withMisfireHandlingInstructionFireAndProceed()
                )
                .build();
    }
}