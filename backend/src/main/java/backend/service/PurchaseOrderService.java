package backend.service;

import backend.dto.PurchaseOrderDto;
import backend.dto.VendorResponseDto;
import backend.entity.*;
import backend.enums.OrderStatus;
import backend.repository.ProductRepository;
import backend.repository.PurchaseOrderRepository;
import backend.repository.VendorResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final VendorResponseRepository vendorResponseRepository;
    private final ProductRepository productRepository;
    private final VendorService vendorService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationService notificationService;

    // ─── Create ──────────────────────────────────────────────────────────────

    @Transactional
    public PurchaseOrderDto.Response createPurchaseOrder(PurchaseOrderDto.Request request, String createdBy) {
        Vendor vendor = vendorService.findOrThrow(request.getVendorId());

        PurchaseOrder order = PurchaseOrder.builder()
                .orderNumber(generateOrderNumber())
                .vendor(vendor)
                .status(OrderStatus.DRAFT)
                .notes(request.getNotes())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .createdBy(createdBy)
                .build();

        for (PurchaseOrderDto.ItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order)
                    .product(product)
                    .orderedQuantity(itemReq.getOrderedQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .build();

            order.getItems().add(item);
        }

        PurchaseOrder saved = purchaseOrderRepository.save(order);
        log.info("Purchase order {} created by {}", saved.getOrderNumber(), createdBy);
        return toDto(saved);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto.Response> getAllOrders(Pageable pageable) {
        return purchaseOrderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto.Response getOrderById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderDto.Response> getOrdersByStatus(OrderStatus status) {
        return purchaseOrderRepository.findByStatus(status)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─── Send (Email + SMS) ───────────────────────────────────────────────────

    @Transactional
    public PurchaseOrderDto.Response sendPurchaseOrder(Long id, PurchaseOrderDto.SendRequest sendRequest) {
        PurchaseOrder order = findOrThrow(id);

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.FULFILLED) {
            throw new RuntimeException("Cannot send a " + order.getStatus() + " purchase order.");
        }

        if (sendRequest.isSendEmail()) {
            emailService.sendPurchaseOrderEmail(order, sendRequest.getCustomMessage());
            order.setEmailSent(true);
        }

        if (sendRequest.isSendSms()) {
            smsService.sendPurchaseOrderSms(order, sendRequest.getCustomMessage());
            order.setSmsSent(true);
        }

        order.setStatus(OrderStatus.SENT);
        order.setSentAt(LocalDateTime.now());

        PurchaseOrder saved = purchaseOrderRepository.save(order);

        // Trigger notification for bell dropdown
        notificationService.createPurchaseOrderSentNotification(
                saved.getId(), saved.getOrderNumber(), saved.getVendor().getName()
        );

        log.info("Purchase order {} sent to vendor {}", saved.getOrderNumber(), saved.getVendor().getName());
        return toDto(saved);
    }

    // ─── Vendor Response Tracking ─────────────────────────────────────────────

    @Transactional
    public VendorResponseDto.Response addVendorResponse(Long orderId, VendorResponseDto.Request request) {
        PurchaseOrder order = findOrThrow(orderId);

        // Auto-advance status to ACKNOWLEDGED if still SENT
        if (order.getStatus() == OrderStatus.SENT) {
            order.setStatus(OrderStatus.ACKNOWLEDGED);
            purchaseOrderRepository.save(order);
        }

        VendorResponse response = VendorResponse.builder()
                .purchaseOrder(order)
                .responseMessage(request.getResponseMessage())
                .estimatedDelivery(request.getEstimatedDelivery())
                .respondedBy(request.getRespondedBy())
                .channel(request.getChannel())
                .build();

        VendorResponse saved = vendorResponseRepository.save(response);

        notificationService.createVendorResponseNotification(
                order.getId(), order.getOrderNumber(), order.getVendor().getName()
        );

        log.info("Vendor response logged for PO {}", order.getOrderNumber());
        return toVendorResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<VendorResponseDto.Response> getVendorResponses(Long orderId) {
        return vendorResponseRepository.findByPurchaseOrderIdOrderByRespondedAtDesc(orderId)
                .stream().map(this::toVendorResponseDto).collect(Collectors.toList());
    }

    // ─── Status Update ────────────────────────────────────────────────────────

    @Transactional
    public PurchaseOrderDto.Response updateOrderStatus(Long id, OrderStatus newStatus) {
        PurchaseOrder order = findOrThrow(id);
        order.setStatus(newStatus);
        return toDto(purchaseOrderRepository.save(order));
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    @Transactional
    public PurchaseOrderDto.Response cancelOrder(Long id) {
        PurchaseOrder order = findOrThrow(id);
        if (order.getStatus() == OrderStatus.FULFILLED) {
            throw new RuntimeException("Cannot cancel a fulfilled purchase order.");
        }
        order.setStatus(OrderStatus.CANCELLED);
        return toDto(purchaseOrderRepository.save(order));
    }

    // ─── Order Number Generator ───────────────────────────────────────────────

    private String generateOrderNumber() {
        String datePrefix = "PO-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        long count = purchaseOrderRepository.countByOrderNumberPrefix(datePrefix);
        return datePrefix + String.format("%03d", count + 1);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private PurchaseOrder findOrThrow(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found: " + id));
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    public PurchaseOrderDto.Response toDto(PurchaseOrder order) {
        List<PurchaseOrderDto.ItemResponse> itemResponses = order.getItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());

        BigDecimal totalValue = itemResponses.stream()
                .map(i -> i.getLineTotal() != null ? i.getLineTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<VendorResponseDto.Response> vendorResponses = order.getVendorResponses() == null
                ? List.of()
                : order.getVendorResponses().stream().map(this::toVendorResponseDto).collect(Collectors.toList());

        return PurchaseOrderDto.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .vendor(vendorService.toDto(order.getVendor()))
                .status(order.getStatus())
                .items(itemResponses)
                .notes(order.getNotes())
                .sentAt(order.getSentAt())
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .emailSent(order.getEmailSent())
                .smsSent(order.getSmsSent())
                .aiGenerated(order.getAiGenerated())
                .totalValue(totalValue)
                .vendorResponses(vendorResponses)
                .createdBy(order.getCreatedBy())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private PurchaseOrderDto.ItemResponse toItemDto(PurchaseOrderItem item) {
        BigDecimal lineTotal = item.getUnitPrice() != null
                ? item.getUnitPrice().multiply(BigDecimal.valueOf(item.getOrderedQuantity()))
                : null;

        return PurchaseOrderDto.ItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .orderedQuantity(item.getOrderedQuantity())
                .receivedQuantity(item.getReceivedQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(lineTotal)
                .build();
    }

    private VendorResponseDto.Response toVendorResponseDto(VendorResponse vr) {
        return VendorResponseDto.Response.builder()
                .id(vr.getId())
                .purchaseOrderId(vr.getPurchaseOrder().getId())
                .responseMessage(vr.getResponseMessage())
                .estimatedDelivery(vr.getEstimatedDelivery())
                .respondedBy(vr.getRespondedBy())
                .channel(vr.getChannel())
                .respondedAt(vr.getRespondedAt())
                .build();
    }
}