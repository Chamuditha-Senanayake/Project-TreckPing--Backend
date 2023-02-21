import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
    {
        location: { type: String },
        address: { type: String, required: true },
        agent: { type: String },
        email: { type: String },
        contact: { type: String },
        enabledAsPickupLocation: { type: Boolean, default: true },
        enabledAsDeliveryLocation: { type: Boolean, default: true }

    },
    {
        timestamps: true
    }
);

const Location = mongoose.model('Location', locationSchema);

export default Location;