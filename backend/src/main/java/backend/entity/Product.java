package backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String sku;

    private String description;

    private String category;

    private Double price;

    @Column(name = "current_stock")
    @Builder.Default
    private Integer currentStock = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "reorder_level")
    @Builder.Default
    private Integer reorderLevel = 10;

    @Column(name = "reorder_quantity")
    @Builder.Default
    private Integer reorderQuantity = 50;

    @Column(name = "is_perishable")
    @Builder.Default
    private Boolean isPerishable = false;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}