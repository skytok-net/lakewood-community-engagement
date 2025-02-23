# Property Data Update Process

This document describes the process for updating the property records in the `dallas.properties` table with contributing and signed petition data from the CSV dataset.

## Overview

The update process uses SQL scripts to modify the existing property records in the `dallas.properties` table. The script:
- Preserves all existing records and their GIS information
- Updates the `is_contributing` and `signed_petition` columns based on the CSV data
- Handles duplicate addresses appropriately through the unique constraint
- Does not delete or truncate any existing data

## Prerequisites

1. The `dallas.properties` table must exist with the following schema:
   - Primary key: `id` (UUID)
   - Unique constraint on `address`
   - Columns: `is_contributing` (boolean) and `signed_petition` (boolean)
   - All other columns (GIS data, location info) remain unchanged

2. The CSV data file (`2-21-235pm-Table 1.csv`) should be available and contain:
   - Property addresses
   - Contributing status
   - Signed petition status

## IMPORTANT: Data Recovery Steps

If you ran the previous `final_properties_load.sql` script and lost data, here are the recovery steps:

1. If you have a backup, restore it:
   ```sql
   DROP TABLE dallas.properties;
   ALTER TABLE dallas.properties_backup RENAME TO properties;
   ```

2. If no backup exists, you'll need to:
   - Restore from your last database backup
   - Re-run any GIS data updates that were applied after that backup

## New Update Process

The new process uses `update_property_status.sql` which ONLY updates the `is_contributing` and `signed_petition` columns for existing records. It:

1. Preserves all existing records (450+ rows)
2. Keeps all GIS data intact
3. Only modifies the two new columns
4. Maintains all other data

### Steps to Update

1. **Backup the Current Table (REQUIRED)**
   ```sql
   CREATE TABLE dallas.properties_backup AS 
   SELECT * FROM dallas.properties;
   ```

2. **Run the Update Script**
   ```sql
   \i update_property_status.sql
   ```

3. **Verify the Update**
   The script includes verification queries that will show:
   - Total number of records (should match original count)
   - Number of records with contributing status set
   - Number of records with petition status set

### Important Notes

1. This script ONLY UPDATES existing records
2. No data is deleted or truncated
3. All GIS data and other columns remain unchanged
4. The script uses CASE statements to match exact addresses
5. Unmatched addresses keep their existing values

### Troubleshooting

If you encounter any issues:
1. Stop the update process if it's still running
2. Do not make any additional changes to the table
3. Restore from the backup created in step 1
4. Contact the database administrator for assistance

## Support

For any issues or questions about the update process, please contact the database administrator immediately.
