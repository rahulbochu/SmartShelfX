package backend.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

public class ExpiryReportDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Row {
        private Long productId;
        private String productName;
        private String sku;
        private String category;
        private Integer currentStock;
        private LocalDate expiryDate;
        private long daysRemaining;
        private String status;
        private String vendorName;
        private Long vendorId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private int totalExpired;
        private int totalCritical;
        private int totalWarning;
        private List<Row> items;
    }
}