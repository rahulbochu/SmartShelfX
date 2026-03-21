package backend.dto;

import backend.enums.TransactionType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class StockTransactionResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private TransactionType type;
    private Integer quantity;
    private Integer stockAfterTransaction;
    private String handledBy;
    private String reason;
    private String referenceNumber;
    private LocalDateTime timestamp;
}