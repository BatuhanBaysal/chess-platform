package com.batuhan.chess.api.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("RabbitMQ Configuration Unit Tests")
class RabbitMQConfigTest {

    @Mock
    private ConnectionFactory connectionFactory;

    @Mock
    private MessageConverter messageConverter;

    @InjectMocks
    private RabbitMQConfig rabbitMQConfig;

    @Nested
    @DisplayName("Exchange, Queue and Binding Beans")
    class TopologyTests {

        @Test
        @DisplayName("Should create durable TopicExchange with correct exchange name")
        void shouldCreateTopicExchangeWithCorrectName() {
            // Arrange & Act
            TopicExchange exchange = rabbitMQConfig.gameExchange();

            // Assert
            assertThat(exchange).isNotNull();
            assertThat(exchange.getName()).isEqualTo(RabbitMQConfig.GAME_EXCHANGE);
            assertThat(exchange.isDurable()).isTrue();
        }

        @Test
        @DisplayName("Should create durable Queue with correct queue name")
        void shouldCreateDurableQueueWithCorrectName() {
            // Arrange & Act
            Queue queue = rabbitMQConfig.gameAnalysisQueue();

            // Assert
            assertThat(queue).isNotNull();
            assertThat(queue.getName()).isEqualTo(RabbitMQConfig.GAME_ANALYSIS_QUEUE);
            assertThat(queue.isDurable()).isTrue();
        }

        @Test
        @DisplayName("Should bind queue to exchange with routing key")
        void shouldBindQueueToExchangeWithRoutingKey() {
            // Arrange
            Queue queue = rabbitMQConfig.gameAnalysisQueue();
            TopicExchange exchange = rabbitMQConfig.gameExchange();

            // Act
            Binding binding = rabbitMQConfig.gameAnalysisBinding(queue, exchange);

            // Assert
            assertThat(binding).isNotNull();
            assertThat(binding.getExchange()).isEqualTo(RabbitMQConfig.GAME_EXCHANGE);
            assertThat(binding.getDestination()).isEqualTo(RabbitMQConfig.GAME_ANALYSIS_QUEUE);
            assertThat(binding.getRoutingKey()).isEqualTo(RabbitMQConfig.GAME_ANALYSIS_ROUTING_KEY);
        }
    }

    @Nested
    @DisplayName("Template and Converters")
    class TemplateTests {

        @Test
        @DisplayName("Should return Jackson2JsonMessageConverter bean")
        void shouldReturnJackson2JsonMessageConverter() {
            // Arrange & Act
            MessageConverter converter = rabbitMQConfig.jsonMessageConverter();

            // Assert
            assertThat(converter)
                .isNotNull()
                .isInstanceOf(Jackson2JsonMessageConverter.class);
        }

        @Test
        @DisplayName("Should configure RabbitTemplate with provided dependencies")
        void shouldConfigureRabbitTemplateWithGivenDependencies() {
            // Arrange & Act
            RabbitTemplate template = rabbitMQConfig.rabbitTemplate(connectionFactory, messageConverter);

            // Assert
            assertThat(template).isNotNull();
            assertThat(template.getConnectionFactory()).isEqualTo(connectionFactory);
            assertThat(template.getMessageConverter()).isEqualTo(messageConverter);
        }
    }
}
