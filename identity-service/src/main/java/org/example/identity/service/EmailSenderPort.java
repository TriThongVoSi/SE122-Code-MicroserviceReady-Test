package org.example.identity.service;

/**
 * Port interface for sending emails.
 * Implementations can use SMTP, external services, etc.
 */
public interface EmailSenderPort {

    /**
     * Send an HTML email.
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param body    HTML email body
     */
    void sendHtml(String to, String subject, String body);
}
