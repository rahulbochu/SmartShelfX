package backend.dto;

import backend.enums.TransactionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockTransactionRequest {

    private Long productId;
    private TransactionType type;   // IN or OUT only
    private Integer quantity;
    private Long handledById;
    private String reason;
    private String referenceNumber;
}