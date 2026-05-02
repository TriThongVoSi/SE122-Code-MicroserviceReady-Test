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
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MarketplaceBuyerCartIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void clearCart_WithItems_ShouldRemoveAllItems() throws Exception {
        mockMvc.perform(delete("/api/v1/marketplace/cart")
                .with(jwt().jwt(jwt -> jwt.claim("user_id", 4L).claim("role", "BUYER")).authorities(() -> "ROLE_BUYER"))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("SUCCESS"))
            .andExpect(jsonPath("$.result.items").isEmpty())
            .andExpect(jsonPath("$.result.itemCount").value(0))
            .andExpect(jsonPath("$.result.subtotal").value(0));
    }
}
