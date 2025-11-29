import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import subscriberRouter from "./routes/subscriberRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import startCronJobs from "./jobs/cronJobs.js";

// Initialize Express App
const app = express()

// Connect Database
await connectDB()

// Start Cron Jobs
startCronJobs()

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/subscribers', subscriberRouter)
app.use('/api/payment', paymentRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))