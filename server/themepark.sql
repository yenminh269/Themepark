/* TRIGGERS */

/* 1st - prevent negative stock*/
DELIMITER $$

CREATE TRIGGER trg_before_store_order_detail_insert
BEFORE INSERT ON store_order_detail
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;

    SELECT quantity INTO current_stock
    FROM merchandise
    WHERE item_id = NEW.item_id;

    IF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough stock for this item';
    END IF;
END$$

DELIMITER ;

/* 2nd - auto-set create_date when insert new customer*/
DELIMITER $$

CREATE TRIGGER customer_BEFORE_INSERT
BEFORE INSERT ON customer
FOR EACH ROW
BEGIN
    IF NEW.create_date IS NULL THEN
        SET NEW.create_date = CURDATE();
    END IF;
END$$

DELIMITER ;

/* 3th - auto-set order_date for store_order*/
DELIMITER $$

CREATE TRIGGER store_order_BEFORE_INSERT
BEFORE INSERT ON store_order
FOR EACH ROW
BEGIN 
    IF NEW.order_date IS NULL THEN 
        SET NEW.order_date = CURDATE();
    END IF;
END$$

DELIMITER ;
/* Data queries */