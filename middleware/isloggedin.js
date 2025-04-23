import User from "../models/userModal.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
    try {
        // Debug log for cookies
        console.log("Cookies:", req.cookies);

        // Retrieve tokens from cookies
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken) {
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            const refreshDecode = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET);
            const user = await User.findOne({ _id: refreshDecode.id });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access",
                });
            }

            const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESSTOKEN_SECRET, {
                expiresIn: process.env.ACCESSTOKEN_EXPIRY,
            });
            const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production" };
            res.cookie("accessToken", newAccessToken, cookieOptions);

            req.user = { id: user._id };
            return next();
        } else {
            const accessDecode = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
            req.user = { id: accessDecode.id };
            return next();
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    }
};

export default isLoggedIn;