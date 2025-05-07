# Klaptopi: Modern Laptop Marketplace API

Welcome to **Klaptopi**, a feature-rich, modern NestJS API for managing a laptop marketplace. This project demonstrates best practices in RESTful API design, authentication, filtering, and modular architecture using [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [SQLite](https://www.sqlite.org/).

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
- **Rich Laptop Model:** Extensive fields including specs, images, tags, and condition.

### 3. **Advanced Filtering & Search**

- **Dynamic Filters:** Query laptops by brand, price, processor, RAM, storage, year, and more.
- **Smart Filter Options:** The `/laptops/filters` endpoint returns only compatible filter options based on current selections, making UI filter panels dynamic and user-friendly.
- **Full-text Search:** Search laptops by title or description.
- **Pagination:** All list endpoints support pagination for scalable data delivery.

### 4. **Favorites System**

- **User Favorites:** Authenticated users can favorite/unfavorite laptops.
- **Favorite Counts:** See how many users have favorited a laptop.
- **Per-user Favorites:** Retrieve all laptops favorited by the current user.

### 5. **Robust Validation & Serialization**

- **DTOs Everywhere:** All input and output is validated and serialized using DTOs and class-transformer.
- **Automatic Data Shaping:** Only safe, relevant fields are exposed in API responses.

### 6. **Developer Experience**

- **TypeScript First:** Strong typing throughout the codebase.
- **Modular Structure:** Clear separation of concerns with modules for users, laptops, and favorites.
- **E2E & Unit Testing:** Ready-to-run Jest tests for reliability.
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

---

## 💡 Why You'll Love This Project

- **Real-World Patterns:** See how to build a scalable, maintainable API with NestJS.
- **Dynamic Filtering:** The filter logic is smart—users never see filter options that would yield zero results.
- **Security:** Passwords are never stored in plain text, and sensitive fields are never leaked.
- **Extensible:** Add new features (like reviews or orders) with minimal friction.
- **Great for Learning:** The codebase is clean, well-typed, and full of best practices.

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

---

## 📄 License

MIT

---

**Happy coding! 🚀**

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
