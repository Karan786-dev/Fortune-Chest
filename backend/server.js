const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const cors = require("cors");
const fs = require('fs')
app.use(cors({ origin: "*" }));

if (!fs.existsSync(path.join(__dirname, "images"))) {
  fs.mkdirSync(path.join(__dirname, "images"));
}
app.use(express.static(path.join(__dirname, "images")));

app.use(express.json());

const { PORT } = require("./config");
http.listen(PORT, (error) => {
  if (error) throw new Error(error);
  console.log("Server listing to port:", PORT);
});


app.use('/api/auth', require('./routes/auth'))
app.use('/api/plan', require('./routes/plan'))
app.use('/api/user', require('./routes/user'))
app.use('/api/admin', require('./routes/admin'))