package net.SRMAP.expensetrackerApp.dto.category;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class categoryResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private int Id;
    private String name;
    private String description;
}
