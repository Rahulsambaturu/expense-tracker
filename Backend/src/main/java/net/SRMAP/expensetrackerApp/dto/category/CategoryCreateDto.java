package net.SRMAP.expensetrackerApp.dto.category;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
@Getter
@Setter
public class CategoryCreateDto {
    @NotBlank
    private String name;
    @NotBlank
    private String description;
}
