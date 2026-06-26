package org.example.identity.service;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.identity.enums.UserStatus;
import org.example.identity.exception.AppException;
import org.example.identity.exception.ErrorCode;
import org.example.identity.dto.response.AuthenticationResponse;
import org.example.identity.entity.Role;
import org.example.identity.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationResponseFactory {

    JwtTokenService jwtTokenService;

    public void validateUserCanAuthenticate(User user, String identifierForLog) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Authentication failed - user not active. Identifier: {}, Status: {}",
                    identifierForLog, user.getStatus());

            if (user.getStatus() == UserStatus.LOCKED) {
                throw new AppException(ErrorCode.USER_LOCKED);
            }
            if (user.getStatus() == UserStatus.INACTIVE) {
                throw new AppException(ErrorCode.USER_INACTIVE);
            }
            throw new AppException(ErrorCode.USER_LOCKED);
        }

        if (CollectionUtils.isEmpty(user.getRoles())) {
            log.warn("Authentication failed - no roles assigned to user: {}", identifierForLog);
            throw new AppException(ErrorCode.ROLE_MISSING);
        }
    }

    /**
     * Business rule: ADMIN > FARMER > EMPLOYEE > BUYER, otherwise first role.
     */
    public String determinePrimaryRole(User user) {
        List<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .toList();

        if (roleCodes.contains("ADMIN")) {
            return "ADMIN";
        }
        if (roleCodes.contains("FARMER")) {
            return "FARMER";
        }
        if (roleCodes.contains("EMPLOYEE")) {
            return "EMPLOYEE";
        }
        if (roleCodes.contains("BUYER")) {
            return "BUYER";
        }
        return roleCodes.isEmpty() ? null : roleCodes.get(0);
    }

    public AuthenticationResponse buildAuthResponse(User user, String primaryRole, String token) {
        AuthenticationResponse.ProfileInfo profile = AuthenticationResponse.ProfileInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .joinedDate(user.getJoinedDate() != null ? user.getJoinedDate().toString() : null)
                .provinceId(user.getProvinceId())
                .wardId(user.getWardId())
                .build();

        var builder = AuthenticationResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(Role::getCode).toList())
                .role(primaryRole)
                .profile(profile)
                .redirectTo(determineRedirectPath(primaryRole));

        if (token != null) {
            builder.token(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtTokenService.getValidDuration());
        }

        return builder.build();
    }

    private String determineRedirectPath(String role) {
        if ("ADMIN".equalsIgnoreCase(role)) {
            return "/admin";
        }
        if ("FARMER".equalsIgnoreCase(role)) {
            return "/farmer";
        }
        if ("EMPLOYEE".equalsIgnoreCase(role)) {
            return "/employee";
        }
        if ("BUYER".equalsIgnoreCase(role)) {
            return "/marketplace";
        }
        return "/";
    }
}
