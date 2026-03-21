package backend.repository;

import backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    Optional<Vendor> findByEmail(String email);

    List<Vendor> findByIsActiveTrue();

    boolean existsByEmail(String email);
}