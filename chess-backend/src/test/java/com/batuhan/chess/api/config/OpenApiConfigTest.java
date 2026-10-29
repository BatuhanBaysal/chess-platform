package com.batuhan.chess.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("OpenAPI Configuration Unit Tests")
class OpenApiConfigTest {

    @Test
    @DisplayName("Should create OpenAPI bean with metadata and BearerAuth JWT security scheme")
    void shouldCreateCustomOpenApiBean() {
        // Arrange
        OpenApiConfig config = new OpenApiConfig();

        // Act
        OpenAPI openAPI = config.customOpenAPI();

        // Assert
        assertThat(openAPI).isNotNull();
        assertThat(openAPI.getInfo()).isNotNull();
        assertThat(openAPI.getInfo().getTitle()).isEqualTo("Chess Platform API");
        assertThat(openAPI.getInfo().getVersion()).isEqualTo("v2.6.0");
        assertThat(openAPI.getInfo().getDescription()).contains("Chess Platform Engine");

        assertThat(openAPI.getSecurity()).isNotEmpty();
        assertThat(openAPI.getSecurity().get(0)).containsKey("BearerAuth");

        assertThat(openAPI.getComponents()).isNotNull();
        SecurityScheme scheme = openAPI.getComponents().getSecuritySchemes().get("BearerAuth");
        assertThat(scheme).isNotNull();
        assertThat(scheme.getType()).isEqualTo(SecurityScheme.Type.HTTP);
        assertThat(scheme.getScheme()).isEqualTo("bearer");
        assertThat(scheme.getBearerFormat()).isEqualTo("JWT");
    }
}
