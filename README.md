# DGPeaks Laptop Marketplace API

_Work in progress_ - Backend API for a laptop marketplace platform being developed for [DGPeaks](https://dgpeaks.netlify.app/), a freelance project for a Georgian tourism company.

This is the backend repository. The frontend can be found at [klaptFront](https://github.com/ajikia15/klaptFront).

## Project Context

This marketplace API is being developed as part of a real-world personal business project for DGPeaks, creating an e-commerce platform for laptop sales.

## Technical Architecture

Built with NestJS and TypeScript, this API demonstrates several sophisticated backend patterns and features:

### Smart Dynamic Filtering System

The most technically interesting aspect is the intelligent filter compatibility system. The `/laptops/filters` endpoint doesn't just return static filter options - it analyzes the current filter selections and determines which additional filters would return valid results.

- **Filter Compatibility Engine**: For each filter option, the system runs a test query to determine if selecting that option would return any results given the current selections
- **Real-time Option Disabling**: Incompatible filters are marked as disabled, preventing users from creating search queries with zero results
- **Complex Filter Mapping**: A sophisticated mapping system handles 20+ different filter types including arrays, enums, and ranges

```typescript
// Example: When user selects "Intel" processors, only compatible RAM types are enabled
private readonly filterFieldMap: FilterField[] = [
  { resultField: 'brands', filterField: 'brand' },
  { resultField: 'processorModels', filterField: 'processorModel' },
  { resultField: 'ramTypes', filterField: 'ramType' },
  // ... 17 more filter mappings
];
```

### Comprehensive Entity Modeling

The laptop entity model captures detailed hardware specifications with 25+ fields including GPU VRAM, refresh rates, processor threads, and storage configurations - far more detailed than typical e-commerce platforms.

### JWT-based Authentication with Guards

- **Passport JWT Strategy**: Stateless authentication with automatic user context injection
- **Custom Guard System**: `@AuthGuard` and `@AdminGuard` decorators with role-based access
- **Password Security**: Salt-based hashing using Node.js crypto primitives

### Data Validation & Serialization Layer

- **DTO-driven Architecture**: Every endpoint uses DTOs for both input validation and output serialization
- **Automatic Response Shaping**: Custom `@Serialize()` interceptor ensures only safe fields are exposed
- **Comprehensive Validation**: Uses class-validator with custom enums and constraints

## Tech Stack

**Core Framework:**

- NestJS (Express-based)
- TypeScript
- TypeORM
- SQLite

**Authentication & Security:**

- Passport.js with JWT strategy
- class-validator for input sanitization
- Custom authorization guards

## API Documentation

The `api/` directory contains a complete Yaak workspace with 35+ documented API requests covering all endpoints, making it easy to understand the full API surface.
