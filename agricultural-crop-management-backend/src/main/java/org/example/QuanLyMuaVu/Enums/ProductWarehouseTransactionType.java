package org.example.QuanLyMuaVu.Enums;

public enum ProductWarehouseTransactionType {
    RECEIPT_FROM_HARVEST,
    ADJUSTMENT,
    STOCK_OUT,
    TRANSFER,
    RETURN;

    public static ProductWarehouseTransactionType fromCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        return ProductWarehouseTransactionType.valueOf(code.trim().toUpperCase());
    }
}

