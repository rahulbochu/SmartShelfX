package backend.dto;

import backend.enums.TransactionType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class StockMovementReportDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Row {
        private Long transactionId;
        private Long productId;
        private String productName;
        private String sku;
        private String category;
        private TransactionType type;
        private Integer quantity;
        private Integer stockAfter;
        private String handledBy;
        private String reason;
        private String referenceNumber;
        private LocalDateTime timestamp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private int totalIn;
        private int totalOut;
        private int netMovement;
        private long totalTransactions;
        private List<Row> transactions;
        private String fromDate;
        private String toDate;
    }
}