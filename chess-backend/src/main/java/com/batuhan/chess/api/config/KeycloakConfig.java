package com.batuhan.chess.api.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    @Value("${KEYCLOAK_SERVER_URL:http://keycloak:8081}")
    private String keycloakServerUrl;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
            .serverUrl(keycloakServerUrl)
            .realm("master")
            .clientId("admin-cli")
            .username("admin")
            .password("admin")
            .build();
    }
}
