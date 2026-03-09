import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxLength: [50, "Name cannot exceed 50 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email address"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
            minlength: [8, "Password must be at least 8 characters long"]
        },

        role: {
            type: String,
            default: "Student",
            enum: ["Student", "Teacher", "Admin"]
        },

        resetPasswordToken: String,
        resetPasswordExpire: Date,

        department: {
            type: String,
            default: null
        },

        expertise: {
            type: [String],
            default: []
        },

        maxStudents: {
            type: Number,
            default: 10,
            min: [1, "Max students must be at least 1"]
        },

        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        supervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        projects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Projects"
            }
        ]
    },
    {
        timestamps: true
    }
);



// Password hashing before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});



// Generate JWT Token
userSchema.methods.getJwtToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );
};



// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};



// Generate Reset Password Token
userSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};



export const User = mongoose.model("User", userSchema);