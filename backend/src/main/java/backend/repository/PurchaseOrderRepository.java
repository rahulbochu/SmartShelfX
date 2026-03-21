package backend.repository;

import backend.entity.PurchaseOrder;
import backend.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    Page<PurchaseOrder> findByVendorIdOrderByCreatedAtDesc(Long vendorId, Pageable pageable);

    List<PurchaseOrder> findByStatus(OrderStatus status);

    Page<PurchaseOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(OrderStatus status);

    // Used to auto-generate sequential PO numbers per day
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.orderNumber LIKE :prefix%")
    long countByOrderNumberPrefix(@Param("prefix") String prefix);
}