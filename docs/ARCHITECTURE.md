# Architecture Documentation

## Overview

AI Brain is built on NestJS with Fastify, providing a high-performance REST API for managing AI roles and capabilities.

## Technology Stack

- **Framework**: NestJS 11.x
- **HTTP Server**: Fastify (via @nestjs/platform-fastify)
- **Database**: PostgreSQL with TypeORM
- **Validation**: nestjs-zod (Zod integration for NestJS)
- **API Documentation**: Swagger/OpenAPI
- **Configuration**: YAML files + environment variables
- **Language**: TypeScript

## Design Principles

### 1. Action-Based API Routing
All endpoints use POST requests with action-based paths:
- Pattern: `/{resource}/action/{action}`
- Example: `/roles/action/create`, `/capabilities/action/list`
- Benefit: Simplifies future permission management

### 2. Configuration Strategy
- **Environment Variables (.env)**: Only critical/sensitive configs (PORT, DB_PASSWORD)
- **YAML Files (config/)**: All other configurations
- **Benefit**: Easy to manage, version control friendly

### 3. Validation Layer
- **nestjs-zod**: Integration of Zod with NestJS
- **Type-safe DTOs**: Automatic TypeScript type inference from Zod schemas
- **Global Validation**: ZodValidationPipe applied globally to all endpoints
- **Swagger Integration**: Automatic API documentation from Zod schemas

### 4. Database Design
- **Entities**: TypeORM entities with decorators
- **Relations**: Many-to-Many between Roles and Capabilities
- **Auto-sync**: Development mode auto-creates tables (disable in production)

## Module Structure

### Roles Module
```
src/modules/roles/
├── dto/
│   └── role.dto.ts          # Zod schemas and TypeScript types
├── roles.controller.ts       # API endpoints
├── roles.service.ts          # Business logic
└── roles.module.ts           # Module definition
```

**Responsibilities**:
- Manage role CRUD operations
- Handle role-capability associations
- Validate role data

### Capabilities Module
```
src/modules/capabilities/
├── dto/
│   └── capability.dto.ts     # Zod schemas and TypeScript types
├── capabilities.controller.ts # API endpoints
├── capabilities.service.ts    # Business logic
└── capabilities.module.ts     # Module definition
```

**Responsibilities**:
- Manage capability CRUD operations
- Track capability usage across roles
- Validate capability data

## Database Schema

### Roles Table
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Capabilities Table
```sql
CREATE TABLE capabilities (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Role-Capability Junction Table
```sql
CREATE TABLE role_capabilities (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  capability_id UUID REFERENCES capabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, capability_id)
);
```

## Request Flow

1. **Client Request** → POST to `/api/v1/{resource}/action/{action}`
2. **Controller** → Receives request, applies ZodValidationPipe
3. **Validation** → Zod schema validates request body
4. **Service** → Business logic execution
5. **Repository** → TypeORM database operations
6. **Response** → JSON response to client

## Error Handling

- **Validation Errors**: 400 Bad Request with Zod error details
- **Not Found**: 404 with descriptive message
- **Conflicts**: 409 for duplicate names
- **Server Errors**: 500 with error details (sanitized in production)

## Configuration Files

### config/app.yaml
```yaml
app:
  name: AI Brain
  version: 1.0.0
  port: 3000
  apiPrefix: /api/v1

server:
  fastify:
    logger: true
    bodyLimit: 10485760  # 10MB
```

### config/database.yaml
```yaml
database:
  type: postgres
  host: localhost
  port: 5432
  username: postgres
  password: postgres
  database: ai_brain
  synchronize: true    # Auto-create tables
  logging: false       # SQL query logging
```

## Scalability Considerations

### Current Architecture
- Single server deployment
- Direct database connections
- Synchronous request handling

### Future Enhancements
- **Caching**: Redis for frequently accessed roles/capabilities
- **Queue System**: Bull/BullMQ for async operations
- **Microservices**: Split into separate services if needed
- **API Gateway**: Add rate limiting and authentication
- **Database**: Read replicas for scaling reads

## Security Considerations

### Current Implementation
- Input validation with Zod
- SQL injection prevention via TypeORM
- UUID-based IDs (non-sequential)

### Recommended Additions
- Authentication (JWT, OAuth)
- Authorization (role-based access control)
- Rate limiting
- CORS configuration
- Request logging and monitoring
- Secrets management (Vault, AWS Secrets Manager)

## Development Workflow

1. **Local Development**: `npm run start:dev` (watch mode)
2. **Build**: `npm run build` (compiles to dist/)
3. **Production**: `npm run start:prod` (runs compiled code)
4. **Testing**: `npm run test` (unit tests)
5. **E2E Testing**: `npm run test:e2e`

## Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Environment variables configured

### Steps
1. Install dependencies: `npm ci`
2. Build application: `npm run build`
3. Run migrations (if using)
4. Start application: `npm run start:prod`

### Environment Variables
```bash
PORT=3000
DB_PASSWORD=secure_password
NODE_ENV=production
```

## Monitoring

Recommended monitoring points:
- API response times
- Database query performance
- Error rates
- Active connections
- Memory usage

## Future Roadmap

1. **Authentication & Authorization**
2. **API Documentation** (Swagger/OpenAPI)
3. **Caching Layer** (Redis)
4. **Event System** (for role/capability changes)
5. **Audit Logging** (track all changes)
6. **Versioning** (API versioning strategy)
7. **GraphQL** (alternative to REST)
