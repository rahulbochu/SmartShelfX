package backend.repository;

import backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // ─── Existing queries (keep these) ───────────────────────────────────────

    List<Product> findByCategory(String category);

    // ─── New queries for Module 5 & 6 ────────────────────────────────────────

    // Products where current stock is at or below reorder level
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.currentStock <= p.reorderLevel")
    List<Product> findLowStockProducts();

    // Perishable products expiring within the warning window
    @Query("SELECT p FROM Product p WHERE p.isPerishable = true AND p.isActive = true " +
           "AND p.expiryDate IS NOT NULL AND p.expiryDate <= :warningDate")
    List<Product> findExpiringProducts(@Param("warningDate") LocalDate warningDate);

    // Already expired products
    @Query("SELECT p FROM Product p WHERE p.isPerishable = true AND p.isActive = true " +
           "AND p.expiryDate < :today")
    List<Product> findExpiredProducts(@Param("today") LocalDate today);

    List<Product> findByVendorId(Long vendorId);

    boolean existsBySku(String sku);
}