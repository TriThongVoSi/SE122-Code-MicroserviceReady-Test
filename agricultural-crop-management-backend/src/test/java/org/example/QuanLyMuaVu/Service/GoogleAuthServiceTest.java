package org.example.QuanLyMuaVu.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;
import org.example.QuanLyMuaVu.Enums.UserStatus;
import org.example.QuanLyMuaVu.Exception.AppException;
import org.example.QuanLyMuaVu.Exception.ErrorCode;
import org.example.QuanLyMuaVu.module.identity.dto.request.GoogleAuthRequest;
import org.example.QuanLyMuaVu.module.identity.dto.response.AuthenticationResponse;
import org.example.QuanLyMuaVu.module.identity.entity.Role;
import org.example.QuanLyMuaVu.module.identity.entity.User;
import org.example.QuanLyMuaVu.module.identity.repository.RoleRepository;
import org.example.QuanLyMuaVu.module.identity.repository.UserRepository;
import org.example.QuanLyMuaVu.module.identity.service.AuthenticationResponseFactory;
import org.example.QuanLyMuaVu.module.identity.service.GoogleAuthService;
import org.example.QuanLyMuaVu.module.identity.service.GoogleIdTokenVerifierPort;
import org.example.QuanLyMuaVu.module.identity.service.JwtTokenService;
import org.example.QuanLyMuaVu.module.identity.service.VerifiedGoogleToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceTest {

    @Mock
    private GoogleIdTokenVerifierPort googleIdTokenVerifier;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private JwtTokenService jwtTokenService;

    private GoogleAuthService googleAuthService;
    private Role buyerRole;

    @BeforeEach
    void setUp() {
        AuthenticationResponseFactory responseFactory = new AuthenticationResponseFactory(jwtTokenService);
        googleAuthService = new GoogleAuthService(
                googleIdTokenVerifier,
                userRepository,
                roleRepository,
                jwtTokenService,
                responseFactory);

        buyerRole = Role.builder()
                .id(3L)
                .code("BUYER")
                .name("Buyer")
                .build();
    }

    @Test
    void authenticate_WhenGoogleIdExists_ReturnsInternalJwt() {
        VerifiedGoogleToken token = verifiedToken("google-123", "buyer@example.com", true);
        User existingUser = activeBuyer(10L, "buyer", "buyer@example.com", "google-123");

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.of(existingUser));
        when(jwtTokenService.generateToken(existingUser, "BUYER")).thenReturn("internal.jwt");
        when(jwtTokenService.getValidDuration()).thenReturn(3600L);

        AuthenticationResponse response = googleAuthService.authenticate(request("google-id-token"));

        assertEquals("internal.jwt", response.getToken());
        assertEquals("BUYER", response.getRole());
        assertEquals("/marketplace", response.getRedirectTo());
        verify(userRepository, never()).findByEmailIgnoreCaseWithRoles(any());
    }

    @Test
    void authenticate_WhenSameGoogleAccountLogsInAgain_DoesNotCreateDuplicateUser() {
        VerifiedGoogleToken token = verifiedToken("google-123", "buyer@example.com", true);
        User existingUser = activeBuyer(10L, "buyer", "buyer@example.com", "google-123");

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.of(existingUser));
        when(jwtTokenService.generateToken(existingUser, "BUYER")).thenReturn("internal.jwt");
        when(jwtTokenService.getValidDuration()).thenReturn(3600L);

        googleAuthService.authenticate(request("google-id-token"));
        googleAuthService.authenticate(request("google-id-token"));

        verify(userRepository, times(2)).findByGoogleIdWithRoles("google-123");
        verify(userRepository, never()).save(any(User.class));
        verify(userRepository, never()).findByEmailIgnoreCaseWithRoles(any());
    }

    @Test
    void authenticate_WhenEmailExistsWithoutGoogleId_LinksAccount() {
        VerifiedGoogleToken token = verifiedToken("google-123", "buyer@example.com", true);
        User existingUser = activeBuyer(10L, "buyer", "buyer@example.com", null);
        String originalPassword = existingUser.getPassword();

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCaseWithRoles("buyer@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(existingUser)).thenReturn(existingUser);
        when(jwtTokenService.generateToken(existingUser, "BUYER")).thenReturn("internal.jwt");
        when(jwtTokenService.getValidDuration()).thenReturn(3600L);

        googleAuthService.authenticate(request("google-id-token"));

        assertEquals("google-123", existingUser.getGoogleId());
        assertEquals(originalPassword, existingUser.getPassword());
        verify(userRepository).save(existingUser);
    }

    @Test
    void authenticate_WhenUserIsNew_CreatesActiveBuyerWithNullPassword() {
        VerifiedGoogleToken token = verifiedToken("google-123", "new@example.com", true);

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCaseWithRoles("new@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByCode("BUYER")).thenReturn(Optional.of(buyerRole));
        when(userRepository.existsByUsername("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(20L);
            return user;
        });
        when(jwtTokenService.generateToken(any(User.class), anyString())).thenReturn("internal.jwt");
        when(jwtTokenService.getValidDuration()).thenReturn(3600L);

        AuthenticationResponse response = googleAuthService.authenticate(request("google-id-token"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("new@example.com", savedUser.getUsername());
        assertEquals("new@example.com", savedUser.getEmail());
        assertEquals("google-123", savedUser.getGoogleId());
        assertNull(savedUser.getPassword());
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());
        assertTrue(savedUser.getRoles().contains(buyerRole));
        assertEquals("BUYER", response.getRole());
    }

    @Test
    void authenticate_WhenVerifierRejectsToken_PropagatesGoogleAuthFailed() {
        when(googleIdTokenVerifier.verify("bad-token"))
                .thenThrow(new AppException(ErrorCode.GOOGLE_AUTH_FAILED));

        AppException exception = assertThrows(AppException.class,
                () -> googleAuthService.authenticate(request("bad-token")));

        assertEquals(ErrorCode.GOOGLE_AUTH_FAILED, exception.getErrorCode());
        verify(userRepository, never()).findByGoogleIdWithRoles(any());
    }

    @Test
    void authenticate_WhenEmailIsUnverified_RejectsLogin() {
        VerifiedGoogleToken token = verifiedToken("google-123", "buyer@example.com", false);
        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);

        AppException exception = assertThrows(AppException.class,
                () -> googleAuthService.authenticate(request("google-id-token")));

        assertEquals(ErrorCode.GOOGLE_EMAIL_NOT_VERIFIED, exception.getErrorCode());
        verify(userRepository, never()).findByGoogleIdWithRoles(any());
    }

    @Test
    void authenticate_WhenExistingLinkedEmailHasDifferentGoogleId_ReturnsConflict() {
        VerifiedGoogleToken token = verifiedToken("google-123", "buyer@example.com", true);
        User existingUser = activeBuyer(10L, "buyer", "buyer@example.com", "google-456");

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCaseWithRoles("buyer@example.com")).thenReturn(Optional.of(existingUser));

        AppException exception = assertThrows(AppException.class,
                () -> googleAuthService.authenticate(request("google-id-token")));

        assertEquals(ErrorCode.GOOGLE_ACCOUNT_CONFLICT, exception.getErrorCode());
    }

    @Test
    void authenticate_WhenUserIsLocked_RejectsLogin() {
        VerifiedGoogleToken token = verifiedToken("google-123", "buyer@example.com", true);
        User lockedUser = activeBuyer(10L, "buyer", "buyer@example.com", "google-123");
        lockedUser.setStatus(UserStatus.LOCKED);

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.of(lockedUser));

        AppException exception = assertThrows(AppException.class,
                () -> googleAuthService.authenticate(request("google-id-token")));

        assertEquals(ErrorCode.USER_LOCKED, exception.getErrorCode());
    }

    @Test
    void authenticate_WhenDefaultBuyerRoleMissing_ReturnsSetupError() {
        VerifiedGoogleToken token = verifiedToken("google-123", "new@example.com", true);

        when(googleIdTokenVerifier.verify("google-id-token")).thenReturn(token);
        when(userRepository.findByGoogleIdWithRoles("google-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCaseWithRoles("new@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByCode("BUYER")).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class,
                () -> googleAuthService.authenticate(request("google-id-token")));

        assertEquals(ErrorCode.GOOGLE_DEFAULT_ROLE_MISSING, exception.getErrorCode());
    }

    private GoogleAuthRequest request(String idToken) {
        return GoogleAuthRequest.builder()
                .idToken(idToken)
                .build();
    }

    private VerifiedGoogleToken verifiedToken(String googleId, String email, Boolean emailVerified) {
        return new VerifiedGoogleToken(
                googleId,
                email,
                emailVerified,
                "Google Buyer",
                "https://example.com/avatar.png");
    }

    private User activeBuyer(Long id, String username, String email, String googleId) {
        return User.builder()
                .id(id)
                .username(username)
                .email(email)
                .googleId(googleId)
                .password("encoded-password")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(buyerRole))
                .build();
    }
}
