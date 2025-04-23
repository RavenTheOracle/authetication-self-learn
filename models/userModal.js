import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verificationToken:String,
    verificationTokenExpiry:Date,
    resetPasswordToken:String,
    resetPasswordTokenExpiry:String,
    refreshToken:String,

}, { timestamps: true });

//hash password await when ever passwor is upadated
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12); // Add `await` here
    }
    next(); // Ensure `next()` is always called
});

//function to compare password
userSchema.methods.comparePasswords = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User",userSchema);

export default User;