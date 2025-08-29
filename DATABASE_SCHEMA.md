# TeacherDash Database Schema

## Overview
This document describes the database schema for the TeacherDash application, which uses SQLite as the database engine.

## Database File
- **Location**: `data/teacherdash.db`
- **Engine**: SQLite 3
- **Character Set**: UTF-8

## Tables

### 1. students
The main table storing student information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for each student |
| `name` | TEXT | NOT NULL, CHECK(length >= 2) | Student's full name (minimum 2 characters) |
| `email` | TEXT | NOT NULL, UNIQUE, CHECK(email LIKE '%_@_%') | Student's email address (must be unique and valid format) |
| `subject` | TEXT | NOT NULL, CHECK(subject IN ('Math', 'Science', 'English', 'History')) | Academic subject (restricted to valid options) |
| `grade` | INTEGER | NOT NULL, CHECK(grade >= 0 AND grade <= 100) | Numeric grade (0-100 scale) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp when student record was created |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp when student record was last updated |

### 2. schema_version
Tracks database migration versions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `version` | INTEGER | PRIMARY KEY | Migration version number |
| `applied_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When the migration was applied |

## Indexes

### Performance Indexes
- `idx_students_email` on `students(email)` - Fast email lookups for uniqueness checks
- `idx_students_subject` on `students(subject)` - Fast subject filtering
- `idx_students_created_at` on `students(created_at)` - Fast date-based sorting

## Triggers

### Automatic Timestamp Updates
```sql
CREATE TRIGGER update_students_timestamp 
AFTER UPDATE ON students
BEGIN
  UPDATE students SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

This trigger automatically updates the `updated_at` timestamp whenever a student record is modified.

## Constraints

### Data Validation
- **Name**: Must be at least 2 characters long
- **Email**: Must be unique and contain '@' character
- **Subject**: Must be one of: Math, Science, English, History
- **Grade**: Must be between 0 and 100 (inclusive)

### Referential Integrity
- All foreign key relationships are maintained through application logic
- No cascading deletes (manual cleanup required)

## Sample Data

### Insert Sample Student
```sql
INSERT INTO students (name, email, subject, grade) 
VALUES ('John Doe', 'john.doe@example.com', 'Math', 85);
```

### Query Examples

#### Get All Students
```sql
SELECT * FROM students ORDER BY created_at DESC;
```

#### Get Students by Subject
```sql
SELECT * FROM students WHERE subject = 'Math' ORDER BY grade DESC;
```

#### Get Average Grade by Subject
```sql
SELECT subject, AVG(grade) as average, COUNT(*) as count 
FROM students 
GROUP BY subject;
```

#### Get Recent Additions
```sql
SELECT * FROM students 
ORDER BY created_at DESC 
LIMIT 5;
```

## Migration System

The database uses a versioned migration system to handle schema updates:

1. **Version 1**: Create initial students table
2. **Version 2**: Create performance indexes
3. **Version 3**: Add automatic timestamp trigger

### Running Migrations
```bash
npm run db:migrate
```

### Reset Database
```bash
npm run db:reset
```

## Security Considerations

- All student routes require valid JWT authentication
- Email addresses are normalized (lowercase, trimmed) before storage
- Input validation occurs at both application and database levels
- SQL injection protection through parameterized queries

## Backup and Recovery

### Backup
```bash
cp data/teacherdash.db data/teacherdash_backup_$(date +%Y%m%d_%H%M%S).db
```

### Restore
```bash
cp data/teacherdash_backup_YYYYMMDD_HHMMSS.db data/teacherdash.db
```

## Performance Notes

- Indexes are optimized for common query patterns
- Email uniqueness checks are fast due to indexed lookups
- Subject filtering is efficient with dedicated index
- Date-based sorting is optimized for analytics queries

## Troubleshooting

### Common Issues
1. **Email uniqueness violations**: Check for duplicate emails in existing data
2. **Subject validation errors**: Ensure subject values match allowed options
3. **Grade range errors**: Verify grades are within 0-100 range
4. **Migration failures**: Check database file permissions and disk space

### Debug Queries
```sql
-- Check database integrity
PRAGMA integrity_check;

-- View table information
PRAGMA table_info(students);

-- Check indexes
PRAGMA index_list(students);
```
