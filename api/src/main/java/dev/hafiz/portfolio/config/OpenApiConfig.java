package dev.hafiz.portfolio.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI portfolioOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Portfolio API")
                .version("0.1.0")
                .description("Public content API and admin CMS for Hafiz's portfolio website. "
                        + "Admin endpoints use an httpOnly cookie set by /api/auth/login and require "
                        + "the header 'X-Requested-With: portfolio-admin' on POST/PUT/DELETE."));
    }
}
