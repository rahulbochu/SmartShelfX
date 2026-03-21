package backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProductRequest {

    private String name;
    private String sku;
    private String description;     
    private String category;
    private Double price;
    private Integer currentStock;
    private Long vendorId;

    private Integer reorderLevel;
    private Integer reorderQuantity;
    private Boolean isPerishable;
    private LocalDate expiryDate;
}