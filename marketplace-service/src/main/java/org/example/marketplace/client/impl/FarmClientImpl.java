package org.example.marketplace.client.impl;

import org.example.marketplace.client.FarmClient;
import org.example.marketplace.dto.client.FarmDetailDto;
import org.example.marketplace.dto.client.FarmSummaryDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class FarmClientImpl implements FarmClient {

    @Value("${external-services.farm-service-url:http://farm-service:8082}")
    private String farmServiceUrl;

    @Override
    public List<FarmSummaryDto> getFarmsByIds(List<Integer> farmIds) {
        // TODO: Implement REST call to farm-service
        // WebClient webClient = WebClient.builder()
        //     .baseUrl(farmServiceUrl)
        //     .build();
        // return webClient.post()
        //     .uri("/api/v1/farms/batch")
        //     .bodyValue(farmIds)
        //     .retrieve()
        //     .bodyToFlux(FarmSummaryDto.class)
        //     .collectList()
        //     .block();
        return List.of();
    }

    @Override
    public FarmDetailDto getFarmDetail(Integer farmId) {
        // TODO: Implement REST call to farm-service
        // WebClient webClient = WebClient.builder()
        //     .baseUrl(farmServiceUrl)
        //     .build();
        // return webClient.get()
        //     .uri("/api/v1/farms/{farmId}", farmId)
        //     .retrieve()
        //     .bodyToMono(FarmDetailDto.class)
        //     .block();
        return null;
    }
}
