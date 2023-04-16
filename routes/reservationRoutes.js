import express from 'express';
import expressAsyncHandler from 'express-async-handler';
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

//to test
reservationRouter.post(
    '/reservations-by-date',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.find({ createdAt: req.user.startDate, createdAt: req.user.endDate, });
        if (reservation) {
            res.send(reservation);
        }
        else {
            res.status(404).send({ message: 'Reservation Not Found' })
        }
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
            user: req.user._id,
            deliveryStatus: "Preparing"
        });

        const reservation = await newReservation.save();
        res.status(201).send({ message: 'Reservation has been made ', reservation })
    })
);


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


/////////////////

const PAGE_SIZE = 3;

reservationRouter.post(
    '/by-location',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;

        const orders = await Reservation.find({
            "shippingAddress.pickupLocation": req.body.address
        }).skip(pageSize * (page - 1))
            .limit(pageSize);

        const countOrders = await Reservation.find({
            "shippingAddress.pickupLocation": req.body.address
        }).count();

        res.send({
            orders,
            countOrders,
            page,
            pages: Math.ceil(countOrders / pageSize),
        });

    })
);


reservationRouter.post(
    '/by-location/not-delivered',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const orders = await Reservation.find(
            { $and: [{ "shippingAddress.pickupLocation": req.body.address }, { deliveryStatus: { $in: ["Dispatched", "Delivered", "Released", "Received"] } }] })

        if (orders) {
            res.send(orders);
        } else {
            res.status(404).send({ message: 'Orders Not Found' });
        }

    })
);

//////////

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
    '/:id/dispatch',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Reservation.findById(req.params.id);
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

reservationRouter.put(
    '/:id/deliver',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isDispatched = true;
            reservation.deliveryStatus = "Delivered"
            reservation.deliveredAt = Date.now();
            await reservation.save();
            res.send({ message: 'Order Delivered' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

reservationRouter.put(
    '/:id/release',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isDispatched = true;
            reservation.deliveryStatus = "Released"
            reservation.releasedAt = Date.now();
            await reservation.save();
            res.send({ message: 'Order Released' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

reservationRouter.put(
    '/:id/receive',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isDispatched = true;
            reservation.deliveryStatus = "Received"
            reservation.receivedAt = Date.now();
            await reservation.save();
            res.send({ message: 'Order Received' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

reservationRouter.put(
    '/:id/return',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isDispatched = true;
            reservation.deliveryStatus = "Returned"
            reservation.returnedAt = Date.now();
            await reservation.save();
            res.send({ message: 'Order Returned' });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

reservationRouter.put(
    '/:id/complete',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
            reservation.isDispatched = true;
            reservation.deliveryStatus = "Completed"
            reservation.completedAt = Date.now();
            await reservation.save();
            res.send({ message: 'Order Completed' });
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
