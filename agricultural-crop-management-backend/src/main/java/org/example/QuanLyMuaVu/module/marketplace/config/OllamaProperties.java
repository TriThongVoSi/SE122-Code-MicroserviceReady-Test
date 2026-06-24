package org.example.QuanLyMuaVu.module.marketplace.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ollama")
@Getter
@Setter
public class OllamaProperties {

    private String baseUrl = "http://localhost:11434";
    private String model = "qwen3.5:2b";
    private long timeoutMs = 60000L;
}
