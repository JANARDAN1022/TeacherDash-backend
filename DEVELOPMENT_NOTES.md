# Backend Development Notes - TeacherDash

## Initial Approach & Understanding

After reading through the assignment requirements, I understood the core need: a Node.js/Express backend with SQLite database providing JWT-authenticated API endpoints for student management. The requirements were clear - implement CRUD operations, authentication, and analytics with specific validation rules.

## Thought Process

My development approach was straightforward:

1. First, get a working boilerplate using GitHub Copilot
2. Test the basic functionality to see what works and what doesn't
3. Fix any broken parts using Cursor AI for debugging
4. Only worry about enhancements after core functionality was solid

I decided to tackle the backend first since the frontend would depend on having working APIs.

## Technical Decisions Made

### Framework & Database Choice

- **Express.js**: Went with Express because the assignment specified it
- **SQLite**: Perfect choice for a desktop app - no need for a separate database server, just a file
- **JWT Authentication**: Stateless tokens work well for desktop apps, simpler than sessions and also mentioned in the assignment

### Libraries Selected

- **express-validator**: Needed robust validation for the specific requirements (grade 0-100, email format, etc.)
- **cors**: Essential for Electron app to communicate with the backend
- **sqlite3**: Direct SQLite driver - kept it simple rather than using an ORM
- **jsonwebtoken**: Standard JWT implementation
- **dotenv**: For environment variables

## Development Process

### Getting the Boilerplate

Used GitHub Copilot to generate the initial Express server structure. Asked it to create:

- Basic Express server setup
- SQLite database initialization
- JWT auth middleware
- CRUD endpoints for students
- Input validation with express-validator

The boilerplate was pretty good but had some issues I needed to fix.

## Problems Encountered & Solutions

### 1. Email Normalization Bug

**Issue**: The PUT route for updating students was missing the `normalizedEmail` variable, causing crashes when trying to update student emails.
**Solution**: Added proper email normalization using express-validator's `normalizeEmail()` before database operations. Used Cursor to help debug this - it caught the undefined variable issue.

### 2. Environment Variable Confusion

**Issue**: Had some syntax errors with `process.env` variables in the Electron main process.
**Solution**: Fixed the environment variable access syntax. If I remember correctly, it was just missing proper fallbacks and syntax issues.

### 3. CORS Configuration

**Issue**: Initially had CORS issues when the Electron app tried to connect to localhost:3001
**Solution**: Properly configured CORS to allow requests from the Electron app. Set it up to allow all origins during development.

### 4. SQLite Database Path

**Issue**: Database file wasn't being created in the right location initially
**Solution**: Made sure the database path was correct and that the directory existed before trying to create the database.

## Testing Approach

I tested everything manually as I built it:

- test all API endpoints
- Verified JWT token generation and validation
- Tested all CRUD operations with different data
- Made sure validation was working for all the edge cases
- Checked that analytics endpoint returned correct data

## What I Would Improve With More Time

### Database & Schema

- Implement soft deletes instead of hard deletes
- Add indexes for better performance with larger datasets
- User management system instead of hardcoded credentials

### Security Enhancements

- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input sanitization beyond just validation
- Proper environment-based configuration

### API Improvements

- Pagination for student lists
- More advanced filtering and sorting options
- Bulk operations for adding/updating multiple students
- File upload capabilities for student imports
- Detailed audit logging
  (could have added these but did not wanna over do so kept it as it was in the assignment)

### Error Handling

- More specific error messages
- Proper logging system
- Error categorization and monitoring
- Graceful handling of database connection issues

## Assumptions Made

1. **Single User**: Only one teacher would use this app at a time
2. **Local Development**: Backend would run on localhost:3001 with frontend connecting to it
3. **Simple Deployment**: No need for production deployment considerations
4. **Network**: Reliable local network connection between Electron app and backend

## Architecture Decisions

Kept the architecture simple and straightforward:

- Single Express server handling all routes
- Middleware for authentication, validation, and error handling
- Direct SQLite queries without ORM complexity
- RESTful API design following standard conventions
- Centralized error handling with consistent response formats

The goal was to have something that works reliably rather than over-engineering it. Used AI tools to speed up development but made sure I understood every piece of code before moving forward.
