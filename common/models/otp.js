import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
    {
        email: String,
        otp: String,
        validated: {
            type: Boolean,
            default: false,
        },
        expireAt: {
            type: Date,
            default: Date.now,
            expires: 10800,
        },
    },
    { timestamps: true }
);

const OTPModel = mongoose.model('OTPModel', otpSchema);

export default OTPModel;
