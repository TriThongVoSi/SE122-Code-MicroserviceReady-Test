package org.example.QuanLyMuaVu.module.identity.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import lombok.extern.slf4j.Slf4j;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class GoogleIdTokenVerifierAdapter implements GoogleIdTokenVerifierPort {

    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleIdTokenVerifierAdapter(@Value("${google.client-id:}") String clientId) {
        this.clientId = clientId == null ? "" : clientId.trim();
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(this.clientId.isBlank() ? Collections.emptyList() : Collections.singletonList(this.clientId))
                .build();
    }

    @Override
    public VerifiedGoogleToken verify(String idToken) {
        if (clientId.isBlank()) {
            throw new AppException(ErrorCode.GOOGLE_AUTH_NOT_CONFIGURED);
        }

        try {
            GoogleIdToken verifiedToken = verifier.verify(idToken);
            if (verifiedToken == null) {
                throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
            }

            GoogleIdToken.Payload payload = verifiedToken.getPayload();
            return new VerifiedGoogleToken(
                    payload.getSubject(),
                    payload.getEmail(),
                    payload.getEmailVerified(),
                    stringPayload(payload, "name"),
                    stringPayload(payload, "picture"));
        } catch (AppException exception) {
            throw exception;
        } catch (GeneralSecurityException | IOException exception) {
            log.warn("Google ID token verification failed: {}", exception.getMessage());
            throw new AppException(ErrorCode.GOOGLE_AUTH_FAILED);
        }
    }

    private String stringPayload(GoogleIdToken.Payload payload, String key) {
        Object value = payload.get(key);
        return value instanceof String stringValue ? stringValue : null;
    }
}
