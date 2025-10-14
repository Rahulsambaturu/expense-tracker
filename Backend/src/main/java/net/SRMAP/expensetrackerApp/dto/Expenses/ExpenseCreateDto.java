package net.SRMAP.expensetrackerApp.dto.Expenses;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;

@Setter
@Getter
public class ExpenseCreateDto {
    @NotNull
    @Positive
    private double amount;

    @NotBlank
    private String expenseDescription;

    @NotBlank
    private String paymentMethod;

    @NotNull
    private int categoryId; // Frontend sends this

    // Remove userId — backend sets from JWT
    @JsonIgnore // so frontend cannot override this
    private int userId;
}