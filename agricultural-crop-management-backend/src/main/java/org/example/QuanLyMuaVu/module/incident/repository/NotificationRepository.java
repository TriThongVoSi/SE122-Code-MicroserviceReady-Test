package org.example.QuanLyMuaVu.module.incident.repository;



import java.util.List;
import java.util.Optional;
import org.example.QuanLyMuaVu.module.incident.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC, n.id DESC")
    List<Notification> findByUserIdOrderByNewest(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.id = :id AND n.userId = :userId")
    Optional<Notification> findByIdAndUserId(@Param("id") Integer id, @Param("userId") Long userId);
}
