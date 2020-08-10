const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "localhost";
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: accessLogStream }));
app.use(helmet());
app.use(cors());

// DATABASE MODEL
const Pool = require("pg").Pool;
const pool = new Pool({
  host: "0.0.0.0",
  user: "hnariman",
  password: "12345",
  database: "testdb",
  port: "5555",
});

const search = async (req, res) => {
  try {
    const response = await pool.query(
      `select t.* from users t where (t.*)::text like '%${req.params.string}%';`
    );
    res.json(response.rows);
  } catch (err) {
    console.log("error :", err);
    res.json({ error: err });
  }
};

const queryData = (query) => async (req, res) => {
  try {
    const response = await pool.query(query);
    res.json(response.rows);
  } catch (err) {
    console.log("error :", err);
    res.json({ error: err });
  }
};

const getEverybody = queryData("select * from users");

const username = (name) =>
  queryData(`select * from users where name like '${name}'`);

bodyParser.urlencoded({ extended: false });
app.route("/all").get(username("nariman"));

app
  .route("/search/:string")
  .get(search)
  .post((req, res) => res.json({ message: "received POST HTTP request" }))
  .put((req, res) => res.send({ message: "received PUT HTTP request" }))
  .delete((req, res) => res.send({ message: "received DELETE HTTP request" }));
app
  .route("/")
  // .get(getEverybody)
  .get((req, res) => res.send("working"))
  .post((req, res) => res.send({ message: "received POST HTTP request" }))
  .put((req, res) => res.send({ message: "received PUT HTTP request" }))
  .delete((req, res) => res.send({ message: "received DELETE HTTP request" }));

app.listen(PORT, HOST, (err) => {
  if (err) console.log("ERROR : ", err);
  console.log(`App running on http://${HOST}:${PORT}`);
});
