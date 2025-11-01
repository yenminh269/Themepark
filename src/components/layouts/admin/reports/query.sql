-- Most Frequently Ridden Rides per month
select month, name, total_tickets
from(select 
MONTH(ro.order_date) as month, ride.name as name, sum(rod.number_of_tickets) as total_tickets,
row_number() OVER(partition by month(ro.order_date)
			order by SUM(rod.number_of_tickets) DESC
					) as rank_in_month
 from ride_order as ro
 left join ride_order_detail as rod on rod.order_id = ro.order_id
 left join ride on ride.ride_id = rod.ride_id 
 GROUP BY MONTH(ro.order_date), ride.name  ) ranked where  rank_in_month = 1 ORDER BY month;
--  number of customer and the average of all months up to the current month
SELECT year, month, total_customer, 
    ROUND(
        AVG(total_customer) OVER (
            PARTITION BY year
            ORDER BY month
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ),2) AS running_avg_customer
FROM (
    SELECT YEAR(order_date) AS year, MONTH(order_date) AS month, 
           COUNT(DISTINCT customer_id) AS total_customer
    FROM (
        SELECT customer_id, order_date FROM store_order
        UNION ALL 
        SELECT customer_id, order_date FROM ride_order
    ) AS combined_orders
    GROUP BY year, month
) AS monthly_totals
ORDER BY year, month;
-- 