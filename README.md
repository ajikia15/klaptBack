# Kaido: Laptop Marketplace API

**Kaido** is a feature-rich, modern NestJS API for managing a laptop marketplace. This project provides RESTful APIs for CRUD operations such as authentication, filtering and so on. Project uses [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [SQLite](https://www.sqlite.org/).

---

## 🚀 Features

### 1. **User Authentication & Authorization**

- **Secure Signup & Login:** Passwords are hashed with salt using Node's crypto module.
- **Session Management:** Cookie-based sessions for persistent authentication.
- **Role-based Access:** Admins can manage users and laptops with elevated privileges.
- **Current User Context:** Custom decorators and middleware make accessing the current user seamless in controllers.

### 2. **Laptop Management**

- **CRUD Operations:** Create, read, update, and delete laptops with full validation.
- **Ownership:** Each laptop is linked to its creator; only admins or owners can modify/delete.
- **Approval Workflow:** Laptops can be approved, rejected, or archived by admins.
- **The most detailed Laptop Model:** All the necessary fields for detailed information about laptops - GPU, CPU, VRAM, Refresh rate, etc.

### 3. **Advanced Filtering & Search**

- **Dynamic Filters:** Query laptops by brand, price, processor, RAM, storage, year, and more.
- **Smart Filter Options:** The `/filters` endpoint returns only compatible filter options based on current selections and their combinations, making UI filter panels dynamic and user-friendly.
- **Pagination:** All list endpoints support pagination.

### 4. **Favorites System**

- **User Favorites:** Authenticated users can favorite/unfavorite laptops.
- **Favorite Counts:** See how many users have favorited a laptop.
- **Per-user Favorites:** Retrieve all laptops favorited by the current user.

### 5. **Validation & Serialization**

- **DTOs Everywhere:** All input and output is validated and serialized using DTOs and class-transformer.
- **Automatic Data Shaping:** Only safe, relevant fields are exposed in API responses.

### 6. **Developer Experience**

- **TypeScript First:** Strong typing throughout the codebase.
- **Modular Structure:** Clear separation of concerns with modules for users, laptops, and favorites.
- **Environment Config:** Supports multiple environments via `.env` files and NestJS ConfigModule.

### 7. **API Usability**

- **HTTP Request Examples:** `.http` files for easy API testing with tools like VSCode REST Client or Insomnia.
- **CORS Enabled:** Ready for frontend integration out of the box.
- **Descriptive Errors:** Consistent error handling with meaningful messages.

---

## 🛠️ Getting Started

```bash
npm install
npm run start:dev
```

- The API runs on `http://localhost:3000` by default.
- Use the provided `.http` files or your favorite API client to explore endpoints.

---

## 📚 Notable Endpoints

- `POST /auth/signup` – Register a new user
- `POST /auth/signin` – Login and start a session
- `GET /auth/whoami` – Get the current logged-in user
- `GET /laptops` – List all laptops (paginated)
- `GET /laptops/search` – Advanced search with filters
- `GET /laptops/filters` – Get dynamic filter options
- `POST /laptops/` – Create a new laptop (authenticated)
- `PATCH /laptops/:id` – Update a laptop (owner/admin)
- `DELETE /laptops/:id` – Delete a laptop (owner/admin)
- `POST /favorites` – Favorite a laptop
- `GET /favorites` – List your favorites

## 📄 License

MIT
