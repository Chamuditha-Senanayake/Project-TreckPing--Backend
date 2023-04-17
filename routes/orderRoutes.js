import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth } from '../utils.js';
import Reservation from '../models/reservationModel.js';

const orderRouter = express.Router();

orderRouter.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.find().populate('user', 'name');
        res.send(orders);
    })
)


orderRouter.post(
    '/orders-by-date',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.find({
            createdAt:
            {
                $gte: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.startDate],
                $lt: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.endDate]
            }
        });
        if (order) {
            res.send(order);
        }
        else {
            res.status(404).send({ message: 'Orders Not Found' })
        }
    })
)

orderRouter.post(
    '/', isAuth, expressAsyncHandler(async (req, res) => {
        const newOrder = Order({
            orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            totalPrice: req.body.totalPrice,
            user: req.user._id,
            deliveryStatus: "Preparing"
        });

        const order = await newOrder.save();
        res.status(201).send({ message: 'New Order Created', order })
    })
);


//get summary API
orderRouter.get(
    '/summary',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    numOrders: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                },
            },
        ]);

        const reservations = await Reservation.aggregate([
            {
                $group: {
                    _id: null,
                    numOrders: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                },
            },
        ]);

        const users = await User.aggregate([
            {
                $group: {
                    _id: null,
                    numUsers: { $sum: 1 },
                },
            },
        ]);
        const dailyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    sales: { $sum: '$totalPrice' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const monthlyOrders = await Order.aggregate([

            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                                { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                                { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                                { case: { $eq: ["$_id.month", 9] }, then: "Sept" },
                                { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                                { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                                { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
                            ],
                            default: "Unknown"
                        }
                    },
                    year: "$_id.year",
                    count: 1,
                    totalAmount: 1
                }
            }



        ]);

        const monthlyReservations = await Reservation.aggregate([

            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                                { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                                { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                                { case: { $eq: ["$_id.month", 9] }, then: "Sept" },
                                { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                                { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                                { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
                            ],
                            default: "Unknown"
                        }
                    },
                    year: "$_id.year",
                    count: 1,
                    totalAmount: 1
                }
            }
        ]);

        const dailyReservations = await Reservation.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    sales: { $sum: '$totalPrice' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const preparingOrders = await Order.aggregate([

            { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
            { $match: { _id: "Preparing" } },
        ]);

        const completedOrders = await Order.aggregate([

            { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
            { $match: { _id: "Delivered" } },
        ]);

        const preparingReservations = await Reservation.aggregate([
            {
                $match: {
                    $and: [
                        { deliveryStatus: "Preparing" }, { isPaid: true },
                    ]
                }
            },
            { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
        ]);

        const completedReservations = await Reservation.aggregate([

            { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
            { $match: { _id: "Completed" } },
        ]);

        const productCategories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);

        const reservationsByDate = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalAmount: { $sum: "$totalPrice" },
                    orders: { $sum: 1 },

                }
            },
            {
                $match: {
                    _id: {
                        $gte: ("2023-01-01T00:00:00Z"),
                        $lte: ("2023-04-15T23:59:59Z")
                    }
                }
            }
        ]);

        res.send({ users, orders, reservations, dailyOrders, monthlyOrders, monthlyReservations, preparingOrders, completedOrders, dailyReservations, preparingReservations, completedReservations, productCategories, reservationsByDate });
    })
);


//get summary by date API
orderRouter.post(
    '/filter-by-date',
    isAuth,
    expressAsyncHandler(async (req, res) => {

        const orders = await Order.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.startDate] },
                            { $lt: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.endDate] }
                        ]
                    }
                }
            },

            // Group documents by null and calculate the sum of reservations
            {
                $group: {
                    _id: null,
                    numOrders: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                }
            }
        ]);

        const preparingOrders = await Order.aggregate([
            {
                $match: {
                    deliveryStatus: "Preparing",
                    isPaid: true,
                    $expr: {
                        $and: [
                            { $gte: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.startDate] },
                            { $lt: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.endDate] },
                        ]
                    }
                },
            },

            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                }
            }
        ]);

        const completedOrders = await Order.aggregate([
            {
                $match: {
                    deliveryStatus: "Delivered",
                    $expr: {
                        $and: [
                            { $gte: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.startDate] },
                            { $lt: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.endDate] }
                        ]
                    }
                },
            },

            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                }
            }
        ]);

        const OrdersByDate = await Order.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.startDate] }, //"2022-04-10T00:00:00Z"
                            { $lt: [{ $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%SZ", timezone: "UTC" } }, req.body.endDate] }  //"2023-02-16T00:00:00Z"
                        ]
                    }
                },
            },

            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                }
            }
        ]);

        res.send({ orders, preparingOrders, completedOrders, OrdersByDate });
    })
);


orderRouter.get(
    '/mine', isAuth, expressAsyncHandler(async (req, res) => {
        const order = await Order.find({ user: req.user._id });
        if (order) {
            res.send(order);
        }
        else {
            res.status(404).send({ message: 'Order Not Found' })
        }

    })
);

const PAGE_SIZE = 3;

orderRouter.post(
    '/by-location',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const orders = await Order.find({
            "shippingAddress.address": req.body.address
        }).skip(pageSize * (page - 1))
            .limit(pageSize);

        const countOrders = await Order.find({
            "shippingAddress.address": req.body.address
        }).count();

        res.send({
            orders,
            countOrders,
            page,
            pages: Math.ceil(countOrders / pageSize),
        });

    })
);


orderRouter.post(
    '/by-location/not-delivered',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.find(
            { $and: [{ "shippingAddress.address": req.body.address }, { deliveryStatus: "Dispatched" }] })

        if (orders) {
            res.send(orders);
        } else {
            res.status(404).send({ message: 'Orders Not Found' });
        }

    })
);

orderRouter.get(
    '/:id', isAuth, expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.send(order);
        }
        else {
            res.status(404).send({ message: 'Order Not Found' })
        }

    })
);

orderRouter.put(
    '/:id/dispatch',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isDispatched = true;
            order.deliveryStatus = "Dispatched"
            order.dispatchedAt = Date.now();
            await order.save();
            res.send({ message: 'Order Dispatched' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

orderRouter.put(
    '/:id/deliver',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.deliveryStatus = "Delivered"
            order.deliveredAt = Date.now();
            await order.save();
            res.send({ message: 'Order Delivered' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

orderRouter.put(
    '/:id/pay',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address
            };
            const updatedOrder = await order.save();
            res.send({ message: 'Payment Completed Successfully', order: updatedOrder });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
)


export default orderRouter;
