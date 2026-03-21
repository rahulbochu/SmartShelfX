package backend.service;

import backend.entity.PurchaseOrder;
import backend.entity.PurchaseOrderItem;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    private boolean twilioReady = false;

    // ─── Init — safe even with dummy/missing credentials ─────────────────────

    @PostConstruct
    public void initTwilio() {
        if (accountSid.isBlank() || authToken.isBlank()
                || accountSid.startsWith("TEST") || authToken.startsWith("TEST")) {
            log.warn("Twilio credentials not configured or are test values. SMS will be skipped.");
            twilioReady = false;
            return;
        }
        try {
            Twilio.init(accountSid, authToken);
            twilioReady = true;
            log.info("Twilio SMS service initialized.");
        } catch (Exception e) {
            log.error("Twilio initialization failed: {}", e.getMessage());
            twilioReady = false;
        }
    }

    // ─── Purchase Order SMS ───────────────────────────────────────────────────

    @Async
    public void sendPurchaseOrderSms(PurchaseOrder order, String customMessage) {
        String vendorPhone = order.getVendor().getPhoneNumber();
        if (vendorPhone == null || vendorPhone.isBlank()) {
            log.warn("Vendor '{}' has no phone number. Skipping SMS for PO {}.",
                    order.getVendor().getName(), order.getOrderNumber());
            return;
        }
        String body = (customMessage != null && !customMessage.isBlank())
                ? customMessage
                : buildPoSmsBody(order);
        sendSms(vendorPhone, body);
    }

    // ─── Low Stock Alert SMS ──────────────────────────────────────────────────

    @Async
    public void sendLowStockAlertSms(String recipientPhone, String productName,
                                      int currentStock, int reorderLevel) {
        if (recipientPhone == null || recipientPhone.isBlank()) return;
        sendSms(recipientPhone, String.format(
                "[SmartShelf] LOW STOCK: '%s' has %d unit(s) left (reorder level: %d). Please create a PO.",
                productName, currentStock, reorderLevel
        ));
    }

    // ─── Expiry Alert SMS ─────────────────────────────────────────────────────

    @Async
    public void sendExpiryAlertSms(String recipientPhone, String productName, int daysRemaining) {
        if (recipientPhone == null || recipientPhone.isBlank()) return;
        sendSms(recipientPhone, String.format(
                "[SmartShelf] EXPIRY ALERT: '%s' expires in %d day(s). Please take action.",
                productName, daysRemaining
        ));
    }

    // ─── Core Send ────────────────────────────────────────────────────────────

    private void sendSms(String toNumber, String body) {
        if (!twilioReady) {
            log.warn("Twilio not ready — skipping SMS to {}.", toNumber);
            return;
        }
        try {
            Message message = Message.creator(
                    new PhoneNumber(toNumber),
                    new PhoneNumber(fromNumber),
                    body
            ).create();
            log.info("SMS sent to {}. SID: {}", toNumber, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", toNumber, e.getMessage());
            // Don't rethrow — SMS failure must never break the main transaction
        }
    }

    // ─── Body Builder ─────────────────────────────────────────────────────────

    private String buildPoSmsBody(PurchaseOrder order) {
        StringBuilder sb = new StringBuilder();
        sb.append("[SmartShelf] Purchase Order: ").append(order.getOrderNumber()).append("\n");
        sb.append("Vendor: ").append(order.getVendor().getName()).append("\n");
        sb.append("Items:\n");
        for (PurchaseOrderItem item : order.getItems()) {
            sb.append("- ").append(item.getProduct().getName())
              .append(" x").append(item.getOrderedQuantity()).append("\n");
        }
        if (order.getExpectedDeliveryDate() != null) {
            sb.append("Expected by: ").append(order.getExpectedDeliveryDate().toLocalDate()).append("\n");
        }
        sb.append("Please confirm receipt.");
        return sb.toString();
    }
}