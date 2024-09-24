# Yanshi Events Backend

This is the backend for the Yanshi Events management application. It provides API endpoints to manage categories, subcategories, and events.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL (or any other database supported by Prisma)

### Installation

1. **Clone the repository:**

   ```bash
   git clone "url from the address bar"
   ```

2. **Navigate to the project directory:**

   ```bash
   cd yanshi-events-backend
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Set up the environment variables:**

   - Copy the `.env.example` file to `.env`:

     ```bash
     cp .env.example .env
     ```

   - The `.env` file already contains a sample `DATABASE_URL`. You may need to update it according to your database setup.

5. **Run Prisma migrations:**

   ```bash
   npx prisma migrate dev
   ```

### Running the Application

To start the application in development mode:

```bash
npm run dev
```

The server will start on `http://localhost:3000`.

### Testing the APIs

To test the APIs, follow these steps:

1. **Open Postman.**

2. **Import the Postman collection:**

   - Go to "File" > "Import".
   - Select the `postman-collection.json` file located in the root of the project directory.

3. **Run the API requests:**

   - Use the requests in the imported collection to interact with the backend. You can create, read, update, and delete categories, subcategories, and events.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

### Summary:
- This `README.md` provides clear instructions for setting up and running your project.
- It includes steps to clone the repository, install dependencies, set up environment variables, run the application, and test the APIs using Postman.

You can save this content in a `README.md` file at the root of your project, commit it, and push it to your GitHub repository.
```
