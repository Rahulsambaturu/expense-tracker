package net.SRMAP.expensetrackerApp.configuration;

import net.SRMAP.expensetrackerApp.dto.Expenses.ExpenseResponseDto;
import net.SRMAP.expensetrackerApp.entity.Expenses;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class expensetrackerConfig {
    @Bean
    public ModelMapper modelMapper() {  // <-- camelCase
        ModelMapper mapper = new ModelMapper();
        mapper.addMappings(new PropertyMap<Expenses, ExpenseResponseDto>() {
            @Override
            protected void configure() {
                map().setUserId(source.getUserid().getId());
                map().setCategoryId(source.getCategoryId().getId());
            }
        });
        return mapper;
    }

}

