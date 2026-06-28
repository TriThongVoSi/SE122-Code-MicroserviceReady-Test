package org.example.marketplace.client.impl;

import org.example.marketplace.client.SeasonClient;
import org.example.marketplace.dto.client.SeasonDetailDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class SeasonClientImpl implements SeasonClient {

    @Value("${external-services.season-service-url:http://season-service:8083}")
    private String seasonServiceUrl;

    @Override
    public List<SeasonDetailDto> getSeasonsByIds(List<Integer> seasonIds) {
        // TODO: Implement REST call to season-service
        // WebClient webClient = WebClient.builder()
        //     .baseUrl(seasonServiceUrl)
        //     .build();
        // return webClient.post()
        //     .uri("/api/v1/seasons/batch")
        //     .bodyValue(seasonIds)
        //     .retrieve()
        //     .bodyToFlux(SeasonDetailDto.class)
        //     .collectList()
        //     .block();
        return List.of();
    }

    @Override
    public SeasonDetailDto getSeasonDetail(Integer seasonId) {
        // TODO: Implement REST call to season-service
        // WebClient webClient = WebClient.builder()
        //     .baseUrl(seasonServiceUrl)
        //     .build();
        // return webClient.get()
        //     .uri("/api/v1/seasons/{seasonId}", seasonId)
        //     .retrieve()
        //     .bodyToMono(SeasonDetailDto.class)
        //     .block();
        return null;
    }
}
