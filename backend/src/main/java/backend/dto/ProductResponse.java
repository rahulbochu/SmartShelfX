package backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String description;     
    private String category;
    private Double price;
    private Integer currentStock;
    private String stockStatus;      
    private Integer reorderLevel;
    private Integer reorderQuantity;
    private Boolean isPerishable;
    private LocalDate expiryDate;

    private Long vendorId;
    private String vendorName;
}