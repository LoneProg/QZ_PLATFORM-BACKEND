const express = require("express");
const router = express.Router();
const { getUsers, createUser, getUser, updateUser, deleteUser } = require("../controllers/userController");

//add a user
router.route('/').post(createUser);

//get all users
router.route('/').get(getUsers);

//get a user by id
router.route('/:userId').get(getUser);

//Update a user by id
router.route('/:userId').put(updateUser);

//Update a user by id
router.route('/:userId').delete(deleteUser);

module.exports = router;