package com.batuhan.chess.api.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String GAME_EXCHANGE = "chess.game.exchange";
    public static final String GAME_ANALYSIS_QUEUE = "chess.game.analysis.queue";
    public static final String GAME_ANALYSIS_ROUTING_KEY = "chess.game.analysis.routing.key";

    @Bean
    public TopicExchange gameExchange() {
        return new TopicExchange(GAME_EXCHANGE);
    }

    @Bean
    public Queue gameAnalysisQueue() {
        return QueueBuilder.durable(GAME_ANALYSIS_QUEUE).build();
    }

    @Bean
    public Binding gameAnalysisBinding(Queue gameAnalysisQueue, TopicExchange gameExchange) {
        return BindingBuilder.bind(gameAnalysisQueue).to(gameExchange).with(GAME_ANALYSIS_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
