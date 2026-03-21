package backend.dto;

import backend.enums.OrderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {

        @NotNull(message = "Vendor is required")
        private Long vendorId;

        @NotEmpty(message = "At least one item is required")
        private List<ItemRequest> items;

        private String notes;
        private LocalDateTime expectedDeliveryDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemRequest {

        @NotNull(message = "Product is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer orderedQuantity;

        private BigDecimal unitPrice;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String orderNumber;
        private VendorDto.Response vendor;
        private OrderStatus status;
        private List<ItemResponse> items;
        private String notes;
        private LocalDateTime sentAt;
        private LocalDateTime expectedDeliveryDate;
        private Boolean emailSent;
        private Boolean smsSent;
        private Boolean aiGenerated;
        private BigDecimal totalValue;
        private List<VendorResponseDto.Response> vendorResponses;
        private String createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private Integer orderedQuantity;
        private Integer receivedQuantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SendRequest {
        @Builder.Default
        private boolean sendEmail = true;
        @Builder.Default
        private boolean sendSms = true;
        private String customMessage;
    }
}