package backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_responses")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class VendorResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;

    @Column(name = "responded_by")
    private String respondedBy;

    // EMAIL / SMS / MANUAL
    @Column(name = "channel")
    private String channel;

    @CreationTimestamp
    @Column(name = "responded_at", updatable = false)
    private LocalDateTime respondedAt;
}