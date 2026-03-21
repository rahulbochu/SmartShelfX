package backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Min(1)
    @Column(name = "ordered_quantity", nullable = false)
    private Integer orderedQuantity;

    @Column(name = "received_quantity")
    @Builder.Default
    private Integer receivedQuantity = 0;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;
}