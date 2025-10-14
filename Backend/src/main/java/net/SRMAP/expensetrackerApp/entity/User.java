package net.SRMAP.expensetrackerApp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.Email;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    @Email
    @Column(unique = true)
    private String email;
    private String mobile_number;
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    @CreationTimestamp
    private LocalDateTime accountCreateDate;
    @OneToMany(mappedBy = "userid",cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Expenses> ExpenseList;
}