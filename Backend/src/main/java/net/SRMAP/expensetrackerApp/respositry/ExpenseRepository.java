package net.SRMAP.expensetrackerApp.respositry;
import net.SRMAP.expensetrackerApp.entity.Expenses;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expenses,Integer> {
    @Query(value="select*from expenses where user_id=:userId",nativeQuery = true)
    List<Expenses> findExpenseById(@Param("userId") int userId);
    @Query(value="select*from expenses where user_id=:userId and category_id=:categoryId",nativeQuery = true)
    List<Expenses>getByUserid_IdAndCategoryId_Id(@Param("userId") int userId,@Param("categoryId") int categoryId);
    @Query(value="select sum(amount) as total from expenses where user_id= :userId and Month(expense_create)=:month and year(expense_create)=:year", nativeQuery = true)
    Double getMonthlyTotal(@Param("userId")int userId,
                           @Param("month")int month,
                           @Param("year") int year);
    @Query(value="select sum(amount) as total from expenses where user_id=:userId and Year(expense_create)=:year",nativeQuery = true)
    Double getyearlyTotal(@Param("userId")int userId,
                          @Param("year")int year);
    @Query(value="select * from expenses where user_id= :userId  order By expense_create DESC LIMIT 5",nativeQuery = true)
    List<Expenses> getlastFiveExpenses(@Param("userId")int userId);
    @Query(value="select*from expenses where user_id=:userId and category_id=:categoryId and Month(expense_create)=:month and year(expense_create)=:year",nativeQuery = true)
    List<Expenses>getcategoryMonthly(@Param("userId")int userId,
                                     @Param("categoryId")int categoryId,
                                     @Param("month")int month,
                                     @Param("year")int year);
    @Query(value="select*from expenses where user_id=:userId and category_id=:categoryId and year(expense_create)=:year",nativeQuery = true)
    List<Expenses>getcategoryYearly(@Param("userId")int userId,
                                    @Param("categoryId")int categoryId,
                                    @Param("year")int year);
    @Query(value="select*from expenses where user_id=:userId and Date(expense_create)=CURDATE()",nativeQuery = true)
    List<Expenses>getDailyexpenses(@Param("userId")int userId);
    @Query(value="select sum(amount) as total from expenses where user_id=:userId and Date(expense_create)=CURDATE()",nativeQuery = true)
    Double getsumDailyExpenses(@Param("userId")int userId);
    @Query(value="select*from expenses where user_id=:userId and expense_create between :start and :end",nativeQuery = true)
    List<Expenses>getExpensesBetweenDates(@Param("userId")int userId,
                                          @Param("start")LocalDateTime start,
                                          @Param("end")LocalDateTime end);
    @Query(value="select sum(amount) as total from expenses where user_id=:userId and expense_create between :start and :end",nativeQuery = true)
    Double getSumExpensesBetweenDates(@Param("userId")int userId,
                                      @Param("start")LocalDateTime start,
                                      @Param("end")LocalDateTime end);
    @Query(value="select category_id,sum(amount)as total from expenses where user_id=:userId group by category_id order by total DESC limit :limit",nativeQuery = true)
    List<Object[]> getTopCategoryByUser(@Param("userId") int userId,
                                        @Param("limit")int limit);
    @Query(value="select avg(monthly_total) from(select sum(amount)as monthly_total from expenses where user_id=:userId group by year(expense_create),Month(expense_create))as Month_expenses",nativeQuery = true)
    Double getMonthlyAverageExpenses(@Param("userId")int userId );
    @Query(value = "SELECT AVG(daily_total) FROM (SELECT SUM(amount) AS daily_total FROM expenses WHERE user_id = :userId GROUP BY DATE(expense_create)) as daily_expenses", nativeQuery = true)
    Double getAverageDailyExpenses(@Param("userId") int userId);
    List<Expenses> findByUserid_IdAndExpenseDescriptionContainingIgnoreCase(int userId, String keyword);
    Page<Expenses> findByUserid_Id(int userId, Pageable pageable);

}
