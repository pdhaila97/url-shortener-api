const express = require("express");
const { nanoid } = require("nanoid");
const CONSTANTS = require("../constants");
const UrlConfigModel = require("../models/urlConfig");

const router = express.Router();

router.post("/generate", async (req, res) => {
    const longUrl = req.body.url;
    const expiryTime = req.query.expiryTime;
    const loggingEnabled = req.query.loggingEnabled;
    const shortHashUrl = nanoid(CONSTANTS.defaultIdLength); // ~1 thousand years needed, in order to have a 1% probability of at least one collision.

    const urlConfigVal = {
        longUrl: longUrl,
        shortUrl: shortHashUrl
    }
    if(expiryTime) {
        urlConfigVal["expiryTime"] = expiryTime;
    }
    if(loggingEnabled) {
        urlConfigVal["logging"] = {
            isEnabled: loggingEnabled === "true"
        }
    }
    const urlConfig = new UrlConfigModel(urlConfigVal);

    await urlConfig.save();

    res.send({
        shortUrl: shortHashUrl
    });

});

router.get("/:id", async (req, res) => {
    const shortHashUrl = req.params.id;

    const urlConfig = await UrlConfigModel.findOne({shortUrl: shortHashUrl});
    if(urlConfig) {
        if(urlConfig.expiryTime != undefined && urlConfig.expiryTime != null) {
            const currentTime = new Date().getTime();
            if(urlConfig.expiryTime < currentTime) {
                res.status(500).send({
                    errorCode: "SHORT_URL_EXPIRED"
                });
                return;
            }
        }

        if(urlConfig.logging && urlConfig.logging.isEnabled) {
            const hitsInfoObj = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"]
            }

            const logging = {
                isEnabled: urlConfig.logging.isEnabled,
                numOfHits: urlConfig.logging.numOfHits + 1,
                hitsInfo: [...urlConfig.logging.hitsInfo, hitsInfoObj]
            }

            await UrlConfigModel.findOneAndUpdate({shortUrl: shortHashUrl}, {$set: { 'logging': logging }})
        }

        res.send({
            url: urlConfig.longUrl
        })
    } else {
        res.status(404).send({
            errorCode: "SHORT_URL_INVALID"
        })
    }
})

module.exports = router;