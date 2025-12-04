# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Capabilities API

### Create Capability
**POST** `/capabilities/action/create`

Request Body:
```json
{
  "name": "Database Operations",
  "description": "Ability to perform database operations",
  "prompt": "You are an expert in database operations. You can query, update, and optimize databases."
}
```

### List Capabilities
**POST** `/capabilities/action/list`

Request Body:
```json
{
  "page": 1,
  "limit": 10,
  "search": "database"
}
```

### Get Capability
**POST** `/capabilities/action/get`

Request Body:
```json
{
  "id": "uuid-here"
}
```

### Update Capability
**POST** `/capabilities/action/update`

Request Body:
```json
{
  "id": "uuid-here",
  "name": "Advanced Database Operations",
  "description": "Updated description",
  "prompt": "Updated prompt",
  "isActive": true
}
```

### Delete Capability
**POST** `/capabilities/action/delete`

Request Body:
```json
{
  "id": "uuid-here"
}
```

## Roles API

### Create Role
**POST** `/roles/action/create`

Request Body:
```json
{
  "name": "DBA",
  "description": "Database Administrator role",
  "prompt": "You are a professional DBA with expertise in database management.",
  "capabilityIds": ["capability-uuid-1", "capability-uuid-2"]
}
```

### List Roles
**POST** `/roles/action/list`

Request Body:
```json
{
  "page": 1,
  "limit": 10,
  "search": "DBA"
}
```

### Get Role
**POST** `/roles/action/get`

Request Body:
```json
{
  "id": "uuid-here"
}
```

### Update Role
**POST** `/roles/action/update`

Request Body:
```json
{
  "id": "uuid-here",
  "name": "Senior DBA",
  "description": "Updated description",
  "prompt": "Updated prompt",
  "isActive": true,
  "capabilityIds": ["capability-uuid-1", "capability-uuid-2", "capability-uuid-3"]
}
```

### Delete Role
**POST** `/roles/action/delete`

Request Body:
```json
{
  "id": "uuid-here"
}
```

## Example: Creating a DBA Role with Capabilities

1. Create capabilities:
```bash
# Create Database Operations capability
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database Operations",
    "description": "Perform database queries and operations",
    "prompt": "You can execute SQL queries, analyze query performance, and optimize database operations."
  }'

# Create SQL Checking capability
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SQL Checking",
    "description": "Review and validate SQL statements",
    "prompt": "You can analyze SQL statements for syntax errors, security issues, and performance problems."
  }'

# Create Database Configuration capability
curl -X POST http://localhost:3000/api/v1/capabilities/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Database Configuration",
    "description": "Manage database configuration settings",
    "prompt": "You can review and optimize database configuration parameters for performance and security."
  }'
```

2. Create DBA role with capabilities:
```bash
curl -X POST http://localhost:3000/api/v1/roles/action/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DBA",
    "description": "Database Administrator with full database management capabilities",
    "prompt": "You are a professional Database Administrator. You have expertise in database operations, SQL optimization, and database configuration management.",
    "capabilityIds": ["<capability-id-1>", "<capability-id-2>", "<capability-id-3>"]
  }'
```
