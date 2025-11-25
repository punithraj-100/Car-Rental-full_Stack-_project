import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const addReview = async (req, res) => {
    try {
        const { carId, rating, comment } = req.body;
        const userId = req.user._id;

        // Check if user has a completed booking for this car
        // We look for a booking that is confirmed and the return date is in the past
        const booking = await Booking.findOne({
            car: carId,
            user: userId,
            status: "confirmed",
            returnDate: { $lt: new Date() }
        });

        if (!booking) {
            return res.status(400).json({ success: false, message: "You can only review cars you have rented and returned." });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ car: carId, user: userId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this car." });
        }

        const review = await Review.create({
            car: carId,
            user: userId,
            rating,
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCarReviews = async (req, res) => {
    try {
        const { carId } = req.params;
        const reviews = await Review.find({ car: carId }).populate("user", "name image").sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
