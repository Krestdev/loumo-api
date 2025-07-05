## **Overview**

This document explains, in simple terms, how to run your application using **Docker Compose**. Docker Compose is a tool that lets you start and manage several related programs (called "services") together, each running in its own isolated environment (called a "container"). This setup includes:

1. **loumo** – your main backend application (built with Node.js/TypeScript)
2. **mysql_loumo** – a MySQL database to store your main data
3. **mongo_loumo** – a MongoDB database, often used for logs or extra data

It also makes sure these services can talk to each other and that their data is saved even if you restart your computer.

---

## **Service Breakdown**

```yml
services:
```

### 1. **loumo**

- **What it does:** Runs your main backend API, which is the core of your application.
- **How it’s built:** Uses the instructions in the `Dockerfile` inside the `loumo-api` folder to create the app.
- **How it starts:** Before starting, it checks if the MySQL database is ready. Once MySQL is up, it:
  - Runs database updates (migrations) to make sure the database structure is correct.
  - Generates code needed to talk to the database.
  - Builds and starts the backend server.
- **Restart behavior:** If the container stops for any reason (except if you stop it yourself), Docker will try to start it again.
- **Settings (Environment Variables):** These are like settings or passwords the app needs to run, such as:
  - The environment (development or production)
  - Which port to use
  - URLs for the backend and frontend
  - Payment service details
  - Database connection details for MySQL and MongoDB
  - Security secrets (like for authentication)
  - Email credentials
- **Ports:** Makes the backend available on your computer at port 5000.
- **Network:** Connects to a shared network called `caddy-net` so it can talk to the other services.
- **Depends on:** Waits for the MySQL database to be ready before starting.

```yml
loumo:
  container_name: loumo
  build:
    context: ./loumo-api
    dockerfile: Dockerfile
  command: sh -c "
    until nc -z mysql_loumo 3306; do
    echo '⏳ Waiting for MySQL...';
    sleep 2;
    done &&
    npx prisma migrate deploy &&
    npx prisma generate &&
    npm run build && npm run start"
  restart: unless-stopped
  environment:
    NODE_ENV: "dev"
    PORT: 5000
    BASE_URL: "http://localhost"

    FRONTEND_URL: "http://localhost:3000"

    PAWAPAY_BASE_URL: "https://api.sandbox.pawapay.io"
    PAWAPAY_API_TOKEN: "eyJraWQiOiIxIiwiYWxnIjoiRVMyNTYifQ.eyJ0dCI6IkFBVCIsInN1YiI6IjUzMTciLCJtYXYiOiIxIiwiZXhwIjoyMDY1ODU2NzU1LCJpYXQiOjE3NTAzMjM5NTUsInBtIjoiREFGLFBBRiIsImp0aSI6IjU0YWNlYzhlLWY5ZTMtNDE5YS1iOGIwLTM0NjQ5ZGI5MzU5MiJ9.f9EpjHcwXTbXoggaD5cCbkJ9rPoRm3M1k4q2eo1lbfYS4lHMOAI-2DV_6hxpX7Ula12P6BHSoPgi5UgNDiMgdw"

    # MAIN_DATABASE_URL: "file:./dev.db"
    MAIN_DATABASE_URL: "mysql://root:krest@mysql_loumo:3306/loumo"
    LOG_DATABASE_URL: "mongodb://mongo_loumo:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.2"
    JWT_SECRET: "your_jwt_secret"

    SMTP_USER: "info@le-carino.com"
    SMTP_PASS: "admin@carino2024"
    MYSQLDB: "mysql://root:krest@mysql:3306/loumo"
  ports:
    - "5000:5000"
  networks:
    - caddy-net
  depends_on:
    - mysql_loumo
```

### 2. **mongo_loumo**

