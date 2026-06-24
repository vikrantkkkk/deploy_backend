require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");

const { Pool } = require("pg");

const swaggerSpec = require("./swagger");

const { initDb } = require("./db/init");

const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Node + PostgreSQL Working. Visit /api-docs for Swagger UI.");
});

async function startServer() {
  try {
    const client = await pool.connect();
    console.log("Database Connected Successfully");
    client.release();

    await initDb(pool);
    console.log("Users table ready");

    app.listen(PORT, () => {
      console.log(`Server Running On Port ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    console.log("Database Connection Failed");
    console.log(err);
    process.exit(1);
  }
}

startServer();
