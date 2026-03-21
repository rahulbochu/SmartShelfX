package backend.controller;

import backend.dto.ChartDataDto;
import backend.dto.ExpiryReportDto;
import backend.dto.SalesReportDto;
import backend.dto.StockMovementReportDto;
import backend.service.ExportService;
import backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;
    private final ExportService exportService;

    // ─── Dashboard Summary ────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ChartDataDto.DashboardSummary> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }

    // ─── Stock Movement Report ────────────────────────────────────────────────

    @GetMapping("/stock-movement")
    public ResponseEntity<StockMovementReportDto.Summary> getStockMovement(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long productId) {
        return ResponseEntity.ok(reportService.getStockMovementReport(from, to, productId));
    }

    @GetMapping("/stock-movement/export/excel")
    public ResponseEntity<byte[]> exportStockMovementExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long productId) {

        StockMovementReportDto.Summary report = reportService.getStockMovementReport(from, to, productId);
        byte[] bytes = exportService.exportStockMovementToExcel(report);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock-movement-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    // ─── Sales Report ─────────────────────────────────────────────────────────

    @GetMapping("/sales")
    public ResponseEntity<SalesReportDto.Summary> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(reportService.getSalesReport(from, to));
    }

    @GetMapping("/sales/export/excel")
    public ResponseEntity<byte[]> exportSalesExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        SalesReportDto.Summary report = reportService.getSalesReport(from, to);
        byte[] bytes = exportService.exportSalesToExcel(report);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    // ─── Expiry Report ────────────────────────────────────────────────────────

    @GetMapping("/expiry")
    public ResponseEntity<ExpiryReportDto.Summary> getExpiryReport() {
        return ResponseEntity.ok(reportService.getExpiryReport());
    }

    @GetMapping("/expiry/export/excel")
    public ResponseEntity<byte[]> exportExpiryExcel() {
        ExpiryReportDto.Summary report = reportService.getExpiryReport();
        byte[] bytes = exportService.exportExpiryToExcel(report);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expiry-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    // ─── Charts API ───────────────────────────────────────────────────────────

    @GetMapping("/charts/stock-movement")
    public ResponseEntity<ChartDataDto.LineChart> getStockMovementChart(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reportService.getStockMovementLineChart(days));
    }

    @GetMapping("/charts/top-selling")
    public ResponseEntity<ChartDataDto.BarChart> getTopSellingChart(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(reportService.getTopSellingProductsChart(days));
    }

    @GetMapping("/charts/stock-by-category")
    public ResponseEntity<ChartDataDto.PieChart> getStockByCategoryChart() {
        return ResponseEntity.ok(reportService.getStockByCategoryChart());
    }
}