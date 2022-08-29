const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({

    referralCode: {
        type: String
    },
    username: {
        type: String,
        unique: true,
        index: true,
        sparse: true
    },

    walletBalance: {
        type: Number,
        default: 0
    },
    customerId: {
        type: String,
        unique: true,
        sparse: true,
        index: true

    },
    userState: {
        type: String,
        default: "Normal"
    },
    role: {
        type: String,
        default: "customer"
    },
    nickname: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        index: true,
        sparse: true
    },
    password: {
        type: String
    },
    userBankName: {
        type: String
    },
    userBankAccountNumber: {
        type: Number,
        unique: true,
        index: true,
        sparse: true
    },
    userBankAccountHolderName: {
        type: String
    },
    mobileNumber: {
        type: Number,
        unique: true,
        index: true,
        sparse: true
    },
    countryCode: {
        type: Number
    },
    mobileOtp: {
        type: String
    },
    emailOtp: {
        type: String
    },
    emailOtpExpiryTime: {
        type: Date
    },
    mobileOtpExpiryTime: {
        type: Date
    },
    isAccountBlocked: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isMobileNumberVerified: {
        type: Boolean,
        default: false
    },
    isBankDetailsUpdated: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    },
    lastLoginTime: {
        type: Date
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    totalDepositsAmount: {
        type: Number,
        default: 0
    },
    totalWithdrawlsAmount: {
        type: Number,
        default: 0
    },
    totalRevenueAmount: {
        type: Number,
        default: 0
    },
    bankDetailsUpdatedAt:
    {
        type: Date
    },
    note: {
        type: String,
        default: "Note is not yet added"
    },
    registeredIPAddress: {
        type: String,
        default: "NA"
    },
    IPAddress: {
        type: String,
        default: "NA"
    },
    deviceName: {
        type: String,
        default: "na",
        lowercase: true
    }

}, { timestamps: true, versionKey: false });

//Hiding the secret keys
customerSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.mobileOtpExpiryTime;
    delete userObject.mobileOtp;
    delete userObject.emailOtp;
    delete userObject.emailOtpExpiryTime;
    delete userObject.role;
    return userObject;

}

const Customer = new mongoose.model("customers", customerSchema);

module.exports = Customer;