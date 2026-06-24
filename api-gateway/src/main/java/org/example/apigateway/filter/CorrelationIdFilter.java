package org.example.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(CorrelationIdFilter.class);
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        HttpHeaders headers = request.getHeaders();

        String correlationId = headers.getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
            logger.debug("No correlation ID found in request headers. Generated new ID: {}", correlationId);
            
            // Mutate request to add the header for downstream services
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header(CORRELATION_ID_HEADER, correlationId)
                    .build();
            exchange = exchange.mutate().request(mutatedRequest).build();
        } else {
            logger.debug("Correlation ID found in request headers: {}", correlationId);
        }

        // Add correlation ID to response headers for the client
        exchange.getResponse().getHeaders().add(CORRELATION_ID_HEADER, correlationId);
        
        final String finalCorrelationId = correlationId;
        // Put the correlation ID in the reactive context for logging
        return chain.filter(exchange)
                .contextWrite(context -> context.put(CORRELATION_ID_HEADER, finalCorrelationId));
    }

    @Override
    public int getOrder() {
        // High priority to ensure correlation ID is set before any logging/routing occurs
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
