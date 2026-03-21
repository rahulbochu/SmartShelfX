package backend.service;

import backend.dto.ChartDataDto;
import backend.dto.ExpiryReportDto;
import backend.dto.SalesReportDto;
import backend.dto.StockMovementReportDto;
import backend.entity.Product;
import backend.entity.StockTransaction;
import backend.enums.OrderStatus;
import backend.enums.TransactionType;
import backend.repository.NotificationRepository;
import backend.repository.ProductRepository;
import backend.repository.PurchaseOrderRepository;
import backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final NotificationRepository notificationRepository;

    // ─── Stock Movement Report ────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StockMovementReportDto.Summary getStockMovementReport(
            LocalDateTime from, LocalDateTime to, Long productId) {

        List<StockTransaction> transactions = productId != null
                ? reportRepository.findByProductAndRange(productId, from, to)
                : reportRepository.findAllInRange(from, to);

        List<StockMovementReportDto.Row> rows = new ArrayList<>();
        int totalIn = 0, totalOut = 0;

        for (StockTransaction t : transactions) {
            StockMovementReportDto.Row row = new StockMovementReportDto.Row();
            row.setTransactionId(t.getId());
            row.setProductId(t.getProduct().getId());
            row.setProductName(t.getProduct().getName());
            row.setSku(t.getProduct().getSku());
            row.setCategory(t.getProduct().getCategory());
            row.setType(t.getType());
            row.setQuantity(t.getQuantity());
            row.setStockAfter(t.getProduct().getCurrentStock());
            row.setHandledBy(t.getHandledBy() != null ? t.getHandledBy().getUsername() : "system");
            row.setReason(t.getReason());
            row.setReferenceNumber(t.getReferenceNumber());
            row.setTimestamp(t.getTimestamp());
            rows.add(row);

            if (t.getType() == TransactionType.IN)  totalIn  += t.getQuantity();
            if (t.getType() == TransactionType.OUT) totalOut += t.getQuantity();
        }

        StockMovementReportDto.Summary summary = new StockMovementReportDto.Summary();
        summary.setTotalIn(totalIn);
        summary.setTotalOut(totalOut);
        summary.setNetMovement(totalIn - totalOut);
        summary.setTotalTransactions(rows.size());
        summary.setTransactions(rows);
        summary.setFromDate(from.toLocalDate().toString());
        summary.setToDate(to.toLocalDate().toString());
        return summary;
    }

    // ─── Expiry Report ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExpiryReportDto.Summary getExpiryReport() {
        List<Product> perishables = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .filter(p -> Boolean.TRUE.equals(p.getIsPerishable()))
                .filter(p -> p.getExpiryDate() != null)
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        List<ExpiryReportDto.Row> rows = new ArrayList<>();
        int expired = 0, critical = 0, warning = 0;

        for (Product p : perishables) {
            long daysRemaining = ChronoUnit.DAYS.between(today, p.getExpiryDate());
            String status;

            if (daysRemaining < 0)       { status = "EXPIRED";  expired++;  }
            else if (daysRemaining <= 7)  { status = "CRITICAL"; critical++; }
            else if (daysRemaining <= 30) { status = "WARNING";  warning++;  }
            else continue;

            ExpiryReportDto.Row row = new ExpiryReportDto.Row();
            row.setProductId(p.getId());
            row.setProductName(p.getName());
            row.setSku(p.getSku());
            row.setCategory(p.getCategory());
            row.setCurrentStock(p.getCurrentStock());
            row.setExpiryDate(p.getExpiryDate());
            row.setDaysRemaining(daysRemaining);
            row.setStatus(status);
            row.setVendorName(p.getVendor() != null ? p.getVendor().getName() : "N/A");
            row.setVendorId(p.getVendor() != null ? p.getVendor().getId() : null);
            rows.add(row);
        }

        rows.sort(Comparator.comparingLong(ExpiryReportDto.Row::getDaysRemaining));

        ExpiryReportDto.Summary summary = new ExpiryReportDto.Summary();
        summary.setTotalExpired(expired);
        summary.setTotalCritical(critical);
        summary.setTotalWarning(warning);
        summary.setItems(rows);
        return summary;
    }

    // ─── Sales Report ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SalesReportDto.Summary getSalesReport(LocalDateTime from, LocalDateTime to) {
        List<Object[]> rawSales = reportRepository.findSalesByProductInRange(from, to);

        List<SalesReportDto.Row> rows = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalUnitsSold = 0;
        String topProduct = null;
        int topQty = 0;

        for (Object[] raw : rawSales) {
            Long productId  = (Long) raw[0];
            int  unitsSold  = ((Number) raw[1]).intValue();

            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) continue;
            Product product = productOpt.get();

            BigDecimal unitPrice = product.getPrice() != null
                    ? BigDecimal.valueOf(product.getPrice()) : BigDecimal.ZERO;
            BigDecimal revenue = unitPrice.multiply(BigDecimal.valueOf(unitsSold));

            SalesReportDto.Row row = new SalesReportDto.Row();
            row.setProductId(productId);
            row.setProductName(product.getName());
            row.setSku(product.getSku());
            row.setCategory(product.getCategory());
            row.setTotalUnitsSold(unitsSold);
            row.setUnitPrice(unitPrice);
            row.setTotalRevenue(revenue);
            row.setVendorName(product.getVendor() != null ? product.getVendor().getName() : "N/A");
            rows.add(row);

            totalRevenue = totalRevenue.add(revenue);
            totalUnitsSold += unitsSold;
            if (unitsSold > topQty) { topQty = unitsSold; topProduct = product.getName(); }
        }

        rows.sort(Comparator.comparing(SalesReportDto.Row::getTotalRevenue).reversed());

        SalesReportDto.Summary summary = new SalesReportDto.Summary();
        summary.setTotalRevenue(totalRevenue);
        summary.setTotalUnitsSold(totalUnitsSold);
        summary.setTotalProducts(rows.size());
        summary.setTopSellingProduct(topProduct);
        summary.setItems(rows);
        summary.setFromDate(from.toLocalDate().toString());
        summary.setToDate(to.toLocalDate().toString());
        return summary;
    }

    // ─── Charts ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ChartDataDto.LineChart getStockMovementLineChart(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> raw  = reportRepository.findDailyMovementSince(since);

        Map<String, Integer> inMap  = new LinkedHashMap<>();
        Map<String, Integer> outMap = new LinkedHashMap<>();

        for (Object[] row : raw) {
            String date = row[0].toString();
            String type = row[1].toString();
            int qty     = ((Number) row[2]).intValue();
            if ("IN".equals(type))  inMap.put(date, qty);
            if ("OUT".equals(type)) outMap.put(date, qty);
        }

        Set<String> allDates = new LinkedHashSet<>();
        allDates.addAll(inMap.keySet());
        allDates.addAll(outMap.keySet());
        List<String> labels = new ArrayList<>(allDates);
        Collections.sort(labels);

        List<Number> inValues  = new ArrayList<>();
        List<Number> outValues = new ArrayList<>();
        for (String d : labels) {
            inValues.add(inMap.getOrDefault(d, 0));
            outValues.add(outMap.getOrDefault(d, 0));
        }

        ChartDataDto.LineChart chart = new ChartDataDto.LineChart();
        chart.setTitle("Stock Movement — Last " + days + " Days");
        chart.setLabels(labels);
        chart.setInValues(inValues);
        chart.setOutValues(outValues);
        return chart;
    }

    @Transactional(readOnly = true)
    public ChartDataDto.BarChart getTopSellingProductsChart(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> raw  = reportRepository.findTopSellingProducts(since);

        List<ChartDataDto.DataPoint> data = new ArrayList<>();
        int limit = Math.min(10, raw.size());
        for (int i = 0; i < limit; i++) {
            Object[] row = raw.get(i);
            ChartDataDto.DataPoint dp = new ChartDataDto.DataPoint();
            dp.setLabel((String) row[0]);
            dp.setValue(((Number) row[1]).intValue());
            data.add(dp);
        }

        ChartDataDto.BarChart chart = new ChartDataDto.BarChart();
        chart.setTitle("Top Selling Products — Last " + days + " Days");
        chart.setData(data);
        return chart;
    }

    @Transactional(readOnly = true)
    public ChartDataDto.PieChart getStockByCategoryChart() {
        List<Object[]> raw = reportRepository.findStockByCategory();

        List<ChartDataDto.DataPoint> data = new ArrayList<>();
        for (Object[] row : raw) {
            ChartDataDto.DataPoint dp = new ChartDataDto.DataPoint();
            dp.setLabel(row[0] != null ? (String) row[0] : "Uncategorised");
            dp.setValue(((Number) row[1]).intValue());
            data.add(dp);
        }

        ChartDataDto.PieChart chart = new ChartDataDto.PieChart();
        chart.setTitle("Current Stock by Category");
        chart.setData(data);
        return chart;
    }

    @Transactional(readOnly = true)
    public ChartDataDto.DashboardSummary getDashboardSummary() {
        LocalDate today = LocalDate.now();

        long totalProducts = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive())).count();
        long lowStock  = productRepository.findLowStockProducts().size();
        long expiring  = productRepository.findExpiringProducts(today.plusDays(30)).size();
        long expired   = productRepository.findExpiredProducts(today).size();
        long pendingPOs = purchaseOrderRepository.countByStatus(OrderStatus.SENT)
                        + purchaseOrderRepository.countByStatus(OrderStatus.ACKNOWLEDGED);
        long unread    = notificationRepository.countByIsReadFalse();

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        int stockIn  = reportRepository.sumByTypeAndRange(TransactionType.IN,  thirtyDaysAgo, LocalDateTime.now());
        int stockOut = reportRepository.sumByTypeAndRange(TransactionType.OUT, thirtyDaysAgo, LocalDateTime.now());

        ChartDataDto.DashboardSummary summary = new ChartDataDto.DashboardSummary();
        summary.setTotalProducts(totalProducts);
        summary.setLowStockCount(lowStock);
        summary.setExpiringCount(expiring);
        summary.setExpiredCount(expired);
        summary.setPendingPurchaseOrders(pendingPOs);
        summary.setUnreadNotifications(unread);
        summary.setTotalStockIn(stockIn);
        summary.setTotalStockOut(stockOut);
        return summary;
    }
}