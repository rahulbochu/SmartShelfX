package backend.service;

import backend.dto.NotificationDto;
import backend.entity.Notification;
import backend.enums.AlertType;
import backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createLowStockNotification(Long productId, String productName,
                                                    int currentStock, int reorderLevel) {
        if (notificationRepository.existsUnreadAlertForProduct(AlertType.LOW_STOCK, productId)) {
            log.debug("Unread low-stock alert already exists for product {}, skipping.", productName);
            return null;
        }
        Notification n = new Notification();
        n.setAlertType(AlertType.LOW_STOCK);
        n.setTitle("Low Stock: " + productName);
        n.setMessage(String.format("'%s' has only %d unit(s) remaining (reorder level: %d).",
                productName, currentStock, reorderLevel));
        n.setProductId(productId);
        n.setIsRead(false);
        return notificationRepository.save(n);
    }

    public Notification createExpiryNotification(Long productId, String productName,
                                                  String expiryDate, int daysRemaining) {
        if (notificationRepository.existsUnreadAlertForProduct(AlertType.EXPIRY_WARNING, productId)) {
            log.debug("Unread expiry alert already exists for product {}, skipping.", productName);
            return null;
        }
        Notification n = new Notification();
        n.setAlertType(AlertType.EXPIRY_WARNING);
        n.setTitle("Expiry Warning: " + productName);
        n.setMessage(String.format("'%s' will expire on %s (%d day(s) remaining).",
                productName, expiryDate, daysRemaining));
        n.setProductId(productId);
        n.setIsRead(false);
        return notificationRepository.save(n);
    }

    public Notification createPurchaseOrderSentNotification(Long purchaseOrderId,
                                                             String orderNumber, String vendorName) {
        Notification n = new Notification();
        n.setAlertType(AlertType.PURCHASE_ORDER_SENT);
        n.setTitle("Purchase Order Sent: " + orderNumber);
        n.setMessage(String.format("Purchase order '%s' has been sent to vendor '%s'.",
                orderNumber, vendorName));
        n.setPurchaseOrderId(purchaseOrderId);
        n.setIsRead(false);
        return notificationRepository.save(n);
    }

    public Notification createVendorResponseNotification(Long purchaseOrderId,
                                                          String orderNumber, String vendorName) {
        Notification n = new Notification();
        n.setAlertType(AlertType.VENDOR_RESPONSE_RECEIVED);
        n.setTitle("Vendor Response: " + orderNumber);
        n.setMessage(String.format("Vendor '%s' has responded to purchase order '%s'.",
                vendorName, orderNumber));
        n.setPurchaseOrderId(purchaseOrderId);
        n.setIsRead(false);
        return notificationRepository.save(n);
    }

    public Notification createRestockSuggestionNotification(int suggestionCount) {
        Notification n = new Notification();
        n.setAlertType(AlertType.RESTOCK_SUGGESTION);
        n.setTitle("AI Restock Suggestions Available");
        n.setMessage(suggestionCount + " product(s) have been identified for restocking.");
        n.setIsRead(false);
        return notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto.Response> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto.Response> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    @Transactional
    public NotificationDto.Response markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead() {
        return notificationRepository.markAllAsRead();
    }

    private NotificationDto.Response toDto(Notification n) {
        NotificationDto.Response response = new NotificationDto.Response();
        response.setId(n.getId());
        response.setAlertType(n.getAlertType());
        response.setTitle(n.getTitle());
        response.setMessage(n.getMessage());
        response.setIsRead(n.getIsRead());
        response.setProductId(n.getProductId());
        response.setPurchaseOrderId(n.getPurchaseOrderId());
        response.setVendorId(n.getVendorId());
        response.setCreatedAt(n.getCreatedAt());
        response.setReadAt(n.getReadAt());
        return response;
    }
}