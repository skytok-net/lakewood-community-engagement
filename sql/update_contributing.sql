-- Create temporary table to store the CSV data
CREATE TEMPORARY TABLE temp_property_updates (
    address text,
    is_contributing boolean,
    signed_petition boolean
);

-- Insert data from CSV (values shown here are examples, actual data will be inserted via COPY command)
INSERT INTO temp_property_updates (address, is_contributing, signed_petition)
VALUES 
    ('6800 LAKEWOOD BLVD', true, false),
    ('6838 AVALON AVE', false, false),
    -- ... more values from CSV

-- Update properties table with new values, handling duplicates
UPDATE dallas.properties p
SET 
    is_contributing = t.is_contributing,
    signed_petition = t.signed_petition
FROM temp_property_updates t
WHERE p.address = t.address
AND NOT EXISTS (
    SELECT 1 
    FROM dallas.properties p2 
    WHERE p2.address = p.address 
    AND p2.id != p.id
);

-- For duplicate addresses, update only the records that match the criteria in duplicate_addresses.csv
UPDATE dallas.properties p
SET 
    is_contributing = t.is_contributing,
    signed_petition = t.signed_petition
FROM temp_property_updates t
JOIN (
    SELECT DISTINCT d1.address, d1.id
    FROM dallas.properties d1
    JOIN dallas.properties d2 ON d1.address = d2.address AND d1.id != d2.id
    WHERE d1.inside_cpc = true  -- Prioritize records inside CPC
    OR d1.inside_original = true  -- Or inside original
    OR d1.reply = true  -- Or has a reply
) dupes ON dupes.address = t.address
WHERE p.id = dupes.id;

-- Drop temporary table
DROP TABLE temp_property_updates;
