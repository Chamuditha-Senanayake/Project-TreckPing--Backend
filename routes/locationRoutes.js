import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Location from '../models/locationModel.js';
import { isAdmin, isAuth } from '../utils.js';

const locationRouter = express.Router();

//page size for pagination
const PAGE_SIZE = 3;

//get all locations with pagination
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


//get all locations router
locationRouter.get(
    "/get-all",
    expressAsyncHandler(async (req, res) => {
        const location = await Location.find();
        if (location) {
            res.send(location);
        } else {
            res.status(404).send({ message: "Location Not Found" });
        }
    })
);


//get location by id router
locationRouter.get(
    "/:id",
    expressAsyncHandler(async (req, res) => {
        const location = await Location.findById(req.params.id);
        if (location) {
            res.send(location);
        } else {
            res.status(404).send({ message: "Loacation Not Found" });
        }
    })
);


//update location by id router
locationRouter.put(
    "/:id",
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const location = await Location.findById(req.params.id);
        if (location) {
            location.location = req.body.nearestCity || location.nearestCity
            location.address = req.body.address || location.address;
            location.agent = req.body.agentId || location.agent;
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


//add new location router
locationRouter.post(
    '/addlocation',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const newLocation = new Location({
            location: req.body.nearestCity,
            address: req.body.address,
            agent: req.body.agentId,
            email: req.body.email,
            contact: req.body.contact,
            enabledAsPickupLocation: req.body.enabledAsPickupLocation,
            enabledAsDeliveryLocation: req.body.enabledAsDeliveryLocation
        });
        const location = await newLocation.save();
        res.status(201).send({ message: "Location added", location })
    })
);


//delete location by id router
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
