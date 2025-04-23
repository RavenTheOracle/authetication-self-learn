import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModal.js";
import sendVerificationEmail from "../utils/sendMail.js";

// REGISTER CONTROLLER
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate input data
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // 2. Check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password should have a minimum length of 6 characters",
            });
        }

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // 4. Generate verification token and expiry
        const token = crypto.randomBytes(32).toString("hex");
        const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds

        // 5. Create a new user
        const user = await User.create({
            name,
            email,
            password,
            verificationToken: token,
            verificationTokenExpiry: tokenExpiry,
        });

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "User creation failed",
            });
        }

        // 6. Send verification email
        const emailSent = await sendVerificationEmail(user.email, token);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email",
            });
        }

        // 7. Respond to client
        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
        });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// VERIFY CONTROLLER
const verify = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user by token and check expiry
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }

        // Verify user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User verified successfully",
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// LOGIN CONTROLLER
const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    try {
        // 2. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 3. Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User email is not verified",
            });
        }

        // 4. Compare passwords
        const isPasswordMatch = await user.comparePasswords(password);
        console.log("password matched", isPasswordMatch)
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            });
        }

        // 5. Generate JWT token to access proteted route
        const accessToken = jwt.sign({id:user._id},process.env.ACCESSTOKEN_SECRET,{
            expiresIn: process.env.ACCESSTOKEN_EXPIRY,
        })
        const refreshToken = jwt.sign({id:user._id},process.env.REFRESHTOKEN_SECRET,{
            expiresIn: process.env.REFRESHSTOKEN_EXPIRY,
        })

        user.refreshToken=refreshToken;
        await user.save();

        // 6. Set cookie options and send response
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            httpOnly: true,
        };
        res.cookie("accessToken", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
//gte profile
const getProfile = async (req,res) => {
    //gte user if from req obj
   const userId = req.user.id;

   const user = await User.findById(userId).select("-password")

   if(!user){
    return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
    });
   }

   return res.status(200).json({
    success: true,
    message: "User profile accessed",
});

}

//logut user
const logout = async(req,res) => {
    const token=req.cookie.refreshToken;
    try {
        //check if user is looged in
        if(!token){
            return res.status(401).json({
                status:false,
                message: "Unathorized access"
            })
        }

        //cclear cookie
        res.cookie("jwtToken","",{
            httpOnly:true,
        })

        const refreshDecode = jwt.verify(token,process.env.REFRESHTOKEN_SECRET)
        const user = await User.findOne({_id:refreshDecode.id});

        if(!user){
            return res.status(401).json({
                status:false,
                message: "user gand mara raha hai"
            })
        }
        user.refreshToken=null;
        //clear cokie
        res.cookie("accessToken","",{
            status:false,
            message:"unautohrized access"
        })
        res.cookie("refreshToken","",{
            status:false,
            message:"unautohrized access"
        })
        //sed response
        return res.status(200).json({
            status:true,
            message:"User logged out successfully"
        })

    } catch (error) {
        return res.status(200).json({
            status:false,
            message:`user unable to logout${error.message}`
        })
    }
}

export { register, verify, login, getProfile};