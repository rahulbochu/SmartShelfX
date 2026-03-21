package backend.repository;

import backend.entity.VendorResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorResponseRepository extends JpaRepository<VendorResponse, Long> {

    List<VendorResponse> findByPurchaseOrderIdOrderByRespondedAtDesc(Long purchaseOrderId);
}