- **What it does:** Runs MongoDB, a type of database that stores data in a flexible way, often used for logs or extra information.
- **How it’s set up:** Uses the official MongoDB version 6 image.
- **Restart behavior:** Will restart automatically unless you stop it yourself.
- **Settings:** Sets up an initial database called `loumo-db`.
- **Data storage:** Saves its data to a folder on your computer (`/root/backup/loumo/mongo-data`), so you don’t lose data if the container stops.
- **Ports:** Makes MongoDB available on your computer at port 27017.
- **Network:** Connects to the shared `caddy-net` network.

```yml
mongo_loumo:
  container_name: mongo_loumo
  image: mongo:6
  restart: unless-stopped
  environment:
    MONGO_INITDB_DATABASE: loumo-db
  volumes:
    - /root/backup/loumo/mongo-data:/data/db
  ports:
    - "27017:27017"
  networks:
    - caddy-net
```

### 3. **mysql_loumo**

- **What it does:** Runs MySQL version 8, a popular database for storing your main application data.
- **How it’s set up:** Uses the official MySQL version 8 image.
- **Restart behavior:** Will restart automatically unless you stop it yourself.
- **Settings:** Sets the root password, creates a database called `loumo`, and sets a password for the database user.
- **Ports:** Makes MySQL available on your computer at port 3317 (even though inside the container it uses 3306).
- **Data storage:** Saves its data to a folder on your computer (`/root/backup/loumo/mysql-data`), so your data is safe if the container stops.
- **Network:** Connects to the shared `caddy-net` network.

```yml
mysql_loumo:
  container_name: mysql_loumo
  image: mysql:8
  restart: unless-stopped
  environment:
    MYSQL_ROOT_PASSWORD: krest
    MYSQL_DATABASE: loumo
    MYSQL_PASSWORD: krest
  ports:
    - "3317:3306"
  volumes:
    - /root/backup/loumo/mysql-data:/data/mysql
  networks:
    - caddy-net
```

## **Networks**

- **caddy-net:** This is a shared network that lets all the containers talk to each other securely. It’s marked as "external", which means it’s created outside this file (maybe by another tool or for use by other services like a web server).

```yml
networks:
  caddy-net:
    name: caddy-net
    external: true
```

## **Volumes**

- **mongo-data:** Keeps MongoDB’s data safe on your computer, even if you delete or restart the container.
- **mysql-data:** Keeps MySQL’s data safe on your computer, even if you delete or restart the container.

```yml
volumes:
  mongo-data: {}
  mysql-data: {}
correct deployment
```

## **Key Points**

- **Database Readiness:** The backend app (`loumo`) waits until the MySQL database is ready before it tries to start. This prevents errors if the database isn’t available yet.
- **Safe Database Updates:** Uses a safe command to update the database structure without losing any data.
- **Environment Variables:** All important settings (like passwords and URLs) are provided when the containers start, so you don’t have to hard-code them.
- **Persistent Data:** Data is stored on your computer, not just inside the containers, so you don’t lose anything if you restart or remove a container.
- **Networking:** All services are connected on the same network, so they can communicate easily and securely.

---

## **Security Note**

- This file contains sensitive information (like passwords and secret keys). In a real production setup, you should use safer methods (like Docker secrets or environment variable managers) to keep these values out of your code.

---

## **Summary Table**

| Service     | Image/Build            | Ports       | Data Volume                   | Purpose               |
| ----------- | ---------------------- | ----------- | ----------------------------- | --------------------- |
| loumo       | ./loumo-api/Dockerfile | 5000:5000   | N/A                           | Main API backend      |
| mysql_loumo | mysql:8                | 3317:3306   | /root/backup/loumo/mysql-data | MySQL database        |
| mongo_loumo | mongo:6                | 27017:27017 | /root/backup/loumo/mongo-data | MongoDB for logs/data |

---

**In summary:**  
This setup lets you run your backend app, MySQL, and MongoDB together using Docker. It makes sure everything starts in the right order, keeps your data safe, and provides all the settings your app needs for a reliable and production-ready deployment.
