package com.renttrack.backend.config;

import com.renttrack.backend.auth.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth

    // 🌍 PUBLIC
    .requestMatchers(
            "/api/auth/**",
"/uploads/**",
"/api/uploads/**",
"/api/payments/webhook"
    ).permitAll()

    // 🏢 PROPERTIES
    .requestMatchers("/api/properties/**")
        .hasAnyRole("ADMIN", "LANDLORD")

    // 👥 TENANTS
    .requestMatchers("/api/tenants/**")
        .hasAnyRole("ADMIN", "LANDLORD")

    // 💰 PAYMENT ORDER CREATION
    .requestMatchers("/api/payments/create-order")
        .hasRole("TENANT")

    // 💳 PAYMENTS
    .requestMatchers("/api/payments/**")
        .hasAnyRole("ADMIN", "LANDLORD", "TENANT")

    // 📊 DASHBOARD
    .requestMatchers("/api/dashboard/**")
        .hasAnyRole("ADMIN", "LANDLORD")

    // 📄 LEASE
    .requestMatchers("/api/lease/me")
        .hasRole("TENANT")

    // 🔍 OCR
    .requestMatchers("/api/ocr/**")
        .authenticated()

    // 👤 USERS
    .requestMatchers("/api/users/**")
        .hasRole("ADMIN")

    // 🔐 Everything else
    .anyRequest().authenticated()
)
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}