import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAdmin, isAuth } from '../utils.js';

const userRouter = express.Router();

userRouter.get(
    "/",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })
);

userRouter.get(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            res.send(user);
        } else {
            res.status(404).send({ message: "User Not Found" });
        }
    })
);

userRouter.put(
    "/:id",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.isAdmin = Boolean(req.body.isAdmin);
            user.isAgent = Boolean(req.body.isAgent);
            const updatedUser = await user.save();
            res.send({ message: "User Updated", user: updatedUser });
        } else {
            res.status(404).send({ message: "User Not Found" });
        }
    })
);


userRouter.post(
    '/signin', expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.send({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isAgent: user.isAgent,
                    token: generateToken(user),
                });
                return;
            }
        }
        res.status(401).send({ message: 'Invalid email or pw' })
    })
);

userRouter.post(
    '/signup', expressAsyncHandler(async (req, res) => {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
        });
        const user = await newUser.save();
        res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            isAgent: user.isAgent,
            token: generateToken(user)
        });
    })
);


userRouter.put(
    '/profile/edit',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = bcrypt.hashSync(req.body.password, 8);
            }

            const updatedUser = await user.save();
            res.send({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser),
            });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    })
);

userRouter.get(
    "/agents/get-all-agents",
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })
);


export default userRouter;
