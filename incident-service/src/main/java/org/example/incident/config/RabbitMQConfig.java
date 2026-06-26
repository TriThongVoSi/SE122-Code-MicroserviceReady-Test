package org.example.incident.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "incident-exchange";
    public static final String SEASON_EXCHANGE_NAME = "season-exchange";
    public static final String FINANCE_EXCHANGE_NAME = "finance-exchange";
    public static final String INCIDENT_SERVICE_EVENTS_QUEUE = "incident-service.events";

    // Routing keys we need to consume
    public static final String TASK_ASSIGNED_ROUTING_KEY = "season.event.task.assigned";
    public static final String TASK_COMPLETED_ROUTING_KEY = "season.event.task.completed";
    public static final String HARVEST_RECORDED_ROUTING_KEY = "season.event.harvest.recorded";
    public static final String EXPENSE_CREATED_ROUTING_KEY = "finance.event.expense.created";
    public static final String EXPENSE_UPDATED_ROUTING_KEY = "finance.event.expense.updated";
    public static final String EXPENSE_DELETED_ROUTING_KEY = "finance.event.expense.deleted";
    public static final String INCIDENT_CREATED_ROUTING_KEY = "incident.event.incident.created";
    public static final String INCIDENT_UPDATED_ROUTING_KEY = "incident.event.incident.updated";
    public static final String INCIDENT_RESOLVED_ROUTING_KEY = "incident.event.incident.resolved";
    public static final String INCIDENT_CANCELLED_ROUTING_KEY = "incident.event.incident.cancelled";

    @Bean
    public TopicExchange incidentExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public TopicExchange seasonExchange() {
        return new TopicExchange(SEASON_EXCHANGE_NAME);
    }

    @Bean
    public TopicExchange financeExchange() {
        return new TopicExchange(FINANCE_EXCHANGE_NAME);
    }

    @Bean
    public Queue incidentServiceEventsQueue() {
        return new Queue(INCIDENT_SERVICE_EVENTS_QUEUE, true);
    }

    // Bindings for season service events
    @Bean
    public Binding taskAssignedBinding(Queue incidentServiceEventsQueue, TopicExchange seasonExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(seasonExchange).with(TASK_ASSIGNED_ROUTING_KEY);
    }

    @Bean
    public Binding taskCompletedBinding(Queue incidentServiceEventsQueue, TopicExchange seasonExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(seasonExchange).with(TASK_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding harvestRecordedBinding(Queue incidentServiceEventsQueue, TopicExchange seasonExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(seasonExchange).with(HARVEST_RECORDED_ROUTING_KEY);
    }

    // Bindings for finance service events
    @Bean
    public Binding expenseCreatedBinding(Queue incidentServiceEventsQueue, TopicExchange financeExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(financeExchange).with(EXPENSE_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding expenseUpdatedBinding(Queue incidentServiceEventsQueue, TopicExchange financeExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(financeExchange).with(EXPENSE_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding expenseDeletedBinding(Queue incidentServiceEventsQueue, TopicExchange financeExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(financeExchange).with(EXPENSE_DELETED_ROUTING_KEY);
    }

    // Bindings for incident service events
    @Bean
    public Binding incidentCreatedBinding(Queue incidentServiceEventsQueue, TopicExchange incidentExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(incidentExchange).with(INCIDENT_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding incidentUpdatedBinding(Queue incidentServiceEventsQueue, TopicExchange incidentExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(incidentExchange).with(INCIDENT_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding incidentResolvedBinding(Queue incidentServiceEventsQueue, TopicExchange incidentExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(incidentExchange).with(INCIDENT_RESOLVED_ROUTING_KEY);
    }

    @Bean
    public Binding incidentCancelledBinding(Queue incidentServiceEventsQueue, TopicExchange incidentExchange) {
        return BindingBuilder.bind(incidentServiceEventsQueue).to(incidentExchange).with(INCIDENT_CANCELLED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
