import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
    {
        address: { type: String, required: true },
        enabledAsPickupLocation: { type: Boolean, default: true },
        enabledAsDeliveryLocation: { type: Boolean, default: true }

    },
    {
        timestamps: true
    }
);

const Location = mongoose.model('Location', locationSchema);

export default Location;