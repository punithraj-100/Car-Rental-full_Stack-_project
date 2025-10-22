import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 2. Get the token from the header (split "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the token using your secret
      // This checks the signature AND expiration
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get the user ID from the payload object (based on your generateToken function)
      req.user = await User.findById(decodedPayload.id).select("-password");

      // 5. If user exists, proceed to the next function
      if (req.user) {
        next();
      } else {
        // Handle case where user ID in token no longer exists
        return res.status(401).json({ success: false, message: "Not authorized" });
      }
      
    } catch (error) {
      // This will catch errors from jwt.verify (e.g., token expired, invalid signature)
      console.error(error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  // 6. Handle cases where no token is provided
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};