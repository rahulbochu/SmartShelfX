package backend.service;

import backend.dto.ExpiryReportDto;
import backend.dto.SalesReportDto;
import backend.dto.StockMovementReportDto;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class ExportService {

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ─── Excel: Stock Movement ────────────────────────────────────────────────

    public byte[] exportStockMovementToExcel(StockMovementReportDto.Summary report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Stock Movement");
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);

            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Stock Movement Report: " + report.getFromDate() + " to " + report.getToDate());
            titleCell.setCellStyle(summaryStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

            // Summary row
            Row summaryRow = sheet.createRow(1);
            summaryRow.createCell(0).setCellValue("Total IN: " + report.getTotalIn());
            summaryRow.createCell(2).setCellValue("Total OUT: " + report.getTotalOut());
            summaryRow.createCell(4).setCellValue("Net: " + report.getNetMovement());
            summaryRow.createCell(6).setCellValue("Transactions: " + report.getTotalTransactions());

            // Header
            String[] headers = {"ID", "Product", "SKU", "Category", "Type", "Qty", "Stock After", "Handled By", "Reason", "Timestamp"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 4;
            for (StockMovementReportDto.Row r : report.getTransactions()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getTransactionId());
                row.createCell(1).setCellValue(r.getProductName());
                row.createCell(2).setCellValue(r.getSku() != null ? r.getSku() : "");
                row.createCell(3).setCellValue(r.getCategory() != null ? r.getCategory() : "");
                row.createCell(4).setCellValue(r.getType().name());
                row.createCell(5).setCellValue(r.getQuantity());
                row.createCell(6).setCellValue(r.getStockAfter());
                row.createCell(7).setCellValue(r.getHandledBy() != null ? r.getHandledBy() : "");
                row.createCell(8).setCellValue(r.getReason() != null ? r.getReason() : "");
                row.createCell(9).setCellValue(r.getTimestamp() != null ? r.getTimestamp().format(DT_FMT) : "");
            }

            autoSizeColumns(sheet, headers.length);
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Failed to generate stock movement Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to export stock movement report", e);
        }
    }

    // ─── Excel: Sales ─────────────────────────────────────────────────────────

    public byte[] exportSalesToExcel(SalesReportDto.Summary report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Sales Report");
            CellStyle headerStyle  = createHeaderStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);

            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Sales Report: " + report.getFromDate() + " to " + report.getToDate());
            titleCell.setCellStyle(summaryStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            // Summary
            Row summaryRow = sheet.createRow(1);
            summaryRow.createCell(0).setCellValue("Total Revenue: " + report.getTotalRevenue());
            summaryRow.createCell(2).setCellValue("Units Sold: " + report.getTotalUnitsSold());
            summaryRow.createCell(4).setCellValue("Top Product: " + (report.getTopSellingProduct() != null ? report.getTopSellingProduct() : "N/A"));

            // Header
            String[] headers = {"Product", "SKU", "Category", "Units Sold", "Unit Price", "Total Revenue", "Vendor"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 4;
            for (SalesReportDto.Row r : report.getItems()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getProductName());
                row.createCell(1).setCellValue(r.getSku() != null ? r.getSku() : "");
                row.createCell(2).setCellValue(r.getCategory() != null ? r.getCategory() : "");
                row.createCell(3).setCellValue(r.getTotalUnitsSold());
                row.createCell(4).setCellValue(r.getUnitPrice().doubleValue());
                row.createCell(5).setCellValue(r.getTotalRevenue().doubleValue());
                row.createCell(6).setCellValue(r.getVendorName());
            }

            autoSizeColumns(sheet, headers.length);
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Failed to generate sales Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to export sales report", e);
        }
    }

    // ─── Excel: Expiry ────────────────────────────────────────────────────────

    public byte[] exportExpiryToExcel(ExpiryReportDto.Summary report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Expiry Report");
            CellStyle headerStyle  = createHeaderStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook);
            CellStyle redStyle     = createRedStyle(workbook);
            CellStyle orangeStyle  = createOrangeStyle(workbook);

            // Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Expiry Report — Generated: " + java.time.LocalDate.now());
            titleCell.setCellStyle(summaryStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));

            // Summary
            Row summaryRow = sheet.createRow(1);
            summaryRow.createCell(0).setCellValue("Expired: " + report.getTotalExpired());
            summaryRow.createCell(2).setCellValue("Critical (≤7d): " + report.getTotalCritical());
            summaryRow.createCell(4).setCellValue("Warning (≤30d): " + report.getTotalWarning());

            // Header
            String[] headers = {"Product", "SKU", "Category", "Current Stock", "Expiry Date", "Days Remaining", "Status", "Vendor"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 4;
            for (ExpiryReportDto.Row r : report.getItems()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.getProductName());
                row.createCell(1).setCellValue(r.getSku() != null ? r.getSku() : "");
                row.createCell(2).setCellValue(r.getCategory() != null ? r.getCategory() : "");
                row.createCell(3).setCellValue(r.getCurrentStock());
                row.createCell(4).setCellValue(r.getExpiryDate().toString());
                row.createCell(5).setCellValue(r.getDaysRemaining());

                Cell statusCell = row.createCell(6);
                statusCell.setCellValue(r.getStatus());
                if ("EXPIRED".equals(r.getStatus()) || "CRITICAL".equals(r.getStatus())) {
                    statusCell.setCellStyle(redStyle);
                } else {
                    statusCell.setCellStyle(orangeStyle);
                }

                row.createCell(7).setCellValue(r.getVendorName());
            }

            autoSizeColumns(sheet, headers.length);
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Failed to generate expiry Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to export expiry report", e);
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 13);
        style.setFont(font);
        return style;
    }

    private CellStyle createRedStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(IndexedColors.RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = wb.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createOrangeStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}