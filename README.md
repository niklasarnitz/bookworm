# Bookworm

A modern, responsive application for managing your personal book collection, built with the T3 Stack.

![Bookworm Logo](public/favicon.ico)

## Overview

Bookworm is a comprehensive book management application that allows you to catalog, organize, and track your personal library. With features like author management, series tracking, category organization, and cover image support, Bookworm helps you maintain a well-organized digital representation of your physical book collection.

## Features

- **Book Management**: Add, edit, and organize your books with detailed information
- **Wishlist Feature**: Keep track of books you want to add to your collection
- **Author Management**: Track authors and their associated works
- **Series Organization**: Group books by series with proper ordering
- **Category System**: Organize books using a hierarchical category system
- **Cover Images**: Upload or fetch book covers from Amazon
- **Search & Filter**: Quickly find books in your collection
- **Multiple View Modes**: Switch between grid and table views
- **User Authentication**: Secure multi-user support with role-based access control

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- MinIO server or compatible S3 storage (for cover images)
- Bun (optional, recommended for better performance)

### Installation

1. Clone the repository:

   ```bash
   git clone https://your-repository-url/bookworm.git
   cd bookworm
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/bookworm"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # MinIO / S3 configuration
   S3_ENDPOINT="your-minio-endpoint"
   S3_PORT="9000"
   S3_ACCESS_KEY="your-access-key"
   S3_SECRET_KEY="your-secret-key"
   S3_BUCKET_NAME="bookworm"
   ```

4. Set up the database:

   ```bash
   npm run db:migrate
   # or
   bun db:migrate
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   bun dev
   ```

6. Start your database server:
   ```bash
   # Using the provided script
   ./start-database.sh
   ```

### Initial Setup

After starting the application, you'll need to create an admin user:

```bash
npm run scripts/create-user.ts
# or
bun scripts/create-user.ts
```

## Database Schema

Bookworm uses a relational database with the following main entities:

- **Book**: Core entity with details like title, ISBN, pages, and cover image
- **Author**: Book authors with many-to-many relationship to books
- **Series**: Collections of related books with ordering
- **Category**: Hierarchical organization system for books
- **User**: User accounts with role-based permissions

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run db:studio` - Open Prisma Studio to manage database
- `npm run db:migrate` - Apply database migrations
- `npm run lint` - Run ESLint
- `npm run format:write` - Format code with Prettier

## Importing Data

The application includes scripts to import books and categories:

```bash
# Import books from an existing bookshelf
npm run scripts/import/import-books-from-bookshelf.ts

# Import categories
npm run scripts/import/import-categories.ts
```

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
