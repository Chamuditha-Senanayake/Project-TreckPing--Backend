import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth } from '../utils.js';
import Reservation from '../models/reservationModel.js';

const reservationRouter = express.Router();

reservationRouter.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.find().populate('user', 'name');
        res.send(reservation);
    })
)

reservationRouter.post(
    '/', isAuth, expressAsyncHandler(async (req, res) => {
        const newReservation = Reservation({
            orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            totalPrice: req.body.totalPrice,
            user: req.user._id
        });

        const reservation = await newReservation.save();
        res.status(201).send({ message: 'Reservation has been made ', reservation })
    })
);


// reservationRouter.get(
//     '/summary',
//     isAuth,
//     isAdmin,
//     expressAsyncHandler(async (req, res) => {
//         const orders = await Order.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     numOrders: { $sum: 1 },
//                     totalSales: { $sum: '$totalPrice' },
//                 },
//             },
//         ]);
//         const users = await User.aggregate([
//             {
//                 $group: {
//                     _id: null,
//                     numUsers: { $sum: 1 },
//                 },
//             },
//         ]);
//         const dailyOrders = await Order.aggregate([
//             {
//                 $group: {
//                     _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//                     orders: { $sum: 1 },
//                     sales: { $sum: '$totalPrice' },
//                 },
//             },
//             { $sort: { _id: 1 } },
//         ]);
//         const productCategories = await Product.aggregate([
//             {
//                 $group: {
//                     _id: '$category',
//                     count: { $sum: 1 },
//                 },
//             },
//         ]);
//         res.send({ users, orders, dailyOrders, productCategories });
//     })
// );


reservationRouter.get(
    '/mine', isAuth, expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.find({ user: req.user._id });
        if (reservation) {
            res.send(reservation);
        }
        else {
            res.status(404).send({ message: 'Reservation Not Found' })
        }

    })
);

reservationRouter.get(
    '/:id', isAuth, expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            res.send(reservation);
        }
        else {
            res.status(404).send({ message: 'Reservation Not Found' })
        }

    })
);

reservationRouter.put(
    '/:id/deliver',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isDelivered = true;
            reservation.deliveredAt = Date.now();
            await reservation.save();
            res.send({ message: 'Order Delivered' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

reservationRouter.put(
    '/:id/pay',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isPaid = true;
            reservation.paidAt = Date.now();
            reservation.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address
            };
            const updatedReservation = await reservation.save();
            res.send({ message: 'Payment Completed Successfully', order: updatedReservation });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
)


export default reservationRouter;
