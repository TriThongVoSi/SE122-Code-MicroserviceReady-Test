package org.example.identity.service;

public interface GoogleIdTokenVerifierPort {
    VerifiedGoogleToken verify(String idToken);
}
