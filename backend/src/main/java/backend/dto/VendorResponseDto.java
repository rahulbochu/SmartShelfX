package backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

public class VendorResponseDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {

        @NotBlank(message = "Response message is required")
        private String responseMessage;

        private LocalDateTime estimatedDelivery;
        private String respondedBy;
        private String channel;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long purchaseOrderId;
        private String responseMessage;
        private LocalDateTime estimatedDelivery;
        private String respondedBy;
        private String channel;
        private LocalDateTime respondedAt;
    }
}