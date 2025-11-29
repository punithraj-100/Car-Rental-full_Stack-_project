import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types

const bookingSchema = new mongoose.Schema({
    car: { type: ObjectId, ref: "Car", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "timeout"], default: "pending" },
    price: { type: Number, required: true },
    paymentId: { type: String },
    orderId: { type: String },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
}, { timestamps: true })

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking