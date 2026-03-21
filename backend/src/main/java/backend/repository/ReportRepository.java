package backend.repository;

import backend.entity.StockTransaction;
import backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Extended queries on StockTransaction for reporting.
 * Add these methods to your existing StockTransactionRepository.
 */
@Repository
public interface ReportRepository extends JpaRepository<StockTransaction, Long> {

    // ─── Stock Movement ───────────────────────────────────────────────────────

    @Query("SELECT st FROM StockTransaction st " +
           "JOIN FETCH st.product p " +
           "WHERE st.timestamp BETWEEN :from AND :to " +
           "ORDER BY st.timestamp DESC")
    List<StockTransaction> findAllInRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT st FROM StockTransaction st " +
           "JOIN FETCH st.product p " +
           "WHERE p.id = :productId " +
           "AND st.timestamp BETWEEN :from AND :to " +
           "ORDER BY st.timestamp DESC")
    List<StockTransaction> findByProductAndRange(
            @Param("productId") Long productId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("SELECT COALESCE(SUM(st.quantity), 0) FROM StockTransaction st " +
           "WHERE st.type = :type " +
           "AND st.timestamp BETWEEN :from AND :to")
    int sumByTypeAndRange(
            @Param("type") TransactionType type,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // ─── Sales (OUT transactions grouped by product) ──────────────────────────

    @Query("SELECT st.product.id, SUM(st.quantity) FROM StockTransaction st " +
           "WHERE st.type = 'OUT' " +
           "AND st.timestamp BETWEEN :from AND :to " +
           "GROUP BY st.product.id")
    List<Object[]> findSalesByProductInRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    // ─── Charts — daily stock movement (last N days) ──────────────────────────

    @Query("SELECT FUNCTION('DATE', st.timestamp), st.type, SUM(st.quantity) " +
           "FROM StockTransaction st " +
           "WHERE st.timestamp >= :since " +
           "GROUP BY FUNCTION('DATE', st.timestamp), st.type " +
           "ORDER BY FUNCTION('DATE', st.timestamp) ASC")
    List<Object[]> findDailyMovementSince(@Param("since") LocalDateTime since);

    // ─── Charts — top selling products (OUT qty, last 30 days) ───────────────

    @Query("SELECT st.product.name, SUM(st.quantity) as total " +
           "FROM StockTransaction st " +
           "WHERE st.type = 'OUT' " +
           "AND st.timestamp >= :since " +
           "GROUP BY st.product.id, st.product.name " +
           "ORDER BY total DESC")
    List<Object[]> findTopSellingProducts(@Param("since") LocalDateTime since);

    // ─── Charts — stock by category ───────────────────────────────────────────

    @Query("SELECT p.category, SUM(p.currentStock) FROM backend.entity.Product p " +
           "WHERE p.isActive = true AND p.category IS NOT NULL " +
           "GROUP BY p.category")
    List<Object[]> findStockByCategory();
}
