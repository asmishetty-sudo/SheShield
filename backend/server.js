const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app); 

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: process.env.DOMAIN || "*",
    credentials: true,
  })
);

app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", require("./routes/Auth"));
app.use("/api/sos", require("./routes/SOS"));
app.use("/api/volunteer", require("./routes/Volunteer"));
app.use("/api/update", require("./routes/Update"));
app.use("/api/info", require("./routes/Info"));
app.use("/api/admin", require("./routes/Admin"));

app.get("/", (req, res) => {
  res.send("backend is working");
});

// ================= SOCKET.IO =================
const { initSocket } = require("./socket");

initSocket(server); 

// ================= DB + SERVER START =================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected !!");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB connection failed:", err);
  });

