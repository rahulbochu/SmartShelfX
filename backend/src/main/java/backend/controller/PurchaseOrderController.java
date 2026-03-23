package backend.controller;

import backend.dto.PurchaseOrderDto;
import backend.dto.VendorResponseDto;
import backend.enums.OrderStatus;
import backend.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    // GET all orders (paginated) — ?page=0&size=20
    @GetMapping
    public ResponseEntity<Page<PurchaseOrderDto.Response>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(purchaseOrderService.getAllOrders(pageable));
    }

    // GET single order by ID
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDto.Response> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getOrderById(id));
    }

    // GET orders by status — ?status=DRAFT
    @GetMapping("/by-status")
    public ResponseEntity<List<PurchaseOrderDto.Response>> getOrdersByStatus(
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(purchaseOrderService.getOrdersByStatus(status));
    }

    // POST create new order
    @PostMapping
    public ResponseEntity<PurchaseOrderDto.Response> createOrder(
            @RequestBody PurchaseOrderDto.Request request,
            Authentication authentication) {
        String createdBy = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(request, createdBy));
    }

    // POST send order (email + SMS)
    @PostMapping("/{id}/send")
    public ResponseEntity<PurchaseOrderDto.Response> sendOrder(
            @PathVariable Long id,
            @RequestBody PurchaseOrderDto.SendRequest sendRequest) {
        return ResponseEntity.ok(purchaseOrderService.sendPurchaseOrder(id, sendRequest));
    }

    // PATCH update order status
    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderDto.Response> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(purchaseOrderService.updateOrderStatus(id, status));
    }

    // PATCH cancel order
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderDto.Response> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.cancelOrder(id));
    }

    // POST add vendor response
    @PostMapping("/{id}/vendor-response")
    public ResponseEntity<VendorResponseDto.Response> addVendorResponse(
            @PathVariable Long id,
            @RequestBody VendorResponseDto.Request request) {
        return ResponseEntity.ok(purchaseOrderService.addVendorResponse(id, request));
    }

    // GET vendor responses for an order
    @GetMapping("/{id}/vendor-responses")
    public ResponseEntity<List<VendorResponseDto.Response>> getVendorResponses(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getVendorResponses(id));
    }
}