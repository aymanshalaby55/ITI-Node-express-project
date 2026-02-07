const mongoose = require('mongoose');

// schema
const DonationSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    orderId: {
        type: String,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
        default: "PENDING",
        index: true
    },
    sessionURL: {
        type: String
    },
    webhookData: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

// Compound index for status queries
DonationSchema.index({ status: 1, createdAt: -1 });

// model
const DonationModel = mongoose.model('Donation', DonationSchema);


module.exports = DonationModel;