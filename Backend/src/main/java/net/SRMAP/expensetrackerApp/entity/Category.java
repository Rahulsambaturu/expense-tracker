package net.SRMAP.expensetrackerApp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name="category")
@Getter
@Setter
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int Id;
    @Column(length=20,nullable = false,unique = true)
    private String name;
    @Column(length=200,nullable = false)
    private String description;
    @OneToMany(mappedBy="categoryId",cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Expenses> expense_id;
}
