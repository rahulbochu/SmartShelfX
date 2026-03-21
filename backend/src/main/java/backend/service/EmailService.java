package backend.service;

import backend.entity.PurchaseOrder;
import backend.entity.PurchaseOrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class EmailService {

    // Optional injection — null when mail is excluded (e.g. in tests)
    @Autowired(required = false)
    private JavaMailSender mailSender;

    private boolean isMailReady() {
        return mailSender != null;
    }

    // ─── Purchase Order Email ─────────────────────────────────────────────────

    @Async
    public void sendPurchaseOrderEmail(PurchaseOrder order, String customMessage) {
        if (!isMailReady()) {
            log.warn("Mail not configured. Skipping PO email for {}.", order.getOrderNumber());
            return;
        }
        String vendorEmail = order.getVendor().getEmail();
        if (vendorEmail == null || vendorEmail.isBlank()) {
            log.warn("Vendor '{}' has no email. Skipping PO email for {}.",
                    order.getVendor().getName(), order.getOrderNumber());
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(vendorEmail);
            helper.setSubject("Purchase Order: " + order.getOrderNumber());
            helper.setText(buildPoEmailBody(order, customMessage), true);
            mailSender.send(message);
            log.info("PO email sent to {} for order {}.", vendorEmail, order.getOrderNumber());
        } catch (MessagingException e) {
            log.error("Failed to send PO email for order {}: {}", order.getOrderNumber(), e.getMessage());
        }
    }

    // ─── Low Stock Alert Email ────────────────────────────────────────────────

    @Async
    public void sendLowStockAlertEmail(String recipientEmail, String productName,
                                        int currentStock, int reorderLevel) {
        if (!isMailReady() || recipientEmail == null || recipientEmail.isBlank()) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setSubject("⚠️ Low Stock Alert: " + productName);
            helper.setText(buildLowStockEmailBody(productName, currentStock, reorderLevel), true);
            mailSender.send(message);
            log.info("Low stock alert email sent to {} for '{}'.", recipientEmail, productName);
        } catch (MessagingException e) {
            log.error("Failed to send low stock alert email: {}", e.getMessage());
        }
    }

    // ─── Expiry Alert Email ───────────────────────────────────────────────────

    @Async
    public void sendExpiryAlertEmail(String recipientEmail, String productName,
                                      String expiryDate, int daysRemaining) {
        if (!isMailReady() || recipientEmail == null || recipientEmail.isBlank()) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setSubject("⚠️ Expiry Alert: " + productName + " expires in " + daysRemaining + " day(s)");
            helper.setText(buildExpiryEmailBody(productName, expiryDate, daysRemaining), true);
            mailSender.send(message);
            log.info("Expiry alert email sent to {} for '{}'.", recipientEmail, productName);
        } catch (MessagingException e) {
            log.error("Failed to send expiry alert email: {}", e.getMessage());
        }
    }

    // ─── HTML Templates ───────────────────────────────────────────────────────

    private String buildPoEmailBody(PurchaseOrder order, String customMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("<html><body style='font-family:Arial,sans-serif;color:#333;'>");
        sb.append("<h2 style='color:#2c3e50;'>Purchase Order: ").append(order.getOrderNumber()).append("</h2>");
        String contact = order.getVendor().getContactPerson() != null
                ? order.getVendor().getContactPerson() : order.getVendor().getName();
        sb.append("<p>Dear <strong>").append(contact).append("</strong>,</p>");
        if (customMessage != null && !customMessage.isBlank()) {
            sb.append("<p>").append(customMessage).append("</p>");
        } else {
            sb.append("<p>Please find below our purchase order. Kindly confirm receipt and expected delivery date.</p>");
        }
        sb.append("<h3>Order Items</h3>");
        sb.append("<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse;width:100%;'>");
        sb.append("<thead style='background:#2c3e50;color:white;'>");
        sb.append("<tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>");
        sb.append("</thead><tbody>");
        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderItem item : order.getItems()) {
            BigDecimal lineTotal = item.getUnitPrice() != null
                    ? item.getUnitPrice().multiply(BigDecimal.valueOf(item.getOrderedQuantity()))
                    : BigDecimal.ZERO;
            total = total.add(lineTotal);
            sb.append("<tr>")
              .append("<td>").append(item.getProduct().getName()).append("</td>")
              .append("<td>").append(item.getProduct().getSku() != null ? item.getProduct().getSku() : "-").append("</td>")
              .append("<td>").append(item.getOrderedQuantity()).append("</td>")
              .append("<td>").append(item.getUnitPrice() != null ? item.getUnitPrice() : "-").append("</td>")
              .append("<td>").append(lineTotal.compareTo(BigDecimal.ZERO) > 0 ? lineTotal : "-").append("</td>")
              .append("</tr>");
        }
        sb.append("</tbody><tfoot><tr><td colspan='4'><strong>Total</strong></td><td><strong>")
          .append(total).append("</strong></td></tr></tfoot></table>");
        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            sb.append("<p><strong>Notes:</strong> ").append(order.getNotes()).append("</p>");
        }
        if (order.getExpectedDeliveryDate() != null) {
            sb.append("<p><strong>Expected Delivery:</strong> ")
              .append(order.getExpectedDeliveryDate().toLocalDate()).append("</p>");
        }
        sb.append("<br/><p>Please reply to confirm.</p>");
        sb.append("<p style='color:#7f8c8d;font-size:12px;'>SmartShelf Inventory System</p>");
        sb.append("</body></html>");
        return sb.toString();
    }

    private String buildLowStockEmailBody(String productName, int currentStock, int reorderLevel) {
        return "<html><body style='font-family:Arial,sans-serif;'>"
                + "<h2 style='color:#e74c3c;'>⚠️ Low Stock Alert</h2>"
                + "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse;'>"
                + "<tr><td><strong>Product</strong></td><td>" + productName + "</td></tr>"
                + "<tr><td><strong>Current Stock</strong></td><td style='color:red;'>" + currentStock + "</td></tr>"
                + "<tr><td><strong>Reorder Level</strong></td><td>" + reorderLevel + "</td></tr>"
                + "</table><p>Please create a purchase order to replenish stock.</p>"
                + "<p style='color:#7f8c8d;font-size:12px;'>SmartShelf Inventory System</p></body></html>";
    }

    private String buildExpiryEmailBody(String productName, String expiryDate, int daysRemaining) {
        String color = daysRemaining <= 7 ? "#e74c3c" : "#e67e22";
        return "<html><body style='font-family:Arial,sans-serif;'>"
                + "<h2 style='color:" + color + ";'>⚠️ Product Expiry Alert</h2>"
                + "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse;'>"
                + "<tr><td><strong>Product</strong></td><td>" + productName + "</td></tr>"
                + "<tr><td><strong>Expiry Date</strong></td><td style='color:" + color + ";'>" + expiryDate + "</td></tr>"
                + "<tr><td><strong>Days Remaining</strong></td><td style='color:" + color + ";'>" + daysRemaining + "</td></tr>"
                + "</table><p>Please take action before the product expires.</p>"
                + "<p style='color:#7f8c8d;font-size:12px;'>SmartShelf Inventory System</p></body></html>";
    }
}