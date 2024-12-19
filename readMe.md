
# Backend for Store Management System

## Description
This backend application is built to manage a store system where administrators and sellers can handle product inventory, sales, and stock entries. The system is implemented using **Node.js**, **Express**, **TypeORM**, and **PostgreSQL**.

---

## Features
- User authentication with roles: **Admin** and **Seller**.
- Manage products, stock entries, and sales.
- JWT-based authentication and role-based access control.
- Database integration with **PostgreSQL** via **TypeORM**.

---

## Technologies Used
- **Node.js**
- **Express**
- **TypeORM**
- **PostgreSQL**

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository_url>
cd <repository_name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root of the project and provide the following values:

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=toor
DB_NAME=investments
DB_SYNCHRONIZE=true
DB_LOGGING=false

# JWT Configuration
JWT_SECRET=8a2f9e3c1b7e4d65d9f2a3b1e6f8c7d1a2b3c5d6f9e1c7d5b2a9f3e6c4b7e1f9
```

### 4. Run the application
Start the server in development mode:
```bash
npm run dev
```

Or build and run in production:
```bash
npm run build
npm start
```

---

## Database Setup
This project uses **PostgreSQL** as the database. Ensure PostgreSQL is installed and running on your machine. Update the `.env` file with your database credentials.

To initialize the database schema, enable `DB_SYNCHRONIZE=true` in your `.env` file (only recommended for development).

---

## API Documentation
The API is documented with **Swagger**. Once the server is running, you can access the documentation at:

```
http://localhost:<PORT>/api-docs
```

---

## Development
### Project Structure
```
src/
├── models/         # TypeORM entities
├── controllers/    # Route handlers
├── routes/         # API routes
├── middlewares/    # Custom middleware
├── utils/          # Utility functions
└── index.ts        # Main entry point
```

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.