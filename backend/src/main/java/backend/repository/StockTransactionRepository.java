package backend.repository;

import backend.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    // ─── Existing query (keep this) ───────────────────────────────────────────

    List<StockTransaction> findByProductId(Long productId);

    // ─── New query for AIRestockService ───────────────────────────────────────
    // Uses `type` (not `transactionType`) to match StockTransaction entity field

    @Query("SELECT COALESCE(SUM(st.quantity), 0) FROM StockTransaction st " +
           "WHERE st.product.id = :productId " +
           "AND st.type = 'OUT' " +
           "AND st.timestamp >= :since")
    Integer sumOutgoingQuantitySince(
            @Param("productId") Long productId,
            @Param("since") LocalDateTime since
    );
}