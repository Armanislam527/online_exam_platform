// import userRoutes from "./routes/user";
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const examRoutes = require("./routes/exam");
const paymentRoutes = require("./routes/payment");
const subscriptionRoutes = require("./routes/subscription");
const coachingRoutes = require("./routes/coaching");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);
app.use(helmet());
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
	try {
		await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Connected to MongoDB");
	} catch (error) {
		if (retries > 0) {
			console.log(
				`MongoDB connection failed. Retrying... (${retries} attempts left)`
			);
			setTimeout(() => connectDB(retries - 1), 5000);
		} else {
			console.error(
				"MongoDB connection failed after all retries:",
				error
			);
			process.exit(1);
		}
	}
};

connectDB();

// Initialize Socket.IO
const io = new Server(httpServer, {
	cors: {
		origin: process.env.CLIENT_URL,
		methods: ["GET", "POST"],
		credentials: true,
	},
});

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log("Client connected:", socket.id);

	socket.on("join_exam", (examId) => {
		socket.join(`exam_${examId}`);
	});

	socket.on("join_live_class", (classId) => {
		socket.join(`class_${classId}`);
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id);
	});
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/coaching", coachingRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "ok",
		timestamp: new Date(),
		services: {
			mongodb:
				mongoose.connection.readyState === 1
					? "connected"
					: "disconnected",
		},
	});
});

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(err.status || 500).json({
		error: true,
		message:
			process.env.NODE_ENV === "production"
				? "Internal Server Error"
				: err.message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
});

// Handle 404
app.use((req, res) => {
	res.status(404).json({
		error: true,
		message: "Not Found",
	});
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
