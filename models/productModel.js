import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        image: { type: String, required: true },
        brand: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        rent: { type: Number, required: false },
        penalty: { type: Number, required: false },
        countInStock: { type: Number, required: true },
        countInStockForRent: { type: Number, required: false },
        rating: { type: Number, required: false }, //set default to 0
        numReviews: { type: Number, required: false }, //set default to 0
        reviews: [reviewSchema],
        pickupDate: { type: Date },
        returnDate: { type: Date },
        pickedupAt: { type: Date },
        returnedAt: { type: Date },

    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;