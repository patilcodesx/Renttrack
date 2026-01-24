package com.renttrack.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry
            // URL exposed to browser
            .addResourceHandler("/uploads/**")

            // Physical folder inside docker container
            .addResourceLocations("file:/app/uploads/");
    }
}


