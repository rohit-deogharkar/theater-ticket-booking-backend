const express = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const mongooseConnect = require("./mongooseConnection");

const bodyParser = require("body-parser");

const movieModel = require("./movieSchema");
const userModel = require("./userSchema");
const ticketModel = require("./ticketSchema");

const app = express();
app.use(bodyParser.json());
dotenv.config();

mongooseConnect();
const saltRounds = 10;
// Movies Routes

app.get("/getMovie", async (req, res) => {
  try {
    const movie = await movieModel.find();
    res.json(movie);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

app.post("/addMovie", async (req, res) => {
  const {
    imagename,
    title,
    description,
    genre,
    releasedate,
    director,
    language,
  } = req.body;
  const findtitle = await movieModel.findOne({ title });
  if (findtitle) {
    res.json({ message: "Movie already exists", result: "error" });
  } else {
    try {
      const movie = new movieModel({
        imagename,
        title,
        description,
        genre,
        releasedate,
        director,
        language,
      });
      await movie.save();
      res.status(200).json({
        message: "Movie added successfully",
        result: "success",
      });
    } catch (e) {
      res.status(400).json({
        message: "Error adding movie",
        error: e.message,
      });
    }
  }
});

app.get("/moviedetail/:id", async (req, res) => {
  try {
    const movie = await movieModel.findById(req.params.id);
    res.json(movie);
  } catch (e) {
    res.json({
      message: e.message,
    });
  }
});

app.put("/updatemovie/:id", async (req, res) => {
  const id = req.params.id;
  const {
    imagename,
    title,
    description,
    genre,
    releasedate,
    director,
    language,
  } = req.body;
  console.log(req.body);
  try {
    const update = await movieModel.findByIdAndUpdate(id, {
      imagename,
      title,
      description,
      genre,
      releasedate,
      director,
      language,
    });
    res.status(200).json({
      message: "Movie updated successfully",
      data: update,
    });
  } catch (e) {
    res.status(400).json({
      message: "Error updating movie",
      error: e.message,
    });
    console.log(e);
  }
});

app.delete("/deletemovie/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deleteMovie = await movieModel.findByIdAndDelete(id);
    res.status(200).json({
      message: "Movie deleted successfully",
      data: deleteMovie,
    });
  } catch (e) {
    res.status(400).json({
      message: "Error deleting movie",
      error: e.message,
    });
  }
});

app.patch("/update-reserved-seat/:id", async (req, res) => {
  const id = req.params.id;
  const reservedSeats = req.body;
  // console.log(reservedSeats)
  try {
    const update = await movieModel.findByIdAndUpdate(id, {
      $set: { reservedSeats },
    });
    res.status(200).json({
      message: "Reserved seat updated successfully",
      data: update,
    });
  } catch (e) {
    res.status(400).json({
      message: "Error updating reserved seat",
      error: e.message,
    });
  }
});

//user routes

app.post("/adduser", async (req, res) => {
  const { username, email, password } = req.body;
  salt = await bcrypt.genSalt(10);
  hashedpassword = await bcrypt.hash(password, salt);
  try {
    const existinguser = await userModel.findOne({
      email: email,
    });
    if (existinguser) {
      res.json({
        message: "Email already exists",
      });
    } else {
      const user = await userModel.create({
        username,
        email,
        password: hashedpassword,
        role: "user",
      });
      res
        .status(200)
        .json({ message: "User created successfully", data: user });
    }
  } catch (e) {
    res.status(400).json({ message: "Error creating user", error: e.message });
  }
});

app.post("/checkuser", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({
      email: email,
    });
    if (user) {
      result = await bcrypt.compare(password, user.password);
      if (result) {
        res.json({
          message: "success",
          data: user,
        });
      } else {
        res.json({
          message: "Invalid credentials",
        });
      }
    } else {
      res.json({
        message: "Invalid credentials",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error checking user",
      error: err.message,
    });
  }
});

//tciket routes

app.post("/addticket", async (req, res) => {
  const { movieId, movieimage, userId, movieName, email, seats, price } =
    req.body;
  console.log(req.body);
  try {
    const ticket = await ticketModel.create({
      movieId,
      userId,
      movieimage,
      movieName,
      email,
      seats,
      price,
      status: "Confirmed",
    });
    res.json({
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error creating ticket",
    });
  }
});

app.get("/get-ticket/:id", async (req, res) => {
  try {
    const ticket = await ticketModel.findById(req.params.id);
    if (ticket) {
      res.json({
        message: "Ticket found",
        data: ticket,
      });
    } else {
      res.json({
        message: "Ticket not found",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error finding ticket",
    });
  }
});

app.get("/usertickets/:id", async (req, res) => {
  try {
    const tickets = await ticketModel.find({ userId: req.params.id });
    res.json({
      message: "Tickets found",
      data: tickets,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error finding tickets",
    });
  }
});

app.patch("/cancel-ticket/:id", async (req, res) => {
  const ticketId = req.params.id;

  try {
    const ticket = await ticketModel.findById(ticketId);
    const movie = await movieModel.findById(ticket.movieId);

    ticket.seats.forEach((element) => {
      const index = movie.reservedSeats.indexOf(element);
      movie.reservedSeats.splice(index, 1);
    });

    const updateSeats = await movieModel.findByIdAndUpdate(ticket.movieId, {
      reservedSeats: movie.reservedSeats,
    });

    const updateStatus = await ticketModel.findByIdAndUpdate(ticketId, {
      status: "Cancelled",
    });

    res.json({
      ticketseats: ticket.seats,
      movieseats: movie.reservedSeats,
      ticketSatus: updateStatus,
      message: "Ticket cancelled",
    });
  } catch (err) {
    res.json({
      message: "Error cancelling ticket",
    });
  }
});

port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
