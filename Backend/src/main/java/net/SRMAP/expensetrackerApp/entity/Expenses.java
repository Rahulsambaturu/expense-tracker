package net.SRMAP.expensetrackerApp.entity;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="expenses")
@Getter
@Setter
public class Expenses {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int expenseId;
    @Column(nullable = false)
    private double amount;
    @Column(nullable = false,length =100)
    private String expenseDescription;
    @Column(nullable = false,length = 50)
    private String paymentMethod;
    @CreationTimestamp
    private LocalDateTime expenseCreate;
    @UpdateTimestamp
    private LocalDateTime expenseUpdate;
    @ManyToOne
    @JoinColumn(name="user_id")
    private User  userid;
    @ManyToOne
    @JoinColumn(name="category_id")
    private Category categoryId;
}
