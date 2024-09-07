const express = require("express");
const router = express.Router();
const { 
    getUsers, 
    createUser, 
    createUsersFromCSV, 
    getUser, 
    updateUser, 
    deleteUser } = require("../controllers/userController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // configure multer to save uploaded files
    
//add a user
router.route('/').post(createUser);

//upload users from CSV
router.post('/upload', upload.single('file'), createUsersFromCSV);

//get all users
router.route('/').get(getUsers);

//get a user by id
router.route('/:userId').get(getUser);

//Update a user by id
router.route('/:userId').put(updateUser);

//Update a user by id
router.route('/:userId').delete(deleteUser);

module.exports = router;