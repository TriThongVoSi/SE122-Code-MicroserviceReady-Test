package org.example.QuanLyMuaVu.module.inventory.dto.request;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncLotRequest {
    private LocalDate harvestedAt;
    private BigDecimal initialQuantity;
    private BigDecimal onHandQuantity;
    private String grade;
    private String qualityStatus;
    private String note;
    private String status;
}
