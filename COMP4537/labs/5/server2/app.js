const mysql = require("mysql2/promise");
const http = require("http");
const url = require("url");
const people = require("./sample");
const routes = require("./route");
const { exitCode } = require("process");

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: "viaduct.proxy.rlwy.net",
        user: "root",
        password: "SavaUkIanoKgWlxScsQtZzrBOmChPJVB",
        database: "railway",
        port: 16788,
      });
      console.log("Connected to the MySQL database.");
    } catch (err) {
      console.error("Error connecting to the database:", err);
      throw err;
    }
  }

  async disconnect() {
    try {
      await this.connection.end();
      console.log("Disconnected from the MySQL database.");
    } catch (err) {
      console.error("Error disconnecting from the database:", err);
      throw err;
    }
  }

  async createPatientTable() {
    if (!this.connection) {
      throw new Error("No database connection established.");
    }

    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS patients (
          patientid INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          dateOfBirth DATETIME
        );
      `;
      await this.connection.execute(sql);
    } catch (error) {
      console.error("Error creating patient table:", error);
      throw error;
    }
  }

  async dropPatientTable() {
    if (!this.connection) {
      throw new Error("No database connection established.");
    }

    try {
      const sql = `
        DROP TABLE IF EXISTS patients;
      `;
      await this.connection.execute(sql);
    } catch (error) {
      console.error("Error dropping patient table:", error);
      throw error;
    }
  }

  async addSameplePatients(name, dob) {
    try {
      const sql = `
          INSERT INTO patients (name, dateOfBirth) 
          VALUES (?, ?);
        `;
      await this.connection.execute(sql, [name, dob]);
    } catch (error) {
      throw error;
    }
  }

  async runQuery(sql) {
    try {
      const result = await this.connection.query(sql);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

class APIServer {
  constructor() {
    this.port = 8080;
    this.database = new Database();
    this.routes = {
      [routes.SQL]: this.sqlClientSampleHandler,
      [`${routes.SQL}/`]: this.sqlGetHandler,
    };
  }

  sqlGetHandler = async (req, res) => {
    if (req.method !== "GET") {
      res.writeHead(405, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    try {
      const parsedUrl = url.parse(req.url, true);
      // const path = decodeURIComponent(parsedUrl.pathname);
      const sqlQuery = parsedUrl.query.query ? parsedUrl.query.query : null;
      if (sqlQuery) {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        const [rows, dbInfo] = await this.database.runQuery(sqlQuery);
        res.write(JSON.stringify({ rows: rows }));
        res.end();
      } else {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(
          JSON.stringify({ error: "Invalid URL format. No query found." })
        );
      }
    } catch (error) {
      res.writeHead(500, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(
        JSON.stringify({ error: "Internal Server Error", message: error })
      );
    }
  };

  sqlPostHandler = async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    for (const person of people) {
      await this.database.addSameplePatients(person.name, person.dob);
    }
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(JSON.stringify({ message: "Data added to db successfully" }));
    res.end();
  };

  sqlClientSampleHandler = async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        for (const person of data) {
          await this.database.addSameplePatients(person.name, person.dob);
        }
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.write(JSON.stringify({ message: "Data added to db successfully" }));
        res.end();
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.write(JSON.stringify({ error: "Invalid data format" }));
        res.end();
      }
    });
  };

  checkPreFlight = (req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }
  };

  async start() {
    try {
      await this.database.connect();
      await this.database.createPatientTable();
      const server = http.createServer(async (req, res) => {
        console.log("Server Started");
        const parsedUrl = url.parse(req.url, true);
        const routeHandler = this.routes[parsedUrl.pathname];

        this.checkPreFlight(req, res);

        if (routeHandler) {
          routeHandler(req, res);
        } else {
          res.writeHead(404, {
            "Content-Type": "text/plain",
            "Access-Control-Allow-Origin": "*",
          });
          res.write("404 Not Found");
          res.end();
        }
      });
      server.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error("Error starting the API server:", error);
    }
  }
}

const server = new APIServer();
server.start();
