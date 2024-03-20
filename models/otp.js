import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    validated:{
        type: Boolean,
        default: false
    }
}, {timestamps: true}
)

const OTPModel = mongoose.model("OTPModel", otpSchema);

export default OTPModel;