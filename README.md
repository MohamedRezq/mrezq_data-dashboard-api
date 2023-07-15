# Data Dashboard API

Welcome to the Data Dashboard API! This API serves as the backend for the [Data Dashboard application](https://github.com/MohamedRezq/data-dashboard). It provides endpoints for managing data and analytics, as well as authentication and authorization. This project was built using Node.js, Express.js, and MySQL.

## Getting Started

### Prerequisites

Before running the API locally, ensure that the following software is installed on your machine:

- Node.js (version 14 or higher)
- MySQL

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory in the terminal.
3. Run `npm install` to install the project dependencies.
4. Create a `.env` file at the root of the project, and add the following environment variables:

```
DB_HOST=<your MySQL host>
DB_USER=<your MySQL username>
DB_PASSWORD=<your MySQL password>
DB_NAME=<your MySQL database name>
PORT=<the port you want to run the API on>
```

### Running the API

To run the API locally, run the following command from the project directory:

```
npm run dev
```

This will start the API on the port specified in your `.env` file.

## API Endpoints

### Authentication

#### POST /api/users/create

Registers a new user. Requires an email and password in the request body.

#### POST /api/users/login

Logs in a user. Requires an email and password in the request body.

### Data

#### POST /api/<app_name>/get-data

Retrieves all data records for a certain app.

#### POST /api/<app_name>/sync-data

Sync and retrieves all data records for a certain app.

#### POST /api/<app_name>/exchange-code

Authorizes users to exchange code with access token.

## Dependencies

This API was built using the following dependencies:

- axios
- bcryptjs
- body-parser
- cors
- dotenv
- express
- express-validator
- form-data
- helmet
- intuit-oauth
- jsonwebtoken
- mysql
- mysql2
- sequelize
- sequelize-auto

## Scripts

- `npm run dev`: starts the API in development mode
- `npm run staging`: starts the API in staging mode
- `npm start`: starts the API in production mode

## Acknowledgements

- Thanks to [Node.js ↗](https://nodejs.org), [Express.js ↗](https://expressjs.com/), and [MySQL ↗](https://www.mysql.com/) for providing powerful tools that made building this API a breeze.
- Thanks to the developers of the dependencies used in this project for contributing to the open-source community and making their tools available to others.
- Thanks to my fellow developers for their support and encouragement.

## Author

[Mohamed Rezq](https://github.com/MohamedRezq)

## Contributing

Contributions to this API are always welcome! See `contributing.md` for more information on how to get started.

Please adhere to this project's `code of conduct`.

## License

This API is licensed under the [ISC License ↗](https://opensource.org/licenses/ISC).

## Contact

If you have any questions or feedback about this API, please feel free to contact us at [mrezq.dev@gmail.com](mailto:mrezq.dev@gmail.com). We'd love to hear from you!
