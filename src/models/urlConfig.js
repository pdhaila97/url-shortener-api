const mongoose = require("mongoose");

const hitsInfoSchema = new mongoose.Schema({
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    _id: false
})

const loggingSchema = new mongoose.Schema({
    isEnabled: {
        type: Boolean,
        default: false
    },
    numOfHits: {
        type: Number,
        default: 0
    },
    hitsInfo: {
        type: [hitsInfoSchema],
        default: []
    }
}, {
    _id: false
})

const urlConfigSchema = new mongoose.Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    expiryTime: {
        type: Number
    },
    logging: {
        type: loggingSchema
    }
});

const UrlConfigModel = mongoose.model("urlConfig", urlConfigSchema);

module.exports = UrlConfigModel;