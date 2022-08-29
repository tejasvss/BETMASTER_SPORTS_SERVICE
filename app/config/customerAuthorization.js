const Customer = require('../models/customer/customer');
const appsConfig = require('../constants/appConstants.json');
const jwt = require('jsonwebtoken')

//Verification setup for the provided token
exports.verifyToken = async (req, res, next) => {

    try {

        let token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.status(403).send({
                status: 403,
                message: "No token provided!"
            });
        }

        //Decoding the provided token
        const decoded = jwt.verify(token, appsConfig.JWT_SECRET_ACCESS_KEY);

        //Finding the user in user's collections
        const user = await Customer.findOne({ _id: decoded._id })
        if (!user) {
            return res.status(401).send({
                status: 401,
                Message: "Unauthorized User or User not found for provided token!"
            });
        }
        req.user = user;
        req.role = user.role;
        req.customerId = user.customerId;
        req.id = user._id;

        next();
    }
    catch (err) {

        res.status(500).send({
            status: 500,
            Message: err.message || "Session timed out.Try login again "
        })
    }

};


exports.isCustomer = async (req, res, next) => {

    if (req.role.toLowerCase() === "customer") {
        next();
        return;
    }
    res.status(400).send({
        status: 400,
        message: "Access denied. Require Customer Role!"
    });
    return;
}