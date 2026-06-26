package org.example.identity.port;

import java.util.List;
import java.util.Optional;
import org.example.identity.enums.UserStatus;
import org.example.identity.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IdentityQueryPort {

    Optional<User> findUserById(Long userId);

    Optional<User> findUserByUsername(String username);

    Page<User> findAllUsers(Pageable pageable);

    Page<User> searchUsersByKeyword(String keyword, Pageable pageable);

    boolean existsUserByIdAndRoleCode(Long userId, String roleCode);

    long countUsers();

    long countUsersByStatus(UserStatus status);

    Page<User> searchUsersByRoleAndStatusAndKeyword(String roleCode, UserStatus status, String keyword, Pageable pageable);

    List<String> findAllRoleCodes();
}
