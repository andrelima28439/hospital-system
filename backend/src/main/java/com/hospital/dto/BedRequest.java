package com.hospital.dto;

import com.hospital.entity.Bed;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BedRequest {
    @NotBlank
    private String bedNumber;
    @NotBlank
    private String ward;
    private String room;
    private Bed.BedStatus status;
}
