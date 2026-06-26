package org.example.QuanLyMuaVu.module.shared.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResultDto {
    private boolean valid;
    private String errorCode;
    private String errorMessage;
    private Integer resolvedItemId;
}
