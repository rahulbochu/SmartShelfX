package backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class SalesReportDto {

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
        private int totalUnitsSold;
        private BigDecimal unitPrice;
        private BigDecimal totalRevenue;
        private String vendorName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private BigDecimal totalRevenue;
        private int totalUnitsSold;
        private int totalProducts;
        private String topSellingProduct;
        private List<Row> items;
        private String fromDate;
        private String toDate;
    }
}