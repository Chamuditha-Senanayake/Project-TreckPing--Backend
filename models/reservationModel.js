import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
    {
        orderItems: [
            {
                name: { type: String, required: true },
                slug: { type: String, required: true },
                quantity: { type: Number, required: true },
                image: { type: String, required: true },
                price: { type: Number },
                rent: { type: Number },
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                pickupDate: { type: Date },
                returnDate: { type: Date },
                pickedupAt: { type: Date },
                returnedAt: { type: Date },
                penalty: { type: Number },
            }
        ],
        shippingAddress: {
            pickupLocation: { type: String, required: true },
            returnLocation: { type: String, required: true },
        },
        paymentMethod: { type: String, required: true },
        paymentResult: {
            id: String,
            status: String,
            update_time: String,
            email_address: String
        },
        itemsPrice: { type: Number, required: true },
        shippingPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        penaltyCharges: { type: Number },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date }

    },
    {
        timestamps: true
    }
);

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;