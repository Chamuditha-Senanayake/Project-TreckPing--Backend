import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth } from '../utils.js';

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
        const productCategories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);
        res.send({ users, orders, dailyOrders, productCategories });
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
