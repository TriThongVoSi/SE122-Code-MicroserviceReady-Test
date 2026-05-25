package org.example.QuanLyMuaVu.module.identity.service;

public interface GoogleIdTokenVerifierPort {
    VerifiedGoogleToken verify(String idToken);
}
