package backend.dto;

import lombok.*;

import java.time.LocalDateTime;

public class VendorDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String name;
        private String email;
        private String phoneNumber;
        private String address;
        private String contactPerson;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String email;
        private String phoneNumber;
        private String address;
        private String contactPerson;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }
}