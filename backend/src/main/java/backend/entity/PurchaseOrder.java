package backend.entity;

import backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;   // e.g.  PO-20240615-001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "expected_delivery_date")
    private LocalDateTime expectedDeliveryDate;

    @Column(name = "email_sent")
    @Builder.Default
    private Boolean emailSent = false;

    @Column(name = "sms_sent")
    @Builder.Default
    private Boolean smsSent = false;

    @Column(name = "ai_generated")
    @Builder.Default
    private Boolean aiGenerated = false;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VendorResponse> vendorResponses = new ArrayList<>();

    @Column(name = "created_by")
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}