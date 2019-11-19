"use strict";

const router = require("express").Router();
const controller = require("../controllers/paraclinicals");

router.route("/")
    .get(controller.all)
    .post(controller.post);

router.route("/buscar")
    .get(controller.findparaclinicals)
    .post(controller.findparaclinicalsbypandt);


module.exports = router;