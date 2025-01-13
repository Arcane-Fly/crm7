# Administrator Guide

## Overview

This guide explains the administrative features available to users with admin access, particularly for the email `braden.lang77@gmail.com`.

## Admin Features

### Schema Management

Administrators can modify the database schema directly from the UI:

1. Add new columns to existing tables
2. Define column types and constraints
3. View table structure

### Field Editing

- Edit any field value directly from the UI

- Changes are immediately reflected in the database
- All edits are tracked in the audit log

### Bulk Operations

- Import data from Excel files
- Export selected records to Excel
- Bulk delete records
- Bulk update operations

### Document Management

- Preview documents (PDF, images)
- Upload and organize files
- Set document categories
- Manage document permissions

## How to Use

### Schema Editor

1. Look for the "Edit Schema" button in data tables
2. Click to open the schema editor
3. Add new columns by specifying:
   - Column name
   - Data type
   - Constraints

### Field Editor

1. Hover over any field to see the edit icon
2. Click the icon to open the editor
3. Make changes and save
4. Changes are immediately reflected

### Bulk Operations

1. Select records using checkboxes
2. Click "Bulk Actions"
3. Choose operation:
   - Export to Excel
   - Delete selected
   - Import from Excel

### Document Preview

1. Click on any document in the documents table
2. Use the preview window to:
   - Navigate pages (PDF)
   - Zoom in/out
   - Download

## Security

- All admin actions are logged
- Schema changes require admin privileges
- Field edits are tracked
- Regular backups are maintained

## Best Practices

1. Always test schema changes
2. Back up data before bulk operations
3. Use meaningful column names
4. Document all schema changes
5. Regularly review audit logs
