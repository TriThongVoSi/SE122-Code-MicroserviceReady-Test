package org.example.incident.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateIncidentStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}
