package org.example.template.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Objects;

@Component
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    private String signerKey;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {
        if (Objects.isNull(nimbusJwtDecoder)) {
            try {
                // Ensure key is long enough for HS512 (at least 512 bits / 64 bytes)
                byte[] keyBytes = signerKey.getBytes();
                SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "HS512");
                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                        .macAlgorithm(MacAlgorithm.HS512)
                        .build();
            } catch (Exception e) {
                throw new JwtException("Failed to initialize Nimbus JWT decoder: " + e.getMessage(), e);
            }
        }
        return nimbusJwtDecoder.decode(token);
    }
}
