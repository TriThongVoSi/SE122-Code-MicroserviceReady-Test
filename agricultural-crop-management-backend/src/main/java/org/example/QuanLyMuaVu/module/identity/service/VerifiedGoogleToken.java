package org.example.QuanLyMuaVu.module.identity.service;

public record VerifiedGoogleToken(
        String googleId,
        String email,
        Boolean emailVerified,
        String fullName,
        String picture) {
}
