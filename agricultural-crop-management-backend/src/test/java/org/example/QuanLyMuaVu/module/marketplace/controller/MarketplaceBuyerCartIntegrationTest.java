package org.example.QuanLyMuaVu.module.marketplace.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MarketplaceBuyerCartIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void clearCart_WithItems_ShouldRemoveAllItems() throws Exception {
        // First, get a published product ID from the marketplace
        MvcResult productsResult = mockMvc.perform(get("/api/v1/marketplace/products")
                .param("page", "0")
                .param("size", "1"))
            .andExpect(status().isOk())
            .andReturn();

        String productsJson = productsResult.getResponse().getContentAsString();
        JsonNode productsNode = objectMapper.readTree(productsJson);
        JsonNode items = productsNode.path("result").path("items");

        // Skip test if no products available
        if (items.isEmpty()) {
            return;
        }

        Long productId = items.get(0).path("id").asLong();

        // Add an item to the cart
        String addItemRequest = String.format("""
            {
                "productId": %d,
                "quantity": 1
            }
            """, productId);

        mockMvc.perform(post("/api/v1/marketplace/cart/items")
                .with(jwt().jwt(jwt -> jwt.claim("user_id", 4L).claim("role", "BUYER")).authorities(() -> "ROLE_BUYER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(addItemRequest))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result.items").isNotEmpty());

        // Then clear the cart
        mockMvc.perform(delete("/api/v1/marketplace/cart")
                .with(jwt().jwt(jwt -> jwt.claim("user_id", 4L).claim("role", "BUYER")).authorities(() -> "ROLE_BUYER"))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.result.items").isEmpty())
            .andExpect(jsonPath("$.result.itemCount").value(0))
            .andExpect(jsonPath("$.result.subtotal").value(0));
    }

    @Test
    void clearCart_WithNoCart_ShouldReturnEmptyCart() throws Exception {
        // Use a user ID that has never created a cart
        mockMvc.perform(delete("/api/v1/marketplace/cart")
                .with(jwt().jwt(jwt -> jwt.claim("user_id", 999L).claim("role", "BUYER")).authorities(() -> "ROLE_BUYER"))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.result.userId").value(999))
            .andExpect(jsonPath("$.result.items").isEmpty())
            .andExpect(jsonPath("$.result.itemCount").value(0))
            .andExpect(jsonPath("$.result.subtotal").value(0));
    }

    @Test
    void updateCartItemQuantity_UsingPatch_ShouldSucceed() throws Exception {
        // First, get a published product ID from the marketplace
        MvcResult productsResult = mockMvc.perform(get("/api/v1/marketplace/products")
                .param("page", "0")
                .param("size", "1"))
            .andExpect(status().isOk())
            .andReturn();

        String productsJson = productsResult.getResponse().getContentAsString();
        JsonNode productsNode = objectMapper.readTree(productsJson);
        JsonNode items = productsNode.path("result").path("items");

        // Skip test if no products available
        if (items.isEmpty()) {
            return;
        }

        Long productId = items.get(0).path("id").asLong();

        // Add an item to the cart first
        String addItemRequest = String.format("""
            {
                "productId": %d,
                "quantity": 2.0
            }
            """, productId);

        mockMvc.perform(post("/api/v1/marketplace/cart/items")
                .with(jwt().jwt(jwt -> jwt.claim("user_id", 4L).claim("role", "BUYER")).authorities(() -> "ROLE_BUYER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(addItemRequest))
            .andExpect(status().isOk());

        // Now update the quantity using PATCH
        String updateRequest = """
            {
                "quantity": 5.0
            }
            """;

        mockMvc.perform(patch("/api/v1/marketplace/cart/items/" + productId)
                .with(jwt().jwt(jwt -> jwt.claim("user_id", 4L).claim("role", "BUYER")).authorities(() -> "ROLE_BUYER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateRequest))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"));
    }
}
