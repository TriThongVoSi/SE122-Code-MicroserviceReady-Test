package org.example.identity.config;

import org.example.identity.service.EmailSenderPort;
import org.example.identity.service.LogEmailSenderAdapter;
import org.example.identity.service.SmtpEmailSenderAdapter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
public class MailSenderConfig {

    @Bean
    @Primary
    @ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "true", matchIfMissing = false)
    public EmailSenderPort smtpEmailSender(JavaMailSender mailSender, @Value("${app.mail.from:no-reply@localhost}") String fromAddress) {
        return new SmtpEmailSenderAdapter(mailSender, fromAddress);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "false", matchIfMissing = true)
    public EmailSenderPort logEmailSender() {
        return new LogEmailSenderAdapter();
    }
}
