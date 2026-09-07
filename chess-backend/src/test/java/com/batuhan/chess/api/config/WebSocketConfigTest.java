package com.batuhan.chess.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.SockJsServiceRegistration;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@DisplayName("WebSocket Configuration Tests")
class WebSocketConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
        .withUserConfiguration(WebSocketConfig.class);

    @Test
    @DisplayName("Should load WebSocketConfig bean and implement WebSocketMessageBrokerConfigurer")
    void shouldCreateWebSocketConfigBean() {
        // Arrange & Act & Assert
        contextRunner.run(context -> {
            // Assert
            assertThat(context).hasSingleBean(WebSocketConfig.class);
            assertThat(context.getBean(WebSocketConfig.class))
                .isInstanceOf(WebSocketMessageBrokerConfigurer.class);
        });
    }

    @Test
    @DisplayName("Should configure message broker with correct simple broker and application prefixes")
    void shouldConfigureMessageBroker() {
        // Arrange
        WebSocketConfig webSocketConfig = new WebSocketConfig();
        MessageBrokerRegistry brokerRegistryMock = mock(MessageBrokerRegistry.class);

        // Act
        webSocketConfig.configureMessageBroker(brokerRegistryMock);

        // Assert
        verify(brokerRegistryMock).enableSimpleBroker("/topic");
        verify(brokerRegistryMock).setApplicationDestinationPrefixes("/app");
    }

    @Test
    @DisplayName("Should register STOMP endpoint with correct path and allowed origins")
    void shouldRegisterStompEndpoints() {
        // Arrange
        WebSocketConfig webSocketConfig = new WebSocketConfig();
        StompEndpointRegistry registryMock = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registrationMock = mock(StompWebSocketEndpointRegistration.class);
        SockJsServiceRegistration sockJsServiceRegistrationMock = mock(SockJsServiceRegistration.class);

        when(registryMock.addEndpoint("/ws-chess")).thenReturn(registrationMock);
        when(registrationMock.setAllowedOriginPatterns(any(String[].class))).thenReturn(registrationMock);
        when(registrationMock.withSockJS()).thenReturn(sockJsServiceRegistrationMock);

        // Act
        webSocketConfig.registerStompEndpoints(registryMock);

        // Assert
        verify(registryMock).addEndpoint("/ws-chess");
        verify(registrationMock).setAllowedOriginPatterns(
            "http://localhost:5173",
            "http://localhost",
            "http://localhost:*",
            "https://chess-app.duckdns.org",
            "https://chess-app.duckdns.org",
            "https://chess-platform-app.vercel.app",
            "https://chess-platform-*.vercel.app"
        );
        verify(registrationMock).withSockJS();
    }
}
