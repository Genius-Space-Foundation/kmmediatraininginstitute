# PostgreSQL Migration Guide

This guide will help you migrate the KM Media application from SQLite to PostgreSQL.

## Overview

The application has been successfully migrated from SQLite to PostgreSQL. This migration provides:

- **Better scalability**: PostgreSQL can handle larger datasets and concurrent users
- **Advanced features**: Full ACID compliance, complex queries, and advanced data types
- **Production readiness**: PostgreSQL is the industry standard for production applications
- **Better performance**: Optimized for complex queries and large datasets

## Changes Made

### 1. Dependencies Updated

- Replaced `sqlite3` with `pg` (PostgreSQL client)
- Added `@types/pg` for TypeScript support

### 2. Database Configuration

- Updated environment variables for PostgreSQL connection
- Modified database connection pool setup
- Changed from file-based SQLite to client-server PostgreSQL

### 3. Query Syntax Updates

- Updated all SQL queries to use PostgreSQL parameterized queries (`$1, $2, ...`)
- Added proper column name quoting for camelCase fields
- Updated INSERT statements to use `RETURNING` clause

### 4. Docker Configuration

- Added PostgreSQL service to Docker Compose
- Updated environment variables for containerized setup

## Quick Setup

### Option 1: Using Docker (Recommended)

1. **Run the setup script:**

   ```bash
   ./scripts/setup-postgres.sh
   ```

2. **Or manually:**

   ```bash
   # Install dependencies
   cd server
   npm install pg @types/pg
   cd ..

   # Start PostgreSQL
   docker-compose up -d postgres

   # Start the application
   docker-compose up
   ```

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL locally:**

   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Create database:**

   ```sql
   CREATE DATABASE kmmedia;
   CREATE USER kmmedia_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE kmmedia TO kmmedia_user;
   ```

3. **Update environment variables:**

   ```bash
   cp server/env.example server/.env
   # Edit server/.env with your PostgreSQL credentials
   ```

4. **Install dependencies and start:**
   ```bash
   cd server
   npm install pg @types/pg
   npm run dev
   ```

## Environment Variables

Update your `server/.env` file with PostgreSQL configuration:

```env
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmmedia
DB_USER=postgres
DB_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/kmmedia
```

## Database Schema

The migration includes all existing tables with PostgreSQL-specific optimizations:

- **Users**: User accounts with roles (user, admin, trainer)
- **Courses**: Course information with trainer relationships
- **Registrations**: Course enrollment records
- **Stories**: Blog posts and content
- **Story Comments**: Comments on stories
- **Story Likes**: Like functionality for stories
- **Trainer Profiles**: Extended trainer information

## Default Data

The migration automatically creates:

- **Admin user**: `admin@kmmedia.com` / `admin123`
- **Trainer user**: `trainer@kmmedia.com` / `trainer123`
- **Sample courses**: 6 pre-populated courses
- **Sample stories**: 2 example stories

## Migration Benefits

### Performance Improvements

- **Connection pooling**: Efficient database connection management
- **Indexed queries**: Better query performance on large datasets
- **Concurrent access**: Multiple users can access the database simultaneously

### Data Integrity

- **ACID compliance**: Full transaction support
- **Foreign key constraints**: Referential integrity enforcement
- **Data validation**: Built-in data type validation

### Scalability

- **Horizontal scaling**: Can be distributed across multiple servers
- **Replication**: Built-in support for read replicas
- **Partitioning**: Large table optimization

## Troubleshooting

### Common Issues

1. **Connection refused:**

   - Ensure PostgreSQL is running
   - Check port 5432 is not blocked
   - Verify credentials in `.env` file

2. **Permission denied:**

   - Check database user permissions
   - Ensure database exists
   - Verify connection string format

3. **Docker issues:**
   - Restart Docker containers: `docker-compose down && docker-compose up`
   - Check container logs: `docker-compose logs postgres`

### Useful Commands

```bash
# Check PostgreSQL status
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Connect to PostgreSQL directly
docker-compose exec postgres psql -U postgres -d kmmedia

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

## Production Deployment

For production deployment:

1. **Use environment-specific credentials**
2. **Enable SSL connections**
3. **Set up database backups**
4. **Configure connection pooling**
5. **Monitor database performance**

Example production environment variables:

```env
DB_HOST=your-production-host
DB_PORT=5432
DB_NAME=kmmedia_prod
DB_USER=kmmedia_prod_user
DB_PASSWORD=secure_production_password
DATABASE_URL=postgresql://kmmedia_prod_user:secure_production_password@your-production-host:5432/kmmedia_prod
```

## Support

If you encounter any issues during migration:

1. Check the troubleshooting section above
2. Review the application logs
3. Verify your PostgreSQL installation
4. Ensure all environment variables are correctly set

The migration maintains full backward compatibility with the existing API endpoints while providing the benefits of a robust PostgreSQL database.
