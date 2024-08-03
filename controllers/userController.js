//@desc create Users
//@route POST api/users
//@access public
const createUser = (req, res) => {
    console.log("Entered user Details:", req.body)
    const {username, name, email} = req.body;
    if (!username || !name || !email) {
        res.status(403);
        throw new Error("All fields are Mandatory")
    }
    res.send("Add a user");
}

//@desc get all Users
//@route GET api/users
//@access public
const getUsers = (req, res) => {
    res.send("Get all Users");
}

//@desc get a User
//@route GET api/users/:userId
//@access public
const getUser = (req, res) => {
    res.send(`Get a user at ${req.params.userId}`);
}

//@desc Update User
//@route PUT api/users/:userId
//@access public
const updateUser = (req, res) => {
    res.send(`update a user at ${req.params.userId}`);
}

//@desc Delete User
//@route PUT api/users/:userId
//@access public
const deleteUser = (req, res) => {
    res.send(`delete a user at ${req.params.userId}`);
}
module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
}