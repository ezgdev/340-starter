-- 1 - Insert record to the account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2 - Modify record to change the account_type to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony';

-- 3 - Delete Tony Stark record fron database
DELETE FROM account
WHERE account_firstname = 'Tony';

-- 4 - Replace record in GM Hummer to read 'a huge interior' rather than 'small interiors'
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interiors') 
WHERE inv_model = 'Hummer';

-- 5 - Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category
SELECT 
	inventory.inv_make,
	inventory.inv_model
FROM 
	inventory
INNER JOIN
	classification ON inventory.classification_id = classification.classification_id
WHERE 
	classification.classification_id = 2;

-- 6 - Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns
UPDATE inventory
SET 
	inv_image = REPLACE(inv_image, '/images', '/images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles');




---------------------------------

UPDATE inventory
SET inv_make = REPLACE(inv_make, 'Aerocar International', 'Aerocar')
WHERE inv_id = 7; 

UPDATE inventory
SET inv_model = REPLACE(inv_model, 'Aerocar', 'International')
WHERE inv_id = 7; 