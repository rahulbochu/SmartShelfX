package backend.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRestockSuggestionDto {

    private Long productId;
    private String productName;
    private String productSku;
    private String category;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer suggestedQuantity;
    private String reason;
    private Long vendorId;
    private String vendorName;
    private Integer urgencyScore;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkResponse {
        private List<AIRestockSuggestionDto> suggestions;
        private int totalSuggestions;
        private String generatedBy;
    }
}