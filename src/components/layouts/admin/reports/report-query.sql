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
-- ride maintencae report
SELECT 
    r.name AS ride_name,
    rod.ride_id,
    SUM(rod.number_of_tickets) AS total_rides,
    IFNULL(m_count.total_maintenance_count, 0) AS total_maintenance_count,
    ROUND( 
		CASE 
			WHEN  IFNULL(m_count.total_maintenance_count, 0) = 0 THEN 0
			ELSE
				(NULLIF(IFNULL(m_count.total_maintenance_count, 0), 0) / SUM(rod.number_of_tickets))  * 100
		END,
        2) as percent_needing_maintenance
FROM ride_order_detail AS rod
LEFT JOIN ride AS r ON rod.ride_id = r.ride_id
LEFT JOIN (
    SELECT ride_id, COUNT(*) AS total_maintenance_count
    FROM maintenance
    GROUP BY ride_id
) AS m_count ON m_count.ride_id = rod.ride_id
GROUP BY r.name, rod.ride_id
ORDER BY r.name ASC;
-- Total ride takens/revenue for all rides per(start date-end date)
select year(od), month(od), day(od), sum(noticket), sum(price*noticket), name
from (select ro.order_id, ro.order_date as od,  rod.price_per_ticket as price, rod.number_of_tickets as noticket,
 rod.ride_id, ride.name as name
from ride_order as ro
left join ride_order_detail as rod on rod.order_id = ro.order_id
left join ride on ride.ride_id = rod.ride_id ) as total_ride_taken
WHERE od >= '2025-11-03' AND od <= '2025-11-06'
GROUP BY  year(od), month(od), day(od), name;
