package backend.repository;

import backend.entity.Notification;
import backend.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();

    long countByIsReadFalse();

    List<Notification> findByAlertType(AlertType alertType);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.isRead = false")
    int markAllAsRead();

    // Prevent duplicate unread alerts for the same product
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.alertType = :alertType AND n.productId = :productId AND n.isRead = false")
    boolean existsUnreadAlertForProduct(
            @Param("alertType") AlertType alertType,
            @Param("productId") Long productId
    );
}