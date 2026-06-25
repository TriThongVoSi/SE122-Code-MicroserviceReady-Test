package org.example.QuanLyMuaVu.module.inventory.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HarvestStockContextDto {
    private String warehouseName;
    private Long matchingLots;
    private BigDecimal onHandQuantity;
    private String unit;
}
