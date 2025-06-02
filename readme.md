# 📝 Blog App REST API

A modern, secure, and production-grade RESTful API for managing users, profiles, posts, categories,
and comments—built with **Express.js**, **Prisma ORM**, **TypeScript**, and **Zod** for schema validation.

---

## 🚀 Features

- **Authentication & Authorization**
    - JWT-based auth, role-based access (ADMIN, EDITOR, USER)
    - Secure password hashing with Bcrypt
- **CRUD Operations**
    - Full CRUD for Users, Profiles, Posts, Categories, and Comments
- **Validation**
    - Request validation with Zod schemas for type safety
    - Prisma-level validation & error handling
- **Pagination & Filtering**
    - Advanced query support for paginated endpoints
    - Customizable filters for posts/comments (status, etc.)
- **Cascade Operations**
    - Referential integrity via Prisma (e.g., cascade delete)
- **Comprehensive Error Handling**
    - Consistent error responses with detailed validation feedback
- **API Documentation**
    - Auto-generated **Swagger (OpenAPI 3.0)** docs (JSON, no YAML clutter)
- **Testing**
    - Full integration test suite with **Jest** & **Supertest**
- **Type Safety Everywhere**
    - End-to-end strict TypeScript usage for DTOs, responses, and more

---
## ⚙️ Getting Started

### **Setup Instructions**

1. **Clone the Repository**

   ```bash
   git clone git@github.com:nickTheof/blog-rest-api-node-prisma-ts.git
   cd blog-rest-api-node-prisma-ts

   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.prod.example .env.prod
   cp .env.test.example .env.test
   ```
Edit the .env files to match your local database credentials and secrets.


4. **Database setup**

   2. **Database setup**

       1. **Create MySQL Users for Prisma**  
          To connect to the MySQL database, you must create dedicated Prisma Users, for each node environment.
          For improved security, use different MySQL users for database migrations and for your Prisma Client (application runtime). The runtime user should have only the minimum privileges needed.

       2. **Create Database Schemas**
           You should create a dedicated Database to each node environment.

       3. **Step 3: Migrate the database schemas to set up the database schemas and create the Prisma Client**
            ```bash
               npx prisma migrate deploy
            ```
5. **Start the application**
   ```bash
      npm run start
   ```
The server will start on http://localhost:3000.

## 📖 API Documentation
Swagger (OpenAPI 3.0) documentation is auto-generated and available at:
   ```bash
      http://localhost:3000/api-docs
   ```
Schemas: Response models are generated from Prisma models, request DTOs from Zod schemas.
Interactive: Try out endpoints live.

## 🧪 Testing
The project uses Jest and Supertest for integration tests.
Tests run on a separate test database and automatically clean up after themselves.
Run all tests:
   ```bash
      npm run test
   ```

## 🔒 Security Notes
- Passwords are hashed using Bcrypt before storing
- JWTs are validated and role-checked for all protected routes
- Input is validated via Zod and Prisma for full defense-in-depth
- Cascade delete and referential integrity managed in Prisma schema

## 🛠 Tech Stack

| Layer          | Technology            |
|----------------|-----------------------|
| Backend        | Express.js, Node.js   |
| ORM            | Prisma                |
| Validation     | Zod                   |
| Language       | Typescript            |
| Database       | MySql                 |
| Testing        | Jest, Supertest       |
| Authentication | BCrypt                |
| Docs           | Swagger (OpenAPI 3.0) |

## License

This project is licensed under the MIT License - see the [LICENSE](licence.txt) file for details.