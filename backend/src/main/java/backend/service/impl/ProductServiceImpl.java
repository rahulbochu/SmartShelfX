package backend.service.impl;

import backend.dto.ProductRequest;
import backend.dto.ProductResponse;
import backend.entity.Product;
import backend.entity.Vendor;
import backend.repository.ProductRepository;
import backend.repository.VendorRepository;
import backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSku(product.getSku());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory());
        response.setCurrentStock(product.getCurrentStock());
        response.setVendorId(product.getVendor() != null ? product.getVendor().getId() : null);
        response.setVendorName(product.getVendor() != null ? product.getVendor().getName() : "N/A");
        response.setReorderLevel(product.getReorderLevel());
        response.setReorderQuantity(product.getReorderQuantity());
        response.setIsPerishable(product.getIsPerishable());
        response.setExpiryDate(product.getExpiryDate());
        response.setStockStatus(resolveStockStatus(product));
        return response;
    }

    private String resolveStockStatus(Product product) {
        if (Boolean.TRUE.equals(product.getIsPerishable()) && product.getExpiryDate() != null) {
            if (product.getExpiryDate().isBefore(LocalDate.now())) {
                return "EXPIRED";
            }
            if (product.getExpiryDate().isBefore(LocalDate.now().plusDays(30))) {
                return "EXPIRING_SOON";
            }
        }
        if (product.getCurrentStock() != null
                && product.getReorderLevel() != null
                && product.getCurrentStock() <= product.getReorderLevel()) {
            return "LOW";
        }
        return "OK";
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductResponse addProduct(ProductRequest request) {
        // SKU uniqueness check
        if (request.getSku() != null && !request.getSku().isBlank()
                && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU '" + request.getSku() + "' already exists.");
        }

        Vendor vendor = null;
        if (request.getVendorId() != null) {
            vendor = vendorRepository.findById(request.getVendorId()).orElse(null);
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setCurrentStock(request.getCurrentStock() != null ? request.getCurrentStock() : 0);
        product.setVendor(vendor);
        product.setReorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10);
        product.setReorderQuantity(request.getReorderQuantity() != null ? request.getReorderQuantity() : 50);
        product.setIsPerishable(request.getIsPerishable() != null ? request.getIsPerishable() : false);
        product.setExpiryDate(request.getExpiryDate());
        product.setIsActive(true);

        return mapToResponse(productRepository.save(product));
    }

    // ─── Update ──────────────────────────────────────────────────────────────
@Override
@Transactional
public ProductResponse updateProduct(Long id, ProductRequest request) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

    // SKU uniqueness — only if it actually changed
    if (request.getSku() != null && !request.getSku().isBlank()
            && !request.getSku().equals(product.getSku())
            && productRepository.existsBySku(request.getSku())) {
        throw new RuntimeException("SKU '" + request.getSku() + "' is already used by another product.");
    }

    if (request.getVendorId() != null) {
        vendorRepository.findById(request.getVendorId())
            .ifPresent(product::setVendor);
    }

    product.setName(request.getName());
    product.setSku(request.getSku());
    product.setDescription(request.getDescription());
    product.setCategory(request.getCategory());
    product.setPrice(request.getPrice());
    // ← NO product.setVendor(vendor) here

    if (request.getCurrentStock() != null) {
        product.setCurrentStock(request.getCurrentStock());
    }
    if (request.getReorderLevel()    != null) product.setReorderLevel(request.getReorderLevel());
    if (request.getReorderQuantity() != null) product.setReorderQuantity(request.getReorderQuantity());
    if (request.getIsPerishable()    != null) product.setIsPerishable(request.getIsPerishable());
    if (request.getExpiryDate()      != null) product.setExpiryDate(request.getExpiryDate());

    return mapToResponse(productRepository.save(product));
}
    // ─── Soft Delete ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getByCategory(String category) {
        return productRepository.findByCategory(category)
                .stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Extra helper (used by ProductController GET /{id}) ──────────────────

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        return mapToResponse(product);
    }
}