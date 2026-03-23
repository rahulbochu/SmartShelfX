package backend.controller;

import backend.dto.NotificationDto;
import backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // GET all notifications (paginated) — ?page=0&size=20
    @GetMapping
    public ResponseEntity<Page<NotificationDto.Response>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getAllNotifications(pageable));
    }

    // GET unread notifications only
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto.Response>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications());
    }

    // GET unread count
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadCount());
    }

    // PATCH mark single notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto.Response> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // PATCH mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<Integer> markAllAsRead() {
        return ResponseEntity.ok(notificationService.markAllAsRead());
    }
}