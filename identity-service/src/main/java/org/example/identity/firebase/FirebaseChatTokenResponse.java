package org.example.identity.firebase;

public record FirebaseChatTokenResponse(
        String appUid,
        String role,
        String customToken
) {
}
