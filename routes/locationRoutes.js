import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Location from '../models/locationModel.js';
import { isAdmin, isAuth } from '../utils.js';

const locationRouter = express.Router();

const PAGE_SIZE = 3;

locationRouter.get(
    "/admin",
    expressAsyncHandler(async (req, res) => {

        const { query } = req;
        const page = query.page || 1;
        const pageSize = query.pageSize || PAGE_SIZE;
        const locations = await Location.find().skip(pageSize * (page - 1)).limit(pageSize);
        const countLocations = await Location.countDocuments();
        res.send({
            locations,
            countLocations,
            page,
            pages: Math.ceil(countLocations / pageSize),
        });
    })
);

locationRouter.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const location = await Location.findById(req.params.id);
        if (location) {
            res.send(location);
        } else {
            res.status(404).send({ message: "User Not Found" });
        }
    })
);

locationRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const location = await Location.findById(req.params.id);
        if (location) {
            location.location = req.body.nearestCity || location.nearestCity
            location.address = req.body.address || location.address;
            location.agent = req.body.agent || location.agent;
            location.email = req.body.email || location.email;
            location.contact = req.body.contact || location.contact;
            location.enabledAsPickupLocation = req.body.enabledAsPickupLocation;
            location.enabledAsDeliveryLocation = req.body.enabledAsDeliveryLocation;
            const updatedLocation = await location.save();
            res.send({ message: "Location Updated", user: updatedLocation });
        } else {
            res.status(404).send({ message: "Location Not Found" });
        }
    })
);


locationRouter.post(
    '/addlocation',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const newLocation = new Location({
            location: req.body.nearestCity,
            address: req.body.address,
            agent: req.body.agent,
            email: req.body.email,
            contact: req.body.contact,
            enabledAsPickupLocation: req.body.enabledAsPickupLocation,
            enabledAsDeliveryLocation: req.body.enabledAsDeliveryLocation
        });
        const location = await newLocation.save();
        res.status(201).send({ message: "Location added", location })
    })
);

locationRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const location = await Location.findById(req.params.id);
        if (location) {
            await location.remove();
            res.send({ message: 'Location Deleted' });
        } else {
            res.status(404).send({ message: 'Location Not Found' });
        }
    })
);

export default locationRouter;
