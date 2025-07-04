# Lumo API

Lumo API is a backend service designed to support the Loumo application. It provides RESTful endpoints for managing users, authentication, and business logic related to the Loumo platform. The API is built with scalability, security, and maintainability in mind, enabling seamless integration with frontend clients and third-party services.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and authentication (JWT-based)
- Role-based access control
- RESTful endpoints for user and business management
- Secure password hashing
- Input validation and error handling
- Integration-ready for frontend and third-party services

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) or your preferred database

### Installation

```bash
git clone https://github.com/yourusername/lumo-api.git
cd lumo-api
npm install
```

### Running the API

```bash
npm start
```

The API will be available at `http://localhost:3000`.

## API Documentation

Interactive API documentation is available via Swagger at `/api-docs` after starting the server.

- **Base URL:** `http://localhost:3000/api`

Refer to the [API Docs](docs/API.md) for detailed endpoint information.

## Configuration

Create a `.env` file in the root directory and set the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lumo
JWT_SECRET=your_jwt_secret
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the [MIT License](LICENSE).
