package org.example.QuanLyMuaVu.Config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SwaggerConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    @Primary
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ACM Monolith API")
                        .version("1.0.0")
                        .description("""
                                ### Swagger testing flow
                                - Call POST /api/v1/auth/sign-in to log in.
                                - Copy the returned Bearer token.
                                - Click Authorize in Swagger UI.
                                - Paste the token into the Value field.
                                - Use Try it out to test protected endpoints.
                                """))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8000")
                                .description("API Gateway Server (Public Entrypoint)"),
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Downstream Monolith Server (Direct)")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .name("bearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
