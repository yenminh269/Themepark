-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: cosc3380-themepark.mysql.database.azure.com    Database: themepark
-- ------------------------------------------------------
-- Server version	8.0.42-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `gender` enum('Male','Female','Others') NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dob` date NOT NULL,
  `phone` varchar(15) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `job_title` enum('General Manager','Store Manager','Mechanical Employee','Sales Employee','Concession Manager','Concession Employee') NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `ssn` varchar(11) NOT NULL,
  `hire_date` date NOT NULL,
  `terminate_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`team12`@`%`*/ /*!50003 TRIGGER `trg_employee_generate_credentials` BEFORE INSERT ON `employee` FOR EACH ROW BEGIN
    SET NEW.email = CONCAT(
        LOWER(TRIM(NEW.first_name)), '.', LOWER(TRIM(NEW.last_name)), '@velocityvalley.com'
    );

    SET NEW.password = CONCAT(LEFT(NEW.first_name, 3), LEFT(NEW.last_name, 3), '123');
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `employee_maintenance_job`
--

DROP TABLE IF EXISTS `employee_maintenance_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_maintenance_job` (
  `employee_id` int NOT NULL,
  `maintenance_id` int NOT NULL,
  `work_date` date NOT NULL,
  `worked_hour` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`employee_id`,`maintenance_id`,`work_date`),
  KEY `maintenance_id` (`maintenance_id`),
  CONSTRAINT `employee_maintenance_job_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `employee_maintenance_job_ibfk_2` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenance` (`maintenance_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `employee_maintenance_job_chk_1` CHECK ((`worked_hour` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_schedule`
--

DROP TABLE IF EXISTS `employee_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `store_id` int NOT NULL,
  `work_date` date NOT NULL,
  `shift_start` time NOT NULL,
  `shift_end` time NOT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `unique_employee_schedule` (`employee_id`,`work_date`,`shift_start`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `employee_schedule_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `employee_schedule_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_store_job`
--

DROP TABLE IF EXISTS `employee_store_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_store_job` (
  `employee_id` int NOT NULL,
  `store_id` int NOT NULL,
  `work_date` date NOT NULL,
  `worked_hour` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `shift_start` time DEFAULT NULL,
  `shift_end` time DEFAULT NULL,
  PRIMARY KEY (`employee_id`,`store_id`,`work_date`),
  KEY `store_id` (`store_id`),
  CONSTRAINT `employee_store_job_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `employee_store_job_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `employee_store_job_chk_1` CHECK ((`worked_hour` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance`
--

DROP TABLE IF EXISTS `maintenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance` (
  `maintenance_id` int NOT NULL AUTO_INCREMENT,
  `ride_id` int NOT NULL,
  `description` text NOT NULL,
  `scheduled_date` date NOT NULL,
  `status` enum('scheduled','in process','done') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`maintenance_id`),
  KEY `ride_id` (`ride_id`),
  CONSTRAINT `maintenance_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `ride` (`ride_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`team12`@`%`*/ /*!50003 TRIGGER `trg_after_maintenance_insert` AFTER INSERT ON `maintenance` FOR EACH ROW BEGIN
    UPDATE ride
    SET status = 'maintenance'
    WHERE ride_id = NEW.ride_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`team12`@`%`*/ /*!50003 TRIGGER `trg_after_maintenance_update` AFTER UPDATE ON `maintenance` FOR EACH ROW BEGIN
    IF NEW.status = 'done' THEN
        UPDATE ride
        SET status = 'open'
        WHERE ride_id = NEW.ride_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `merchandise`
--

DROP TABLE IF EXISTS `merchandise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merchandise` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `quantity` int NOT NULL,
  `description` text NOT NULL,
  `type` enum('drinkware','snacks','beverages','apparel','toys','accessories') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `merchandise_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rain_out`
--

DROP TABLE IF EXISTS `rain_out`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rain_out` (
  `rain_out_id` int NOT NULL AUTO_INCREMENT,
  `rain_out_date` date NOT NULL,
  `note` varchar(50) DEFAULT NULL,
  `status` enum('active','cleared') NOT NULL,
  `resolved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`rain_out_id`),
  UNIQUE KEY `rain_out_date` (`rain_out_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`team12`@`%`*/ /*!50003 TRIGGER `trg_after_rain_out_insert` AFTER INSERT ON `rain_out` FOR EACH ROW BEGIN
    IF NEW.status = 'active' THEN
        UPDATE ride
        SET status = 'closed'
        WHERE status <> 'closed';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`team12`@`%`*/ /*!50003 TRIGGER `trg_set_resolved_at` BEFORE UPDATE ON `rain_out` FOR EACH ROW BEGIN
    IF NEW.status = 'cleared' AND OLD.status <> 'cleared' THEN
        SET NEW.resolved_at = NOW();
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`team12`@`%`*/ /*!50003 TRIGGER `trg_after_rain_out_update` AFTER UPDATE ON `rain_out` FOR EACH ROW BEGIN
    IF NEW.status = 'cleared' THEN
        UPDATE ride
        SET status = 'open'
        WHERE status = 'closed';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ride`
--

DROP TABLE IF EXISTS `ride`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride` (
  `ride_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(6,2) NOT NULL,
  `capacity` int NOT NULL,
  `description` text NOT NULL,
  `status` enum('closed','open','maintenance') NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ride_id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `ride_chk_1` CHECK ((`price` >= 0)),
  CONSTRAINT `ride_chk_2` CHECK ((`capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ride_order`
--

DROP TABLE IF EXISTS `ride_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride_order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `order_date` date NOT NULL,
  `total_amount` decimal(8,2) NOT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `ride_order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ride_order_detail`
--

DROP TABLE IF EXISTS `ride_order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ride_order_detail` (
  `order_id` int NOT NULL,
  `ride_id` int NOT NULL,
  `number_of_tickets` int NOT NULL,
  `price_per_ticket` decimal(6,2) NOT NULL,
  `subtotal` decimal(6,2) NOT NULL,
  PRIMARY KEY (`order_id`,`ride_id`),
  KEY `ride_id` (`ride_id`),
  CONSTRAINT `ride_order_detail_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `ride_order` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ride_order_detail_ibfk_2` FOREIGN KEY (`ride_id`) REFERENCES `ride` (`ride_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ride_order_detail_chk_1` CHECK ((`number_of_tickets` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store`
--

DROP TABLE IF EXISTS `store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store` (
  `store_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` enum('merchandise','food/drink') NOT NULL,
  `status` enum('closed','open','maintenance') NOT NULL,
  `description` text NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store_inventory`
--

DROP TABLE IF EXISTS `store_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_inventory` (
  `store_id` int NOT NULL,
  `item_id` int NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`store_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `store_inventory_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `store_inventory_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `merchandise` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `store_inventory_chk_1` CHECK ((`stock_quantity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store_order`
--

DROP TABLE IF EXISTS `store_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_order` (
  `store_order_id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `order_date` date NOT NULL,
  `total_amount` decimal(8,2) NOT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL,
  `payment_method` enum('cash','credit_card') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`store_order_id`),
  KEY `store_id` (`store_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `store_order_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `store_order_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store_order_detail`
--

DROP TABLE IF EXISTS `store_order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_order_detail` (
  `store_order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_per_item` decimal(6,2) NOT NULL,
  `subtotal` decimal(8,2) NOT NULL,
  PRIMARY KEY (`store_order_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `store_order_detail_ibfk_1` FOREIGN KEY (`store_order_id`) REFERENCES `store_order` (`store_order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `store_order_detail_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `merchandise` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `store_order_detail_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'themepark'
--

--
-- Dumping routines for database 'themepark'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28  0:39:15
