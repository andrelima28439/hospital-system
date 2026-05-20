package com.hospital.dto;

import com.hospital.entity.Invoice;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceRequest {
    @NotNull
    private Long patientId;
    private LocalDateTime dueDate;
    private BigDecimal discount;
    private Invoice.PaymentMethod paymentMethod;
    private String notes;
    @NotNull
    private List<InvoiceItemRequest> items;

    @Data
    public static class InvoiceItemRequest {
        @NotNull
        private String description;
        @NotNull
        private Integer quantity;
        @NotNull
        private BigDecimal unitPrice;
    }
}
