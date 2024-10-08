const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const cors = require("cors");
const fs = require('fs');

// Allow requests from all origins
app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200 // optional
}));

if (!fs.existsSync(path.join(__dirname, "images"))) {
  fs.mkdirSync(path.join(__dirname, "images"));
}
app.use(express.static(path.join(__dirname, "images")));

app.use(express.json());

const { PORT } = require("./config");
http.listen(process.env.PORT || PORT, (error) => {
  if (error) throw new Error(error);
  console.log("Server listening on port:", process.env.PORT || PORT);
});


app.use('/api/auth', require('./routes/auth'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
