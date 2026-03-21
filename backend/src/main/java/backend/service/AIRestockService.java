package backend.service;

import backend.dto.AIRestockSuggestionDto;
import backend.entity.Product;
import backend.repository.ProductRepository;
import backend.repository.StockTransactionRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIRestockService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;

    @Value("${ai.provider:rule-based}")
    private String aiProvider;

    // Simple wrapper so AlertSchedulerService can call getTotalSuggestions()
    @Getter
    public static class BulkResult {
        private final List<AIRestockSuggestionDto> suggestions;
        private final int totalSuggestions;
        private final String generatedBy;

        public BulkResult(List<AIRestockSuggestionDto> suggestions, String generatedBy) {
            this.suggestions = suggestions;
            this.totalSuggestions = suggestions.size();
            this.generatedBy = generatedBy;
        }
    }

    public BulkResult getSuggestions() {
        List<Product> lowStockProducts = productRepository.findLowStockProducts();

        if (lowStockProducts.isEmpty()) {
            return new BulkResult(List.of(), aiProvider);
        }

        List<AIRestockSuggestionDto> suggestions = generateRuleBased(lowStockProducts);
        suggestions.sort(Comparator.comparingInt(AIRestockSuggestionDto::getUrgencyScore).reversed());
        return new BulkResult(suggestions, aiProvider);
    }

    // For the REST API response — returns the DTO format
    public AIRestockSuggestionDto.BulkResponse getSuggestionsDto() {
        BulkResult result = getSuggestions();
        AIRestockSuggestionDto.BulkResponse response = new AIRestockSuggestionDto.BulkResponse();
        response.setSuggestions(result.getSuggestions());
        response.setTotalSuggestions(result.getTotalSuggestions());
        response.setGeneratedBy(result.getGeneratedBy());
        return response;
    }

    private List<AIRestockSuggestionDto> generateRuleBased(List<Product> products) {
        List<AIRestockSuggestionDto> suggestions = new ArrayList<>();

        for (Product product : products) {
            int currentStock = product.getCurrentStock();
            int reorderLevel = product.getReorderLevel();
            int reorderQty   = product.getReorderQuantity() != null ? product.getReorderQuantity() : 50;

            Integer outLast30Days = stockTransactionRepository
                    .sumOutgoingQuantitySince(product.getId(), LocalDateTime.now().minusDays(30));
            int monthlyUsage = outLast30Days != null ? outLast30Days : 0;

            int suggestedQty = Math.max(reorderQty, monthlyUsage * 2);

            int urgency;
            if (currentStock == 0)                    urgency = 10;
            else if (currentStock <= reorderLevel / 2) urgency = 8;
            else if (currentStock <= reorderLevel)     urgency = 6;
            else                                       urgency = 4;

            String reason = buildReason(currentStock, reorderLevel, monthlyUsage, suggestedQty);

            AIRestockSuggestionDto dto = new AIRestockSuggestionDto();
            dto.setProductId(product.getId());
            dto.setProductName(product.getName());
            dto.setProductSku(product.getSku());
            dto.setCategory(product.getCategory());
            dto.setCurrentStock(currentStock);
            dto.setReorderLevel(reorderLevel);
            dto.setSuggestedQuantity(suggestedQty);
            dto.setReason(reason);
            dto.setVendorId(product.getVendor() != null ? product.getVendor().getId() : null);
            dto.setVendorName(product.getVendor() != null ? product.getVendor().getName() : null);
            dto.setUrgencyScore(urgency);
            suggestions.add(dto);
        }
        return suggestions;
    }

    private String buildReason(int currentStock, int reorderLevel, int monthlyUsage, int suggestedQty) {
        StringBuilder sb = new StringBuilder();
        if (currentStock == 0) sb.append("Out of stock. ");
        else sb.append(String.format("Stock at %d units (reorder level: %d). ", currentStock, reorderLevel));
        if (monthlyUsage > 0) sb.append(String.format("30-day usage: %d units. ", monthlyUsage));
        sb.append(String.format("Suggested order: %d units.", suggestedQty));
        return sb.toString();
    }
}