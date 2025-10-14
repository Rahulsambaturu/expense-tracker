package net.SRMAP.expensetrackerApp.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.io.Serializable;
@Getter
@Setter
public class userResponseDto implements Serializable{
    private static final long serialVersionUID = 1L;
    private String name;
    private String email;
    private String mobile_number;
    private LocalDateTime accountCreateDate;
}
