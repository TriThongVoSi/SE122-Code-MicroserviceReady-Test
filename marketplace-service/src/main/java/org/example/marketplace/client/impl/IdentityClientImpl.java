package org.example.marketplace.client.impl;

import org.example.marketplace.client.IdentityClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class IdentityClientImpl implements IdentityClient {

    @Value("${external-services.identity-service-url:http://identity-service:8081}")
    private String identityServiceUrl;

    @Override
    public String getUserDisplayName(Long userId) {
        // TODO: Implement REST call to identity-service
        // WebClient webClient = WebClient.builder()
        //     .baseUrl(identityServiceUrl)
        //     .build();
        // return webClient.get()
        //     .uri("/api/v1/users/{userId}/display-name", userId)
        //     .retrieve()
        //     .bodyToMono(String.class)
        //     .block();
        return null;
    }
}
