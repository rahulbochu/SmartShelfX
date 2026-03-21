package backend.dto;

import lombok.*;

import java.util.List;

public class ChartDataDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DataPoint {
        private String label;
        private Number value;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LineChart {
        private String title;
        private List<String> labels;
        private List<Number> inValues;
        private List<Number> outValues;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BarChart {
        private String title;
        private List<DataPoint> data;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PieChart {
        private String title;
        private List<DataPoint> data;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardSummary {
        private long totalProducts;
        private long lowStockCount;
        private long expiringCount;
        private long expiredCount;
        private long pendingPurchaseOrders;
        private long unreadNotifications;
        private int totalStockIn;
        private int totalStockOut;
    }
}