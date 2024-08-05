const asyncHandler = require("express-async-handler");
const User = require("../models/users");

//@desc Create User
//@route POST /api/users
//@access public
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password, // Note: Ideally, you should hash the password before saving
        role
    });

    if (user) {
        res.status(201).json({
            message: "User Successfully Created",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
        
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

//@desc Get all Users
//@route GET /api/users
//@access public
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

//@desc Get a User
//@route GET /api/users/:userId
//@access public
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//@desc Update User
//@route PUT /api/users/:userId
//@access public
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password; // Hash password if changed
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//@desc Delete User
//@route DELETE /api/users/:userId
//@access public
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);

    if (user) {
        await user.remove();
        res.json({ message: "User removed" });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};
