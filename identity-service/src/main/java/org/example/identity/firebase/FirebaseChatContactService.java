package org.example.identity.firebase;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.example.identity.entity.User;
import org.example.identity.enums.UserStatus;
import org.example.identity.repository.UserRepository;
import org.example.identity.service.CurrentUserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FirebaseChatContactService {

    private static final int DEFAULT_LIMIT = 8;
    private static final int MAX_LIMIT = 20;
    private static final Pattern UID_PATTERN = Pattern.compile("^(?:u_|#)?\\s*(\\d+)\\s*$",
                    Pattern.CASE_INSENSITIVE);

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public List<FirebaseChatContactResponse> findContacts(
                    String query,
                    List<Long> userIds,
                    Integer limitRaw) {
        Long currentUserId = currentUserService.getCurrentUserId();
        int limit = normalizeLimit(limitRaw);

        LinkedHashMap<Long, User> orderedUsers = new LinkedHashMap<>();
        boolean hasExplicitUserIds = userIds != null && !userIds.isEmpty();
        boolean hasQuery = query != null && !query.isBlank();

        if (hasExplicitUserIds) {
            addFromUserIds(orderedUsers, userIds, currentUserId);
        }

        if (hasQuery) {
            String trimmedQuery = query == null ? "" : query.trim();
            parseUserId(trimmedQuery)
                            .flatMap(userRepository::findById)
                            .ifPresent(user -> addUserIfEligible(orderedUsers, user, currentUserId));

            addFromUserKeyword(orderedUsers, trimmedQuery, limit, currentUserId);
        }

        if (!hasExplicitUserIds && !hasQuery) {
            userRepository.findAll(PageRequest.of(0, limit))
                            .forEach(user -> addUserIfEligible(orderedUsers, user, currentUserId));
        }

        List<User> candidates = new ArrayList<>(orderedUsers.values());
        if (!hasExplicitUserIds) {
            candidates.sort(Comparator.comparing(this::displayName, String.CASE_INSENSITIVE_ORDER));
        }

        if (candidates.size() > limit) {
            candidates = candidates.subList(0, limit);
        }

        return candidates.stream()
                        .map(this::toContact)
                        .toList();
    }

    private int normalizeLimit(Integer limitRaw) {
        if (limitRaw == null || limitRaw <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(limitRaw, MAX_LIMIT);
    }

    private void addFromUserIds(
                    LinkedHashMap<Long, User> orderedUsers,
                    List<Long> userIds,
                    Long currentUserId) {
        userIds.stream()
                        .filter(id -> id != null && id > 0)
                        .distinct()
                        .map(userRepository::findById)
                        .flatMap(Optional::stream)
                        .forEach(user -> addUserIfEligible(orderedUsers, user, currentUserId));
    }

    private void addFromUserKeyword(
                    LinkedHashMap<Long, User> orderedUsers,
                    String query,
                    int limit,
                    Long currentUserId) {
        userRepository.searchByKeyword(query, PageRequest.of(0, limit))
                        .forEach(user -> addUserIfEligible(orderedUsers, user, currentUserId));
    }

    private void addUserIfEligible(
                    LinkedHashMap<Long, User> orderedUsers,
                    User user,
                    Long currentUserId) {
        if (user == null || user.getId() == null) {
            return;
        }
        if (user.getId().equals(currentUserId)) {
            return;
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            return;
        }
        orderedUsers.putIfAbsent(user.getId(), user);
    }

    private FirebaseChatContactResponse toContact(User user) {
        String representativeName = representativeName(user);
        return new FirebaseChatContactResponse(
                        user.getId(),
                        "u_" + user.getId(),
                        displayName(user),
                        representativeName,
                        null,
                        null,
                        primaryRole(user));
    }

    private String primaryRole(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return null;
        }
        return user.getRoles().stream()
                        .map(org.example.identity.entity.Role::getCode)
                        .filter(code -> code != null && !code.isBlank())
                        .findFirst()
                        .map(code -> code.toUpperCase().startsWith("ROLE_")
                                        ? code.substring("ROLE_".length()).toUpperCase()
                                        : code.toUpperCase())
                        .orElse(null);
    }

    private String displayName(User user) {
        String fullName = safeTrim(user.getFullName());
        if (fullName != null) {
            return fullName;
        }

        String username = safeTrim(user.getUsername());
        if (username != null) {
            return username;
        }

        String email = safeTrim(user.getEmail());
        if (email != null) {
            return email;
        }

        return "User #" + user.getId();
    }

    private String representativeName(User user) {
        String fullName = safeTrim(user.getFullName());
        if (fullName != null) {
            return fullName;
        }
        String username = safeTrim(user.getUsername());
        if (username != null) {
            return username;
        }
        return "User #" + user.getId();
    }

    private Optional<Long> parseUserId(String raw) {
        if (raw == null) {
            return Optional.empty();
        }

        Matcher matcher = UID_PATTERN.matcher(raw.trim());
        if (!matcher.matches()) {
            return Optional.empty();
        }

        try {
            long value = Long.parseLong(matcher.group(1).replaceFirst("^0+(?!$)", ""));
            return value > 0 ? Optional.of(value) : Optional.empty();
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private String safeTrim(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
