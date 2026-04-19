package org.example.QuanLyMuaVu.module.marketplace.model;

/**
 * Buyer-facing order lifecycle for marketplace orders.
 */
public enum MarketplaceOrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    DELIVERING,
    COMPLETED,
    CANCELLED
}
