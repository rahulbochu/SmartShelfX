package backend.controller;

import backend.dto.VendorDto;
import backend.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    public ResponseEntity<List<VendorDto.Response>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorDto.Response> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @PostMapping
    public ResponseEntity<VendorDto.Response> createVendor(@RequestBody VendorDto.Request request) {
        return ResponseEntity.ok(vendorService.createVendor(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorDto.Response> updateVendor(@PathVariable Long id,
                                                            @RequestBody VendorDto.Request request) {
        return ResponseEntity.ok(vendorService.updateVendor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVendor(@PathVariable Long id) {
        vendorService.deactivateVendor(id);  // uses soft delete (isActive = false)
        return ResponseEntity.ok("Vendor deactivated successfully.");
    }
}