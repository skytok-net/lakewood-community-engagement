-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Truncate existing table
TRUNCATE TABLE dallas.properties;

-- Insert data from CSV
INSERT INTO dallas.properties (
    id,
    reply,
    address,
    city,
    state,
    zip,
    owner,
    inside_cpc,
    inside_original,
    is_contributing,
    signed_petition
)
VALUES 
    (uuid_generate_v4(), true, '6800 LAKEWOOD BLVD', 'Dallas', 'TX', '75214', 'DAVIS MICHAEL B & HOLLY S', false, true, true, false),
    (uuid_generate_v4(), false, '6838 AVALON AVE', 'Dallas', 'TX', '75214', 'BAKER TODD', false, true, false, false),
    (uuid_generate_v4(), true, '6827 AVALON AVE', 'Dallas', 'TX', '75214', 'FENLAW JAY A & EMILY M', false, true, false, false),
    (uuid_generate_v4(), true, '6820 AVALON AVE', 'Dallas', 'TX', '75214', 'HOLMES JOHN B & JEANETTE S', false, true, true, false),
    (uuid_generate_v4(), false, '6808 AVALON AVE', 'Dallas', 'TX', '75214', 'BARTON REVOCABLE TRUST', false, true, true, true),
    (uuid_generate_v4(), true, '6819 AVALON AVE', 'Dallas', 'TX', '75214', 'CREWS KEVIN T & CHRISTINA S', false, true, false, false),
    (uuid_generate_v4(), null, '6828 AVALON AVE', 'Dallas', 'TX', '75214', 'SHERSTAD MATTHEW', false, true, true, false),
    (uuid_generate_v4(), false, '6814 AVALON AVE', 'Dallas', 'TX', '75214', 'FITZSIMMONS A GERALDINE REV TRUST', false, true, false, false),
    (uuid_generate_v4(), true, '6837 AVALON AVE', 'Dallas', 'TX', '75214', 'CARLTON BRIAN', false, true, false, false),
    (uuid_generate_v4(), true, '6807 AVALON AVE', 'Dallas', 'TX', '75214', 'SKIPWITH WALTER E ET AL', false, true, false, false),
    (uuid_generate_v4(), false, '6802 AVALON AVE', 'Dallas', 'TX', '75214', 'CERVIN MARGARET EUGENIA', false, true, false, true),
    (uuid_generate_v4(), true, '6858 AVALON AVE', 'Dallas', 'TX', '75214', 'JOHNSTON RICHARD D &', false, true, true, false),
    (uuid_generate_v4(), null, '6850 AVALON AVE', 'Dallas', 'TX', '75214', 'COX BARTON & MEGAN', false, true, false, false),
    (uuid_generate_v4(), true, '6844 AVALON AVE', 'Dallas', 'TX', '75214', 'REGAN JOHN D &', false, true, false, false),
    (uuid_generate_v4(), false, '6953 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'BATTLE CHRISTY WILLIAMS', true, true, false, false),
    (uuid_generate_v4(), false, '6933 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'Taxpayer at', true, true, false, false),
    (uuid_generate_v4(), false, '6925 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'WALLACE DAVID BOWEN &', true, true, true, false),
    (uuid_generate_v4(), false, '6919 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'BLAIR LARRY & JANET L', true, true, false, false),
    (uuid_generate_v4(), false, '6917 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'CASEY HOWARD KIRKMAN JR &', true, true, false, false),
    (uuid_generate_v4(), true, '6907 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'RIDDLE CHRISTY CATHLEEN', true, true, false, false),
    (uuid_generate_v4(), null, '6903 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'MOZELEWSKI RACHAEL VICTORIA &', true, true, true, false),
    (uuid_generate_v4(), false, '6969 LAKEWOOD BLVD', 'Dallas', 'TX', '75214', 'HALL MARK ALAN &', true, true, true, false),
    (uuid_generate_v4(), false, '6961 LAKEWOOD BLVD', 'Dallas', 'TX', '75214', 'SWART WILLIAM E &', true, true, false, false),
    (uuid_generate_v4(), true, '6954 WESTLAKE AVE', 'Dallas', 'TX', '75214', 'DUTTON K GEORGE', true, true, false, false),
    (uuid_generate_v4(), false, '6955 LAKEWOOD BLVD', 'Dallas', 'TX', '75214', 'PORTERA JOSEPH CHARLES &', true, true, false, false),
    -- Continue with more records...
    -- Note: This is a subset of the data. The complete script should include all records from the CSV
    
    -- For duplicate addresses (from duplicate_addresses.csv), we'll use the following strategy:
    -- 1. Keep the record with inside_cpc = true if it exists
    -- 2. Otherwise keep the record with inside_original = true
    -- 3. Finally, keep the record with reply = true
    
    -- Example of handling duplicates:
    (uuid_generate_v4(), true, '7031 TOKALON DR', 'Dallas', 'TX', '75214', 'REED MICHAEL J &', true, true, false, false),
    (uuid_generate_v4(), false, '7304 CROWNRICH LN', 'Dallas', 'TX', '75214', 'MCROBERTS NOEL HUNT III', false, false, false, false);

-- Update properties with Contributing and Signed Petition data
UPDATE dallas.properties
SET 
    is_contributing = CASE address
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
        WHEN '6953 WESTLAKE AVE' THEN false
        WHEN '6933 WESTLAKE AVE' THEN false
        WHEN '6925 WESTLAKE AVE' THEN true
        WHEN '6919 WESTLAKE AVE' THEN false
        WHEN '6917 WESTLAKE AVE' THEN false
        WHEN '6907 WESTLAKE AVE' THEN false
        WHEN '6903 WESTLAKE AVE' THEN true
        WHEN '6969 LAKEWOOD BLVD' THEN true
        WHEN '6961 LAKEWOOD BLVD' THEN false
        WHEN '6954 WESTLAKE AVE' THEN false
        WHEN '6955 LAKEWOOD BLVD' THEN false
        WHEN '6949 LAKEWOOD BLVD' THEN false
        WHEN '6950 WESTLAKE AVE' THEN false
        WHEN '6946 WESTLAKE AVE' THEN false
        WHEN '6942 WESTLAKE AVE' THEN false
        WHEN '6941 LAKEWOOD BLVD' THEN false
        WHEN '6938 WESTLAKE AVE' THEN false
        WHEN '6937 LAKEWOOD BLVD' THEN false
        WHEN '6934 WESTLAKE AVE' THEN false
        WHEN '6933 LAKEWOOD BLVD' THEN false
        WHEN '6930 WESTLAKE AVE' THEN false
        WHEN '6929 LAKEWOOD BLVD' THEN false
        WHEN '6926 WESTLAKE AVE' THEN false
        WHEN '6925 LAKEWOOD BLVD' THEN false
        WHEN '6922 WESTLAKE AVE' THEN false
        WHEN '6921 LAKEWOOD BLVD' THEN false
        WHEN '6918 WESTLAKE AVE' THEN false
        WHEN '6917 LAKEWOOD BLVD' THEN false
        WHEN '6914 WESTLAKE AVE' THEN false
        WHEN '6913 LAKEWOOD BLVD' THEN false
        WHEN '6910 WESTLAKE AVE' THEN false
        WHEN '6909 LAKEWOOD BLVD' THEN false
        WHEN '6906 WESTLAKE AVE' THEN false
        WHEN '6905 LAKEWOOD BLVD' THEN false
        WHEN '6902 WESTLAKE AVE' THEN false
        WHEN '6901 LAKEWOOD BLVD' THEN false
        WHEN '6861 LAKEWOOD BLVD' THEN true
        WHEN '6856 LAKESHORE DR' THEN false
        WHEN '6848 LAKESHORE DR' THEN false
        WHEN '6840 LAKESHORE DR' THEN false
        WHEN '6957 TOKALON DR' THEN false
        WHEN '6951 TOKALON DR' THEN false
        WHEN '6947 TOKALON DR' THEN false
        WHEN '6943 TOKALON DR' THEN false
        WHEN '6939 TOKALON DR' THEN false
        WHEN '6935 TOKALON DR' THEN false
        WHEN '6931 TOKALON DR' THEN false
        WHEN '6927 TOKALON DR' THEN false
        WHEN '6923 TOKALON DR' THEN false
        WHEN '6919 TOKALON DR' THEN false
        WHEN '6915 TOKALON DR' THEN false
        WHEN '6911 TOKALON DR' THEN false
        WHEN '6907 TOKALON DR' THEN false
        WHEN '6903 TOKALON DR' THEN false
        WHEN '6902 TOKALON DR' THEN false
        WHEN '6906 TOKALON DR' THEN false
        WHEN '6910 TOKALON DR' THEN false
        WHEN '6914 TOKALON DR' THEN false
        WHEN '6918 TOKALON DR' THEN false
        WHEN '6922 TOKALON DR' THEN false
        WHEN '6926 TOKALON DR' THEN false
        WHEN '6930 TOKALON DR' THEN false
        WHEN '6934 TOKALON DR' THEN false
        WHEN '6938 TOKALON DR' THEN false
        WHEN '6942 TOKALON DR' THEN false
        WHEN '6946 TOKALON DR' THEN false
        WHEN '6950 TOKALON DR' THEN false
        WHEN '6954 TOKALON DR' THEN false
        WHEN '6958 TOKALON DR' THEN false
        WHEN '6962 TOKALON DR' THEN false
        WHEN '6966 TOKALON DR' THEN false
        WHEN '6970 TOKALON DR' THEN false
        WHEN '7039 LAKESHORE DR' THEN true
        WHEN '7035 LAKESHORE DR' THEN false
        WHEN '7031 LAKESHORE DR' THEN false
        WHEN '7021 LAKESHORE DR' THEN false
        WHEN '7017 LAKESHORE DR' THEN false
        WHEN '7022 WESTLAKE AVE' THEN false
        WHEN '7018 WESTLAKE AVE' THEN false
        WHEN '7014 WESTLAKE AVE' THEN true
        WHEN '7002 WESTLAKE AVE' THEN false
        WHEN '7032 WESTLAKE AVE' THEN false
        WHEN '7040 WESTLAKE AVE' THEN false
        WHEN '7010 WESTLAKE AVE' THEN false
        WHEN '7006 WESTLAKE AVE' THEN false
        WHEN '7003 LAKEWOOD BLVD' THEN true
        WHEN '7007 LAKEWOOD BLVD' THEN true
        WHEN '7011 LAKEWOOD BLVD' THEN true
        WHEN '7015 LAKEWOOD BLVD' THEN true
        WHEN '7019 LAKEWOOD BLVD' THEN true
        WHEN '7023 LAKEWOOD BLVD' THEN true
        WHEN '7027 LAKEWOOD BLVD' THEN true
        WHEN '7031 LAKEWOOD BLVD' THEN true
        WHEN '7035 LAKEWOOD BLVD' THEN true
        WHEN '7006 LAKEWOOD BLVD' THEN false
        WHEN '7010 LAKEWOOD BLVD' THEN false
        WHEN '7012 LAKEWOOD BLVD' THEN false
        WHEN '7018 LAKEWOOD BLVD' THEN false
        WHEN '7022 LAKEWOOD BLVD' THEN true
        WHEN '7026 LAKEWOOD BLVD' THEN true
        WHEN '7030 LAKEWOOD BLVD' THEN false
        WHEN '7038 LAKEWOOD BLVD' THEN true
        WHEN '7039 LAKESHORE DR' THEN true
        WHEN '7035 LAKESHORE DR' THEN false
        WHEN '7031 LAKESHORE DR' THEN false
        WHEN '7021 LAKESHORE DR' THEN false
        WHEN '7017 LAKESHORE DR' THEN false
        WHEN '7015 LAKESHORE DR' THEN false
        WHEN '7001 LAKESHORE DR' THEN false
        WHEN '2716 WEST SHORE DR' THEN true
        WHEN '7000 LAKESHORE DR' THEN true
        WHEN '7008 LAKESHORE DR' THEN false
        WHEN '7012 LAKESHORE DR' THEN false
        WHEN '7016 LAKESHORE DR' THEN false
        WHEN '7022 LAKESHORE DR' THEN false
        WHEN '7028 LAKESHORE DR' THEN false
        WHEN '7034 LAKESHORE DR' THEN false
        WHEN '7047 TOKALON DR' THEN true
        WHEN '7031 TOKALON DR' THEN true
        WHEN '7027 TOKALON DR' THEN true
        WHEN '7023 TOKALON DR' THEN true
        WHEN '7011 TOKALON DR' THEN false
        WHEN '7007 TOKALON DR' THEN false
        WHEN '7003 TOKALON DR' THEN false
        WHEN '7100 LAKESHORE DR' THEN false
        WHEN '7110 LAKESHORE DR' THEN false
        WHEN '7102 LAKEWOOD BLVD' THEN false
        WHEN '7106 LAKEWOOD BLVD' THEN false
        WHEN '7110 LAKEWOOD BLVD' THEN false
        WHEN '7114 LAKEWOOD BLVD' THEN true
        WHEN '7118 LAKEWOOD BLVD' THEN true
        WHEN '7123 LAKESHORE DR' THEN false
        WHEN '7119 LAKESHORE DR' THEN true
        WHEN '7115 LAKESHORE DR' THEN false
        WHEN '7107 LAKESHORE DR' THEN false
        WHEN '7210 LAKEWOOD BLVD' THEN true
        WHEN '7214 LAKEWOOD BLVD' THEN false
        WHEN '7030 TOKALON DR' THEN true
        WHEN '7134 TOKALON DR' THEN false
        WHEN '7206 TOKALON DR' THEN false
        WHEN '7220 TOKALON DR' THEN false
        WHEN '6949 LAKESHORE DR' THEN false
        WHEN '6902 LAKESHORE DR' THEN false
        WHEN '6908 LAKESHORE DR' THEN false
        WHEN '7015 TOKALON DR' THEN false
        WHEN '7238 LAKEWOOD BLVD' THEN false
        WHEN '7242 LAKEWOOD BLVD' THEN false
        WHEN '7218 LAKEWOOD BLVD' THEN true
        WHEN '7243 TOKALON DR' THEN false
        WHEN '7044 TOKALON DR' THEN false
        WHEN '6748 AVALON AVE' THEN false
        WHEN '6752 AVALON AVE' THEN false
        WHEN '6758 AVALON AVE' THEN false
        WHEN '6757 GASTON AVE' THEN false
        WHEN '6751 GASTON AVE' THEN false
        WHEN '2301 BRENDENWOOD DR' THEN false
        WHEN '6748 LAKEWOOD BLVD' THEN false
        WHEN '6759 AVALON AVE' THEN false
        WHEN '2417 BRENDENWOOD DR' THEN false
        WHEN '6753 AVALON AVE' THEN false
        WHEN '6745 AVALON AVE' THEN false
        WHEN '6803 LAKEWOOD BLVD' THEN false
        WHEN '6729 LAKEWOOD BLVD' THEN false
        WHEN '6725 LAKEWOOD BLVD' THEN false
        WHEN '6815 LAKEWOOD BLVD' THEN false
        -- Continue with remaining addresses...
        WHEN '6926 MEADOW LAKE AVE' THEN false
        WHEN '6922 MEADOW LAKE AVE' THEN false
        WHEN '6918 MEADOW LAKE AVE' THEN false
        WHEN '6914 MEADOW LAKE AVE' THEN false
        WHEN '6910 MEADOW LAKE AVE' THEN false
        WHEN '6908 MEADOW LAKE AVE' THEN false
        WHEN '6906 MEADOW LAKE AVE' THEN false
        WHEN '6904 MEADOW LAKE AVE' THEN false
        WHEN '6902 MEADOW LAKE AVE' THEN false
        WHEN '6900 MEADOW LAKE AVE' THEN false
        WHEN '2426 PICKENS ST' THEN false
        WHEN '2425 PICKENS ST' THEN false
        WHEN '2429 PICKENS ST' THEN false
        WHEN '6854 WESTLAKE AVE' THEN false
        WHEN '6862 WESTLAKE AVE' THEN false
        WHEN '6868 WESTLAKE AVE' THEN false
        WHEN '2923 WENDOVER RD' THEN false
        WHEN '7000 MEADOW LAKE AVE' THEN false
        WHEN '7008 MEADOW LAKE AVE' THEN false
        WHEN '7014 MEADOW LAKE AVE' THEN false
        WHEN '7018 MEADOW LAKE AVE' THEN false
        WHEN '7022 MEADOW LAKE AVE' THEN false
        WHEN '7028 MEADOW LAKE AVE' THEN false
        WHEN '7032 MEADOW LAKE AVE' THEN false
        WHEN '7038 MEADOW LAKE AVE' THEN false
        WHEN '7048 MEADOW LAKE AVE' THEN false
        WHEN '7103 WESTLAKE AVE' THEN false
        WHEN '7109 WESTLAKE AVE' THEN false
        WHEN '7115 WESTLAKE AVE' THEN false
        WHEN '7121 WESTLAKE AVE' THEN false
        WHEN '7129 WESTLAKE AVE' THEN false
        WHEN '7102 MEADOW LAKE AVE' THEN false
        WHEN '7106 MEADOW LAKE AVE' THEN false
        WHEN '7200 WESTLAKE AVE' THEN false
        WHEN '7214 WESTLAKE AVE' THEN false
        WHEN '7218 WESTLAKE AVE' THEN false
        WHEN '7224 WESTLAKE AVE' THEN false
        WHEN '7230 WESTLAKE AVE' THEN false
        WHEN '7236 WESTLAKE AVE' THEN false
        WHEN '7244 WESTLAKE AVE' THEN false
        WHEN '7144 WESTLAKE AVE' THEN false
        WHEN '7140 WESTLAKE AVE' THEN false
        WHEN '7134 WESTLAKE AVE' THEN false
        WHEN '7128 WESTLAKE AVE' THEN false
        WHEN '7124 WESTLAKE AVE' THEN false
        WHEN '7118 WESTLAKE AVE' THEN false
        WHEN '7110 WESTLAKE AVE' THEN false
        WHEN '7114 WESTLAKE AVE' THEN false
        WHEN '7102 WESTLAKE AVE' THEN false
        WHEN '6820 MEADOW LAKE CIR' THEN false
        WHEN '6826 MEADOW LAKE CIR' THEN false
        WHEN '6840 MEADOW LAKE AVE' THEN false
        WHEN '6832 MEADOW LAKE AVE' THEN false
        WHEN '6865 WESTLAKE AVE' THEN false
        WHEN '6859 WESTLAKE AVE' THEN false
        WHEN '6830 LAKESHORE DR' THEN false
        WHEN '6818 LAKESHORE DR' THEN false
        WHEN '6841 LAKESHORE DR' THEN false
        WHEN '6848 VELASCO AVE' THEN false
        WHEN '6838 VELASCO AVE' THEN false
        WHEN '807 WHITEROCK RD' THEN false
        -- Continue with remaining addresses...
        WHEN '7103 LAKESHORE DR' THEN false
        WHEN '7117 LAKEWOOD BLVD' THEN false
        WHEN '6940 LAKEWOOD BLVD' THEN false
        WHEN '6925 LAKESHORE DR' THEN true
        WHEN '6903 LAKEWOOD BLVD' THEN false
        WHEN '6934 MEADOW LAKE AVE' THEN false
        WHEN '7010 TOKALON DR' THEN false
        WHEN '6927 TOKALON DR' THEN false
        WHEN '6901 WESTLAKE AVE' THEN false
        WHEN '6911 WESTLAKE AVE' THEN false
        WHEN '6934 WESTLAKE AVE' THEN false
        WHEN '6937 WESTLAKE AVE' THEN false
        WHEN '6941 WESTLAKE AVE' THEN false
        WHEN '6945 WESTLAKE AVE' THEN false
        WHEN '6957 WESTLAKE AVE' THEN true
        WHEN '6960 WESTLAKE AVE' THEN false
        WHEN '6964 WESTLAKE AVE' THEN false
        WHEN '7019 WESTLAKE AVE' THEN false
        WHEN '7026 WESTLAKE AVE' THEN false
        WHEN '7003 WESTLAKE AVE' THEN true
        WHEN '7227 LAKEWOOD BLVD' THEN false
        WHEN '6855 LAKEWOOD BLVD' THEN false
        WHEN '6826 LAKESHORE DR' THEN false
        WHEN '7040 TOKALON DR' THEN true
        WHEN '6945 LAKESHORE DR' THEN false
        WHEN '7034 LAKEWOOD BLVD' THEN true
        WHEN '7002 LAKEWOOD BLVD' THEN false
        WHEN '7209 LAKEWOOD BLVD' THEN false
        WHEN '7122 LAKEWOOD BLVD' THEN false
        WHEN '7202 LAKEWOOD BLVD' THEN false
        WHEN '7215 LAKEWOOD BLVD' THEN false
        WHEN '6847 LAKESHORE DR' THEN false
        WHEN '6855 LAKESHORE DR' THEN false
        WHEN '6865 LAKESHORE DR' THEN false
        WHEN '6955 LAKESHORE DR' THEN false
        WHEN '6960 LAKESHORE DR' THEN false
        WHEN '7007 LAKESHORE DR' THEN false
        WHEN '7025 LAKESHORE DR' THEN false
        WHEN '7038 LAKESHORE DR' THEN false
        WHEN '6865 TOKALON DR' THEN false
        WHEN '6870 TOKALON DR' THEN true
        WHEN '6858 TOKALON DR' THEN false
        WHEN '6964 TOKALON DR' THEN true
        WHEN '6914 TOKALON DR' THEN false
        WHEN '6950 TOKALON DR' THEN false
        WHEN '7019 TOKALON DR' THEN true
        WHEN '7022 TOKALON DR' THEN false
        WHEN '7148 TOKALON DR' THEN false
        WHEN '7317 TOKALON DR' THEN false
        WHEN '7303 TOKALON DR' THEN false
        WHEN '6832 AVALON AVE' THEN false
        WHEN '6873 BURWOOD LN' THEN false
        WHEN '6849 LAKEWOOD BLVD' THEN false
        WHEN '2432 HIDEAWAY DR' THEN true
        WHEN '2431 HIDEAWAY DR' THEN false
        WHEN '2425 HIDEAWAY DR' THEN false
        WHEN '7041 TOKALON DR' THEN false
        WHEN '7131 TOKALON DR' THEN false
        WHEN '7023 WESTLAKE AVE' THEN false
        WHEN '6921 WESTLAKE AVE' THEN false
        WHEN '6922 WESTLAKE AVE' THEN false
        ELSE is_contributing
    END,
    signed_petition = CASE address
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
        WHEN '6953 WESTLAKE AVE' THEN false
        WHEN '6933 WESTLAKE AVE' THEN false
        WHEN '6925 WESTLAKE AVE' THEN false
        WHEN '6919 WESTLAKE AVE' THEN false
        WHEN '6917 WESTLAKE AVE' THEN false
        WHEN '6907 WESTLAKE AVE' THEN false
        WHEN '6903 WESTLAKE AVE' THEN false
        WHEN '6969 LAKEWOOD BLVD' THEN false
        WHEN '6961 LAKEWOOD BLVD' THEN false
        WHEN '6954 WESTLAKE AVE' THEN false
        WHEN '6955 LAKEWOOD BLVD' THEN false
        WHEN '6949 LAKEWOOD BLVD' THEN false
        WHEN '6950 WESTLAKE AVE' THEN false
        WHEN '6946 WESTLAKE AVE' THEN false
        WHEN '6942 WESTLAKE AVE' THEN false
        WHEN '6941 LAKEWOOD BLVD' THEN false
        WHEN '6938 WESTLAKE AVE' THEN false
        WHEN '6937 LAKEWOOD BLVD' THEN false
        WHEN '6934 WESTLAKE AVE' THEN false
        WHEN '6933 LAKEWOOD BLVD' THEN false
        WHEN '6930 WESTLAKE AVE' THEN false
        WHEN '6929 LAKEWOOD BLVD' THEN false
        WHEN '6926 WESTLAKE AVE' THEN false
        WHEN '6925 LAKEWOOD BLVD' THEN false
        WHEN '6922 WESTLAKE AVE' THEN false
        WHEN '6921 LAKEWOOD BLVD' THEN false
        WHEN '6918 WESTLAKE AVE' THEN false
        WHEN '6917 LAKEWOOD BLVD' THEN false
        WHEN '6914 WESTLAKE AVE' THEN false
        WHEN '6913 LAKEWOOD BLVD' THEN false
        WHEN '6910 WESTLAKE AVE' THEN false
        WHEN '6909 LAKEWOOD BLVD' THEN false
        WHEN '6906 WESTLAKE AVE' THEN false
        WHEN '6905 LAKEWOOD BLVD' THEN false
        WHEN '6902 WESTLAKE AVE' THEN false
        WHEN '6901 LAKEWOOD BLVD' THEN false
        WHEN '6861 LAKEWOOD BLVD' THEN false
        WHEN '6856 LAKESHORE DR' THEN false
        WHEN '6848 LAKESHORE DR' THEN false
        WHEN '6840 LAKESHORE DR' THEN false
        WHEN '6957 TOKALON DR' THEN false
        WHEN '6951 TOKALON DR' THEN false
        WHEN '6947 TOKALON DR' THEN false
        WHEN '6943 TOKALON DR' THEN false
        WHEN '6939 TOKALON DR' THEN false
        WHEN '6935 TOKALON DR' THEN false
        WHEN '6931 TOKALON DR' THEN false
        WHEN '6927 TOKALON DR' THEN false
        WHEN '6923 TOKALON DR' THEN false
        WHEN '6919 TOKALON DR' THEN false
        WHEN '6915 TOKALON DR' THEN false
        WHEN '6911 TOKALON DR' THEN false
        WHEN '6907 TOKALON DR' THEN false
        WHEN '6903 TOKALON DR' THEN false
        WHEN '6902 TOKALON DR' THEN false
        WHEN '6906 TOKALON DR' THEN false
        WHEN '6910 TOKALON DR' THEN false
        WHEN '6914 TOKALON DR' THEN false
        WHEN '6918 TOKALON DR' THEN false
        WHEN '6922 TOKALON DR' THEN false
        WHEN '6926 TOKALON DR' THEN false
        WHEN '6930 TOKALON DR' THEN false
        WHEN '6934 TOKALON DR' THEN false
        WHEN '6938 TOKALON DR' THEN false
        WHEN '6942 TOKALON DR' THEN false
        WHEN '6946 TOKALON DR' THEN false
        WHEN '6950 TOKALON DR' THEN false
        WHEN '6954 TOKALON DR' THEN false
        WHEN '6958 TOKALON DR' THEN false
        WHEN '6962 TOKALON DR' THEN false
        WHEN '6966 TOKALON DR' THEN false
        WHEN '6970 TOKALON DR' THEN false
        WHEN '7039 LAKESHORE DR' THEN false
        WHEN '7035 LAKESHORE DR' THEN false
        WHEN '7031 LAKESHORE DR' THEN false
        WHEN '7021 LAKESHORE DR' THEN false
        WHEN '7017 LAKESHORE DR' THEN false
        WHEN '7022 WESTLAKE AVE' THEN false
        WHEN '7018 WESTLAKE AVE' THEN false
        WHEN '7014 WESTLAKE AVE' THEN false
        WHEN '7002 WESTLAKE AVE' THEN false
        WHEN '7032 WESTLAKE AVE' THEN false
        WHEN '7040 WESTLAKE AVE' THEN false
        WHEN '7010 WESTLAKE AVE' THEN false
        WHEN '7006 WESTLAKE AVE' THEN false
        WHEN '7003 LAKEWOOD BLVD' THEN false
        WHEN '7007 LAKEWOOD BLVD' THEN false
        WHEN '7011 LAKEWOOD BLVD' THEN false
        WHEN '7015 LAKEWOOD BLVD' THEN false
        WHEN '7019 LAKEWOOD BLVD' THEN false
        WHEN '7023 LAKEWOOD BLVD' THEN false
        WHEN '7027 LAKEWOOD BLVD' THEN false
        WHEN '7031 LAKEWOOD BLVD' THEN false
        WHEN '7035 LAKEWOOD BLVD' THEN false
        WHEN '7006 LAKEWOOD BLVD' THEN false
        WHEN '7010 LAKEWOOD BLVD' THEN false
        WHEN '7012 LAKEWOOD BLVD' THEN false
        WHEN '7018 LAKEWOOD BLVD' THEN false
        WHEN '7022 LAKEWOOD BLVD' THEN false
        WHEN '7026 LAKEWOOD BLVD' THEN false
        WHEN '7030 LAKEWOOD BLVD' THEN false
        WHEN '7038 LAKEWOOD BLVD' THEN false
        WHEN '7039 LAKESHORE DR' THEN false
        WHEN '7035 LAKESHORE DR' THEN false
        WHEN '7031 LAKESHORE DR' THEN false
        WHEN '7021 LAKESHORE DR' THEN false
        WHEN '7017 LAKESHORE DR' THEN false
        WHEN '7015 LAKESHORE DR' THEN false
        WHEN '7001 LAKESHORE DR' THEN false
        WHEN '2716 WEST SHORE DR' THEN false
        WHEN '7000 LAKESHORE DR' THEN false
        WHEN '7008 LAKESHORE DR' THEN false
        WHEN '7012 LAKESHORE DR' THEN false
        WHEN '7016 LAKESHORE DR' THEN false
        WHEN '7022 LAKESHORE DR' THEN false
        WHEN '7028 LAKESHORE DR' THEN false
        WHEN '7034 LAKESHORE DR' THEN false
        WHEN '7047 TOKALON DR' THEN false
        WHEN '7031 TOKALON DR' THEN false
        WHEN '7027 TOKALON DR' THEN false
        WHEN '7023 TOKALON DR' THEN false
        WHEN '7011 TOKALON DR' THEN false
        WHEN '7007 TOKALON DR' THEN false
        WHEN '7003 TOKALON DR' THEN false
        WHEN '7100 LAKESHORE DR' THEN false
        WHEN '7110 LAKESHORE DR' THEN false
        WHEN '7102 LAKEWOOD BLVD' THEN false
        WHEN '7106 LAKEWOOD BLVD' THEN false
        WHEN '7110 LAKEWOOD BLVD' THEN false
        WHEN '7114 LAKEWOOD BLVD' THEN false
        WHEN '7118 LAKEWOOD BLVD' THEN false
        WHEN '7123 LAKESHORE DR' THEN false
        WHEN '7119 LAKESHORE DR' THEN false
        WHEN '7115 LAKESHORE DR' THEN false
        WHEN '7107 LAKESHORE DR' THEN false
        WHEN '7210 LAKEWOOD BLVD' THEN false
        WHEN '7214 LAKEWOOD BLVD' THEN false
        WHEN '7030 TOKALON DR' THEN false
        WHEN '7134 TOKALON DR' THEN false
        WHEN '7206 TOKALON DR' THEN false
        WHEN '7220 TOKALON DR' THEN false
        WHEN '6949 LAKESHORE DR' THEN false
        WHEN '6902 LAKESHORE DR' THEN false
        WHEN '6908 LAKESHORE DR' THEN false
        WHEN '7015 TOKALON DR' THEN false
        WHEN '7238 LAKEWOOD BLVD' THEN false
        WHEN '7242 LAKEWOOD BLVD' THEN false
        WHEN '7218 LAKEWOOD BLVD' THEN false
        WHEN '7243 TOKALON DR' THEN false
        WHEN '7044 TOKALON DR' THEN false
        WHEN '6748 AVALON AVE' THEN false
        WHEN '6752 AVALON AVE' THEN false
        WHEN '6758 AVALON AVE' THEN false
        WHEN '6757 GASTON AVE' THEN false
        WHEN '6751 GASTON AVE' THEN false
        WHEN '2301 BRENDENWOOD DR' THEN false
        WHEN '6748 LAKEWOOD BLVD' THEN false
        WHEN '6759 AVALON AVE' THEN false
        WHEN '2417 BRENDENWOOD DR' THEN false
        WHEN '6753 AVALON AVE' THEN false
        WHEN '6745 AVALON AVE' THEN false
        WHEN '6803 LAKEWOOD BLVD' THEN false
        WHEN '6729 LAKEWOOD BLVD' THEN false
        WHEN '6725 LAKEWOOD BLVD' THEN false
        WHEN '6815 LAKEWOOD BLVD' THEN false
        -- Continue with remaining addresses...
        WHEN '6926 MEADOW LAKE AVE' THEN false
        WHEN '6922 MEADOW LAKE AVE' THEN false
        WHEN '6918 MEADOW LAKE AVE' THEN false
        WHEN '6914 MEADOW LAKE AVE' THEN false
        WHEN '6910 MEADOW LAKE AVE' THEN false
        WHEN '6908 MEADOW LAKE AVE' THEN false
        WHEN '6906 MEADOW LAKE AVE' THEN false
        WHEN '6904 MEADOW LAKE AVE' THEN false
        WHEN '6902 MEADOW LAKE AVE' THEN false
        WHEN '6900 MEADOW LAKE AVE' THEN false
        WHEN '2426 PICKENS ST' THEN false
        WHEN '2425 PICKENS ST' THEN false
        WHEN '2429 PICKENS ST' THEN false
        WHEN '6854 WESTLAKE AVE' THEN false
        WHEN '6862 WESTLAKE AVE' THEN false
        WHEN '6868 WESTLAKE AVE' THEN false
        WHEN '2923 WENDOVER RD' THEN false
        WHEN '7000 MEADOW LAKE AVE' THEN false
        WHEN '7008 MEADOW LAKE AVE' THEN false
        WHEN '7014 MEADOW LAKE AVE' THEN false
        WHEN '7018 MEADOW LAKE AVE' THEN false
        WHEN '7022 MEADOW LAKE AVE' THEN false
        WHEN '7028 MEADOW LAKE AVE' THEN false
        WHEN '7032 MEADOW LAKE AVE' THEN false
        WHEN '7038 MEADOW LAKE AVE' THEN false
        WHEN '7048 MEADOW LAKE AVE' THEN false
        WHEN '7103 WESTLAKE AVE' THEN false
        WHEN '7109 WESTLAKE AVE' THEN false
        WHEN '7115 WESTLAKE AVE' THEN false
        WHEN '7121 WESTLAKE AVE' THEN false
        WHEN '7129 WESTLAKE AVE' THEN false
        WHEN '7102 MEADOW LAKE AVE' THEN false
        WHEN '7106 MEADOW LAKE AVE' THEN false
        WHEN '7200 WESTLAKE AVE' THEN false
        WHEN '7214 WESTLAKE AVE' THEN false
        WHEN '7218 WESTLAKE AVE' THEN false
        WHEN '7224 WESTLAKE AVE' THEN false
        WHEN '7230 WESTLAKE AVE' THEN false
        WHEN '7236 WESTLAKE AVE' THEN false
        WHEN '7244 WESTLAKE AVE' THEN false
        WHEN '7144 WESTLAKE AVE' THEN false
        WHEN '7140 WESTLAKE AVE' THEN false
        WHEN '7134 WESTLAKE AVE' THEN false
        WHEN '7128 WESTLAKE AVE' THEN false
        WHEN '7124 WESTLAKE AVE' THEN false
        WHEN '7118 WESTLAKE AVE' THEN false
        WHEN '7110 WESTLAKE AVE' THEN false
        WHEN '7114 WESTLAKE AVE' THEN false
        WHEN '7102 WESTLAKE AVE' THEN false
        WHEN '6820 MEADOW LAKE CIR' THEN false
        WHEN '6826 MEADOW LAKE CIR' THEN false
        WHEN '6840 MEADOW LAKE AVE' THEN false
        WHEN '6832 MEADOW LAKE AVE' THEN false
        WHEN '6865 WESTLAKE AVE' THEN false
        WHEN '6859 WESTLAKE AVE' THEN false
        WHEN '6830 LAKESHORE DR' THEN false
        WHEN '6818 LAKESHORE DR' THEN false
        WHEN '6841 LAKESHORE DR' THEN false
        WHEN '6848 VELASCO AVE' THEN false
        WHEN '6838 VELASCO AVE' THEN false
        WHEN '807 WHITEROCK RD' THEN false
        -- Continue with remaining addresses...
        WHEN '7103 LAKESHORE DR' THEN false
        WHEN '7117 LAKEWOOD BLVD' THEN false
        WHEN '6940 LAKEWOOD BLVD' THEN false
        WHEN '6925 LAKESHORE DR' THEN false
        WHEN '6903 LAKEWOOD BLVD' THEN false
        WHEN '6934 MEADOW LAKE AVE' THEN false
        WHEN '7010 TOKALON DR' THEN false
        WHEN '6927 TOKALON DR' THEN false
        WHEN '6901 WESTLAKE AVE' THEN false
        WHEN '6911 WESTLAKE AVE' THEN false
        WHEN '6934 WESTLAKE AVE' THEN false
        WHEN '6937 WESTLAKE AVE' THEN false
        WHEN '6941 WESTLAKE AVE' THEN false
        WHEN '6945 WESTLAKE AVE' THEN false
        WHEN '6957 WESTLAKE AVE' THEN false
        WHEN '6960 WESTLAKE AVE' THEN false
        WHEN '6964 WESTLAKE AVE' THEN false
        WHEN '7019 WESTLAKE AVE' THEN false
        WHEN '7026 WESTLAKE AVE' THEN false
        WHEN '7003 WESTLAKE AVE' THEN false
        WHEN '7227 LAKEWOOD BLVD' THEN false
        WHEN '6855 LAKEWOOD BLVD' THEN false
        WHEN '6826 LAKESHORE DR' THEN false
        WHEN '7040 TOKALON DR' THEN false
        WHEN '6945 LAKESHORE DR' THEN false
        WHEN '7034 LAKEWOOD BLVD' THEN false
        WHEN '7002 LAKEWOOD BLVD' THEN false
        WHEN '7209 LAKEWOOD BLVD' THEN false
        WHEN '7122 LAKEWOOD BLVD' THEN false
        WHEN '7202 LAKEWOOD BLVD' THEN false
        WHEN '7215 LAKEWOOD BLVD' THEN false
        WHEN '6847 LAKESHORE DR' THEN false
        WHEN '6855 LAKESHORE DR' THEN false
        WHEN '6865 LAKESHORE DR' THEN false
        WHEN '6955 LAKESHORE DR' THEN false
        WHEN '6960 LAKESHORE DR' THEN false
        WHEN '7007 LAKESHORE DR' THEN false
        WHEN '7025 LAKESHORE DR' THEN false
        WHEN '7038 LAKESHORE DR' THEN false
        WHEN '6865 TOKALON DR' THEN false
        WHEN '6870 TOKALON DR' THEN false
        WHEN '6858 TOKALON DR' THEN false
        WHEN '6964 TOKALON DR' THEN false
        WHEN '6914 TOKALON DR' THEN false
        WHEN '6950 TOKALON DR' THEN false
        WHEN '7019 TOKALON DR' THEN false
        WHEN '7022 TOKALON DR' THEN false
        WHEN '7148 TOKALON DR' THEN false
        WHEN '7317 TOKALON DR' THEN false
        WHEN '7303 TOKALON DR' THEN false
        WHEN '6832 AVALON AVE' THEN false
        WHEN '6873 BURWOOD LN' THEN false
        WHEN '6849 LAKEWOOD BLVD' THEN false
        WHEN '2432 HIDEAWAY DR' THEN false
        WHEN '2431 HIDEAWAY DR' THEN false
        WHEN '2425 HIDEAWAY DR' THEN false
        WHEN '7041 TOKALON DR' THEN false
        WHEN '7131 TOKALON DR' THEN false
        WHEN '7023 WESTLAKE AVE' THEN false
        WHEN '6921 WESTLAKE AVE' THEN false
        WHEN '6922 WESTLAKE AVE' THEN false
        ELSE signed_petition
    END;

-- Update geometry column for spatial queries (if needed)
UPDATE dallas.properties
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE longitude IS NOT NULL AND latitude IS NOT NULL;

-- Create spatial index (if needed)
CREATE INDEX IF NOT EXISTS properties_geom_idx ON dallas.properties USING GIST (geom);

-- Analyze the table for query optimization
ANALYZE dallas.properties;
