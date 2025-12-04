# Quick Start Guide

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup PostgreSQL database:
```bash
# Create database
createdb ai_brain

# Or using psql
psql -U postgres
CREATE DATABASE ai_brain;
\q
```

3. Configure database connection in `config/database.yaml`:
```yaml
database:
  type: postgres
  host: localhost
  port: 5432
  username: postgres
  password: your_password
  database: ai_brain
  synchronize: true  # Auto-create tables (disable in production)
  logging: false
```

4. Start the application:
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api/v1`

Swagger API documentation: `http://localhost:3000/api-docs`

## Example: Create a DBA Role

### Step 1: Create Capabilities

```bash
# 1. Database Operations
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database Operations",
    "description": "Execute and manage database operations",
    "prompt": "You can execute SQL queries, analyze query performance, and optimize database operations. You understand database indexes, query plans, and performance tuning."
  }'

# Save the returned ID as CAPABILITY_1_ID

# 2. SQL Checking
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SQL Checking",
    "description": "Review and validate SQL statements",
    "prompt": "You can analyze SQL statements for syntax errors, security vulnerabilities (SQL injection), and performance issues. You provide recommendations for query optimization."
  }'

# Save the returned ID as CAPABILITY_2_ID

# 3. Database Configuration
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database Configuration",
    "description": "Manage and optimize database configuration",
    "prompt": "You can review and optimize database configuration parameters including memory settings, connection pools, and performance tuning parameters. You understand PostgreSQL, MySQL, and other database systems."
  }'

# Save the returned ID as CAPABILITY_3_ID
```

### Step 2: Create DBA Role

```bash
curl -X POST http://localhost:3000/api/v1/roles/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DBA",
    "description": "Database Administrator with comprehensive database management capabilities",
    "prompt": "You are a professional Database Administrator with years of experience. You excel at database operations, SQL optimization, and configuration management. You prioritize data integrity, security, and performance.",
    "capabilityIds": ["CAPABILITY_1_ID", "CAPABILITY_2_ID", "CAPABILITY_3_ID"]
  }'
```

### Step 3: Query the Role

```bash
# List all roles
curl -X POST http://localhost:3000/api/v1/roles/action/list \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10
  }'

# Get specific role with capabilities
curl -X POST http://localhost:3000/api/v1/roles/action/get \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ROLE_ID_HERE"
  }'
```

## Testing with PowerShell (Windows)

```powershell
# Create capability
$body = @{
    name = "Database Operations"
    description = "Execute and manage database operations"
    prompt = "You can execute SQL queries and optimize database operations."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/capabilities/action/create" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

# List capabilities
$listBody = @{
    page = 1
    limit = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/capabilities/action/list" `
  -Method Post `
  -ContentType "application/json" `
  -Body $listBody
```

## Next Steps

- See [API.md](./API.md) for complete API documentation
- Customize capabilities for your specific use cases
- Create additional roles (Developer, DevOps, Security Analyst, etc.)
- Integrate with your AI platform
