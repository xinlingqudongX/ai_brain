<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


## Description

AI Brain - A NestJS-based platform for managing AI roles and capabilities. This system allows you to define roles (like DBA, Developer, etc.) and their associated capabilities, with customizable prompts for each.

## Features

- **Role Management**: Create and manage AI roles with custom prompts
- **Capability System**: Define reusable capabilities that can be assigned to roles
- **Fastify Integration**: High-performance HTTP server
- **TypeORM + PostgreSQL**: Robust database layer
- **Zod Validation**: Type-safe request validation
- **YAML Configuration**: Flexible configuration management

## Tech Stack

- NestJS with Fastify
- TypeORM + PostgreSQL
- nestjs-zod for validation
- Swagger for API documentation
- YAML configuration files
- TypeScript

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Project setup

1. Install dependencies:
```bash
$ npm install
```

2. Configure environment:
```bash
$ cp .env.example .env
# Edit .env with your settings
```

3. Configure database in `config/database.yaml`:
```yaml
database:
  host: localhost
  port: 5432
  username: postgres
  password: your_password
  database: ai_brain
```

4. Start PostgreSQL and create database:
```bash
$ createdb ai_brain
```
## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

All APIs use POST requests with action-based routing (e.g., `/roles/action/create`).

## Project Structure

```
src/
├── common/
│   └── pipes/              # Zod validation pipe
├── entities/               # TypeORM entities
│   ├── role.entity.ts
│   └── capability.entity.ts
├── modules/
│   ├── roles/             # Role management module
│   │   ├── dto/
│   │   ├── roles.controller.ts
│   │   ├── roles.service.ts
│   │   └── roles.module.ts
│   └── capabilities/      # Capability management module
│       ├── dto/
│       ├── capabilities.controller.ts
│       ├── capabilities.service.ts
│       └── capabilities.module.ts
├── app.module.ts
└── main.ts
config/
├── app.yaml              # Application configuration
└── database.yaml         # Database configuration
```

## Configuration

### Environment Variables (.env)
Only critical configurations are stored in `.env`:
- `PORT`: Application port
- `DB_PASSWORD`: Database password

### YAML Configuration
Other configurations are managed in YAML files:
- `config/app.yaml`: Application settings
- `config/database.yaml`: Database settings

## License

UNLICENSED


## API Documentation

After starting the application, you can access:
- **REST API**: http://localhost:3000/api/v1
- **Swagger UI**: http://localhost:3000/api-docs (Interactive API documentation)

The Swagger UI provides a complete interactive interface to test all API endpoints.
