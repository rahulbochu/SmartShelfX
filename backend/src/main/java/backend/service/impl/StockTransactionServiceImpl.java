package backend.service.impl;

import backend.dto.StockTransactionRequest;
import backend.dto.StockTransactionResponse;
import backend.entity.Product;
import backend.entity.StockTransaction;
import backend.entity.User;
import backend.enums.TransactionType;
import backend.repository.ProductRepository;
import backend.repository.StockTransactionRepository;
import backend.repository.UserRepository;
import backend.service.NotificationService;
import backend.service.StockTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockTransactionServiceImpl implements StockTransactionService {

    private final StockTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private StockTransactionResponse mapToResponse(StockTransaction t) {
        StockTransactionResponse response = new StockTransactionResponse();
        response.setId(t.getId());
        response.setProductId(t.getProduct().getId());
        response.setProductName(t.getProduct().getName());
        response.setSku(t.getProduct().getSku());
        response.setQuantity(t.getQuantity());
        response.setType(t.getType());
        response.setTimestamp(t.getTimestamp());
        // fixed: User has `username` not `name`
        response.setHandledBy(t.getHandledBy() != null ? t.getHandledBy().getUsername() : "system");
        response.setStockAfterTransaction(t.getProduct().getCurrentStock());
        response.setReason(t.getReason());
        response.setReferenceNumber(t.getReferenceNumber());
        return response;
    }

    // ─── Record Transaction ───────────────────────────────────────────────────

    @Override
    @Transactional
    public StockTransactionResponse recordTransaction(StockTransactionRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));

        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new RuntimeException("Cannot transact on a deactivated product.");
        }

        User handler = userRepository.findById(request.getHandledById())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getHandledById()));

        int stockBefore = product.getCurrentStock();

        // ─── Apply stock change — only IN and OUT (no ADJUSTMENT in TransactionType)
        if (request.getType() == TransactionType.IN) {
            product.setCurrentStock(stockBefore + request.getQuantity());

        } else if (request.getType() == TransactionType.OUT) {
            if (stockBefore < request.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock! Available: " + stockBefore
                        + ", Requested: " + request.getQuantity());
            }
            product.setCurrentStock(stockBefore - request.getQuantity());
        }

        productRepository.save(product);

        // ─── Save transaction — timestamp auto-set by @CreationTimestamp
        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setQuantity(request.getQuantity());
        transaction.setType(request.getType());
        transaction.setHandledBy(handler);
        transaction.setReason(request.getReason());
        transaction.setReferenceNumber(request.getReferenceNumber());

        StockTransaction saved = transactionRepository.save(transaction);

        // ─── Trigger low-stock notification after OUT
        if (request.getType() == TransactionType.OUT) {
            int newStock = product.getCurrentStock();
            if (product.getReorderLevel() != null && newStock <= product.getReorderLevel()) {
                notificationService.createLowStockNotification(
                        product.getId(),
                        product.getName(),
                        newStock,
                        product.getReorderLevel()
                );
            }
        }

        return mapToResponse(saved);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<StockTransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockTransactionResponse> getTransactionsByProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found with id: " + productId);
        }
        return transactionRepository.findByProductId(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}