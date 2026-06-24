package org.example.identity.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.example.identity.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    void deleteByCode(String code);
    Optional<Role> findByCode(String code);
    List<Role> findByCodeIn(Collection<String> codes);
}
