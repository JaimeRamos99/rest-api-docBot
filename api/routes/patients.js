"use strict";

const router = require("express").Router();
const controller = require("../controllers/patients");

router.route("/")
    .get(controller.all)
    .post(controller.post)
    .put(controller.put);

router.route("/buscar")
    .post(controller.findpatients);

router.route("/buscarPaciente")
    .get(controller.findpatient);

router.route("/login")
    .post(controller.login);
    
router.route("/sendemail")
    .get(controller.sendEmail);

router.route("/delete")
    .delete(controller.delete);

router.route("/updatepat")
    .put(controller.putpat);

router.route("/exportData")
    .post(controller.exportData);

router.route("/token")
    .put(controller.putoken);
    
module.exports = router;