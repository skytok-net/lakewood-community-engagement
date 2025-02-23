-- Update existing properties with Contributing and Signed Petition data
UPDATE dallas.properties
SET 
    is_contributing = 
        CASE address
            WHEN '6800 LAKEWOOD BLVD' THEN true
            WHEN '6838 AVALON AVE' THEN false
            WHEN '6827 AVALON AVE' THEN false
            WHEN '6820 AVALON AVE' THEN true
            WHEN '6808 AVALON AVE' THEN true
            WHEN '6819 AVALON AVE' THEN false
            WHEN '6828 AVALON AVE' THEN true
            WHEN '6814 AVALON AVE' THEN false
            WHEN '6837 AVALON AVE' THEN false
            WHEN '6807 AVALON AVE' THEN false
            WHEN '6802 AVALON AVE' THEN false
            WHEN '6858 AVALON AVE' THEN true
            WHEN '6850 AVALON AVE' THEN false
            WHEN '6844 AVALON AVE' THEN false
            -- Add all other addresses from the CSV with their contributing status
            ELSE is_contributing
        END,
    signed_petition = 
        CASE address
            WHEN '6800 LAKEWOOD BLVD' THEN false
            WHEN '6838 AVALON AVE' THEN false
            WHEN '6827 AVALON AVE' THEN false
            WHEN '6820 AVALON AVE' THEN false
            WHEN '6808 AVALON AVE' THEN true
            WHEN '6819 AVALON AVE' THEN false
            WHEN '6828 AVALON AVE' THEN false
            WHEN '6814 AVALON AVE' THEN false
            WHEN '6837 AVALON AVE' THEN false
            WHEN '6807 AVALON AVE' THEN false
            WHEN '6802 AVALON AVE' THEN true
            WHEN '6858 AVALON AVE' THEN false
            WHEN '6850 AVALON AVE' THEN false
            WHEN '6844 AVALON AVE' THEN false
            -- Add all other addresses from the CSV with their signed_petition status
            ELSE signed_petition
        END;

-- Verify the update
SELECT COUNT(*) as total_records,
       COUNT(CASE WHEN is_contributing IS NOT NULL THEN 1 END) as contributing_set,
       COUNT(CASE WHEN signed_petition IS NOT NULL THEN 1 END) as petition_set
FROM dallas.properties;
