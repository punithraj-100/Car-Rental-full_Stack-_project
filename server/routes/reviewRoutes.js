import express from "express";
import { addReview, getCarReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", protect, addReview);
router.get("/:carId", getCarReviews);

export default router;
