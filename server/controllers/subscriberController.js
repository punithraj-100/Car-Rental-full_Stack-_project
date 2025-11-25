import Subscriber from "../models/Subscriber.js";
import sendEmail from "../utils/emailService.js";

export const subscribeUser = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: "Email already subscribed" });
        }

        // Save to DB
        await Subscriber.create({ email });

        // Send Welcome Email
        const subject = "Welcome to Vishwas Wheels! 🚗";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #333;">Welcome to Vishwas Wheels!</h1>
                    <p style="color: #666; font-size: 16px;">Your journey starts here.</p>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                    <p style="color: #333; font-size: 16px;">Hi there,</p>
                    <p style="color: #555; line-height: 1.6;">
                        Thank you for subscribing to our newsletter! We're thrilled to have you on board.
                        You'll be the first to know about our latest car arrivals, exclusive deals, and special offers.
                    </p>
                    <p style="color: #555; line-height: 1.6;">
                        At Vishwas Wheels, we believe in trust and quality. Whether you're looking for a weekend getaway ride or a long-term rental, we've got you covered.
                    </p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Browse Cars</a>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
                    <p>&copy; ${new Date().getFullYear()} Vishwas Wheels. All rights reserved.</p>
                    <p>If you didn't subscribe, please ignore this email.</p>
                </div>
            </div>
        `;

        await sendEmail(email, subject, html);

        res.status(201).json({ success: true, message: "Subscribed successfully! Check your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
