package org.example.QuanLyMuaVu.module.inventory.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductWarehouseLotDto {
    private Integer id;
    private String lotCode;
    private Integer productId;
    private String productName;
    private String productVariant;
    private Integer harvestId;
    private Integer warehouseId;
    private Integer locationId;
    private LocalDate harvestedAt;
    private String unit;
    private BigDecimal initialQuantity;
    private BigDecimal onHandQuantity;
    private String grade;
    private String qualityStatus;
    private String note;
    private String status;
}
