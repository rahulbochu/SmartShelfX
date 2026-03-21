package backend.service;

import backend.dto.VendorDto;
import backend.entity.Vendor;
import backend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorService {

    private final VendorRepository vendorRepository;

    @Transactional
    public VendorDto.Response createVendor(VendorDto.Request request) {
        if (request.getEmail() != null && vendorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Vendor with email '" + request.getEmail() + "' already exists.");
        }

        Vendor vendor = Vendor.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .contactPerson(request.getContactPerson())
                .build();

        return toDto(vendorRepository.save(vendor));
    }

    @Transactional(readOnly = true)
    public List<VendorDto.Response> getAllVendors() {
        return vendorRepository.findByIsActiveTrue()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VendorDto.Response getVendorById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public VendorDto.Response updateVendor(Long id, VendorDto.Request request) {
        Vendor vendor = findOrThrow(id);

        if (request.getEmail() != null
                && !request.getEmail().equals(vendor.getEmail())
                && vendorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email '" + request.getEmail() + "' is already used by another vendor.");
        }

        vendor.setName(request.getName());
        vendor.setEmail(request.getEmail());
        vendor.setPhoneNumber(request.getPhoneNumber());
        vendor.setAddress(request.getAddress());
        vendor.setContactPerson(request.getContactPerson());

        return toDto(vendorRepository.save(vendor));
    }

    @Transactional
    public void deactivateVendor(Long id) {
        Vendor vendor = findOrThrow(id);
        vendor.setIsActive(false);
        vendorRepository.save(vendor);
        log.info("Vendor {} deactivated.", id);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public Vendor findOrThrow(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + id));
    }

    public VendorDto.Response toDto(Vendor vendor) {
        return VendorDto.Response.builder()
                .id(vendor.getId())
                .name(vendor.getName())
                .email(vendor.getEmail())
                .phoneNumber(vendor.getPhoneNumber())
                .address(vendor.getAddress())
                .contactPerson(vendor.getContactPerson())
                .isActive(vendor.getIsActive())
                .createdAt(vendor.getCreatedAt())
                .build();
    }
}