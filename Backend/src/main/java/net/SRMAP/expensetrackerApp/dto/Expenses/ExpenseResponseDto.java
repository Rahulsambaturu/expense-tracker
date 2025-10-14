package net.SRMAP.expensetrackerApp.dto.Expenses;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Setter
@Getter
public class ExpenseResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer id;  // expense id
    private Double amount;
    private String expenseDescription;
    private String paymentMethod;
    private LocalDateTime expenseCreate;  // set automatically in entity
    private LocalDateTime expenseUpdate;
    private Integer categoryId;
    private Integer userId;
}
