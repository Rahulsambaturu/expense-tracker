package net.SRMAP.expensetrackerApp.respositry;

import net.SRMAP.expensetrackerApp.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category,Integer> {

}
