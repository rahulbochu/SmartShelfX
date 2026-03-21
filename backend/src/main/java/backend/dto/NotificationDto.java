package backend.dto;

import backend.enums.AlertType;
import lombok.*;

import java.time.LocalDateTime;

public class NotificationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private AlertType alertType;
        private String title;
        private String message;
        private Boolean isRead;
        private Long productId;
        private Long purchaseOrderId;
        private Long vendorId;
        private LocalDateTime createdAt;
        private LocalDateTime readAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UnreadCountResponse {
        private long unreadCount;
    }
}