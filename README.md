# WOPI-API

This repository contains the API that responsible for handling authentication, authorization, and communication between the WOPI frontend and the database services.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [License](#license)

## Overview
This middleware API serves as an intermediary between the frontend and backend services, managing authentication and data flow securely.

## Features
- JWT-based authentication
- User management (login, register, logout)
- Middleware for protected routes
- Secure API communication
- Mongoose for Connection with the Database

## Tech Stack
- Node.js
- Express.js with Mongoose
- JSON Web Tokens (JWT)
- dotenv for environment variable management
- Swagger for API documentation

## Setup and Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/dhaivat-cloud/wopi-api.git
   ```
2. Navigate to the project directory:
   ```sh
   cd middleware-api
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables (see below).

## Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
TOKEN_EXPIRY=1h
```
Replace `your_secret_key_here` with a strong secret key.

## Running the Server
To start the server, run:
```sh
npm run dev
```
Or for development with nodemon:
```sh
nodemon server.js 
```
The API will be available at `http://localhost:5000`.

## API Endpoints
| Method | Endpoint       | Description        |
|--------|---------------|--------------------|
| POST   | /auth/login   | User login        |
| POST   | /auth/register | User registration |
| GET    | /protected    | Protected route   |

For full API documentation, navigate to `http://localhost:5000/api-docs` (Swagger UI).

## Authentication
- Users receive a JWT token upon successful login.
- Include the token in the `Authorization` header for protected routes:
  ```sh
  Authorization: Bearer your_token_here
  ```

## License
This project is licensed under the MIT License.

