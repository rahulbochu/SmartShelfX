package backend.scheduler;

import backend.entity.Product;
import backend.entity.User;
import backend.enums.Role;
import backend.repository.ProductRepository;
import backend.repository.UserRepository;
import backend.service.AIRestockService;
import backend.service.EmailService;
import backend.service.NotificationService;
import backend.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertSchedulerService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final AIRestockService aiRestockService;

    @Value("${inventory.expiry-warning-days:30}")
    private int expiryWarningDays;

    @Scheduled(cron = "0 0 8 * * *")
    public void checkLowStockAlerts() {
        log.info("Running scheduled low-stock check...");
        List<Product> lowStockProducts = productRepository.findLowStockProducts();

        if (lowStockProducts.isEmpty()) {
            log.info("No low-stock products found.");
            return;
        }

        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (Product product : lowStockProducts) {
            notificationService.createLowStockNotification(
                    product.getId(), product.getName(),
                    product.getCurrentStock(), product.getReorderLevel());

            for (User admin : admins) {
                if (admin.getEmail() != null)
                    emailService.sendLowStockAlertEmail(admin.getEmail(), product.getName(),
                            product.getCurrentStock(), product.getReorderLevel());
                if (admin.getPhoneNumber() != null)
                    smsService.sendLowStockAlertSms(admin.getPhoneNumber(), product.getName(),
                            product.getCurrentStock(), product.getReorderLevel());
            }
        }
        log.info("Low-stock check complete. {} product(s) flagged.", lowStockProducts.size());
    }

    @Scheduled(cron = "0 30 8 * * *")
    public void checkExpiryAlerts() {
        log.info("Running scheduled expiry check...");
        LocalDate warningDate = LocalDate.now().plusDays(expiryWarningDays);
        List<Product> expiringProducts = productRepository.findExpiringProducts(warningDate);

        if (expiringProducts.isEmpty()) {
            log.info("No expiring products found within {} days.", expiryWarningDays);
            return;
        }

        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (Product product : expiringProducts) {
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), product.getExpiryDate());
            String expiryDateStr = product.getExpiryDate().toString();

            notificationService.createExpiryNotification(
                    product.getId(), product.getName(), expiryDateStr, (int) daysRemaining);

            for (User admin : admins) {
                if (admin.getEmail() != null)
                    emailService.sendExpiryAlertEmail(admin.getEmail(), product.getName(),
                            expiryDateStr, (int) daysRemaining);
                if (admin.getPhoneNumber() != null)
                    smsService.sendExpiryAlertSms(admin.getPhoneNumber(), product.getName(),
                            (int) daysRemaining);
            }
        }
        log.info("Expiry check complete. {} product(s) flagged.", expiringProducts.size());
    }

    @Scheduled(cron = "0 0 9 * * MON")
    public void generateWeeklyRestockSuggestions() {
        log.info("Generating weekly AI restock suggestions...");
        AIRestockService.BulkResult suggestions = aiRestockService.getSuggestions();

        if (suggestions.getTotalSuggestions() > 0) {
            notificationService.createRestockSuggestionNotification(suggestions.getTotalSuggestions());
            log.info("AI restock suggestions ready: {} item(s).", suggestions.getTotalSuggestions());
        } else {
            log.info("No restock suggestions needed this week.");
        }
    }
}