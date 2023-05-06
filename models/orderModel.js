import mongoose from 'mongoose';


//Order Model
const orderSchema = new mongoose.Schema(
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
            }
        ],
        shippingAddress: {
            fullName: { type: String, required: false },
            address: { type: String, required: true },
            city: { type: String, required: false },
            postalCode: { type: String, required: false }
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
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDispatched: { type: Boolean, default: false },
        deliveryStatus: { type: String, required: false },
        deliveredAt: { type: Date },
        dispatchedAt: { type: Date }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;