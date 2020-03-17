"use strict";

const Patient = require("./../models/patients");
const MedicalInfo = require("./../models/medicalInfos");
const Goals = require("./../models/goals");
const Paraclinical = require("./../models/paraclinicals");
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer');
//var Excel = require('exceljs');

/**
 * Muestra todos los pacientes guardados en la bd
 */
exports.all = (req, res, next) => {
    Patient.find()
        .then(patients => {
            res.json(patients);
        })
        .catch(err => {
            next(new Error(err));
        });
};
/**
 * Recibe un JSON con toda la info del paciente y lo guarda en la bd
 */
exports.post = (req, res, next) => {
    const patient = req.body;
    const saltRounds = 10;
    exports.sendEmail(req);
    console.log(patient);
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(patient["password"], salt, function (err, hash) {
            patient["password"] = hash;
            new Patient(patient).save(err => {
                console.log(err);
            });
            res.json({ "Post": "ok" });
        });
    });
};
/**
 * Buscar pacientes segun número de documento 
 */
exports.findpatient = (req, res, next) => {
    const patient = req.headers;
    const dn = patient['documentnumber'];
    console.log(dn);
    Patient.findOne({ 'documentNumber': dn }, ['name'], function (err, user) {
        console.log(user);
        if (user == null) {
            res.json({ "Patient": "not found" })
            console.log(err);
        } else {
            console.log({ "id": user._id, "name": user.name });
            res.json({
                "id": user.id,
                "name": user.name
            });
        }
    });
};
/**
 * Recibe un JSON con el id del doctor, devuelve JSONs con los pacientes asociados a este
 */
exports.findpatients = (req, res, next) => {
    const user2 = req.body;
    const doctor = user2["doc"];
    Patient.find({ 'doc': doctor })
        .then(patients => {
            res.json(patients);
        })
        .catch(err => {
            next(new Error(err));
        });

};
/**
 * Buscar pacientes segun id 
 */
exports.findpatientbyid = (req, res, next) => {
    const patient = req.headers;
    const dn = patient['id'];
    console.log(dn);
    Patient.findOne({ '_id': dn }, ['name', 'lastName', 'age', 'weight', 'height', 'medicalCenter', 'password',
        'avatar', 'sex', 'email', 'steps'], function (err, user) {
            console.log(user);
            if (user == null) {
                res.json({ "Patient": "not found" })
                console.log(err);
            } else {
                MedicalInfo.findOne({ 'patient': user.id }, ['weight', 'height', 'abdominalperimeter'], function (err, med) {
                    res.json({
                        "id": user.id,
                        "name": user.name,
                        "lastName": user.lastName,
                        "age": user.age,
                        "medicalCenter": user.medicalCenter,
                        "weight": med.weight,
                        "height": med.height,
                        "abdominalperimeter": med.abdominalperimeter,
                        "avatar": user.avatar,
                        "sex": user.sex,
                        "email": user.email,
                        "steps": user.steps
                    });
                });
            }
        });
};

/**
 * Login pacientes
 */
exports.login = (req, res, next) => {
    const user2 = req.body;
    const email = user2["documentNumber"];
    const password = user2["password"];
    Patient.findOne({ 'documentNumber': email }, [], function (err, user) {
        if (user == null) {
            res.json({ "login": false });
        } else {
            bcrypt.compare(password, user.password, function (err, resu) {
                if (resu == true) {
                    res.json({
                        "login": true,
                        "id": user.id
                    });

                } else {
                    res.json({ "login": false })
                }
            });
        }
    });

};
/**
 * Actualizar datos del paciente por el doctor
 */
exports.put = (req, res, next) => {
    const updates = req.body;
    const id = updates["_id"];
    Patient.updateOne({ '_id': id }, {
        'name': updates["name"],
        'lastName': updates["lastName"], 'birthdate': updates["birthdate"],
        'documentType': updates["documentType"], 'documentNumber': updates["documentNumber"], 'age': updates["age"],
        'sex': updates["sex"], 'medicalCenter': updates["medicalCenter"], 'email': updates["email"]
    }, function (err, patient) {
        if (err) {
            console.log(err);
        }
    });
    res.json({ "update": "OK" });
};
/**
 * Actualizar datos del paciente por paciente
 */
exports.putpat = (req, res, next) => {
    const updates = req.body;
    const id = updates["id"];
    console.log(updates);
    Patient.updateOne({ '_id': id }, {
        'name': updates["name"],
        'lastName': updates["lastName"], 'age': updates["age"], 'avatar': updates["avatar"], 'steps': updates["steps"],
        'email': updates["email"]
    }, function (err, patient) {
        if (err) {
            console.log("Error: " + err);
        }
    });
    MedicalInfo.updateOne({ 'patient': id }, { 'height': updates["height"] }, function (err, med) {
        if (err) {
            console.log("Error: " + err);
        }
    });
    res.json({ "update": "OK" });
};
/**
 * Enviar correo con información
 */
exports.sendEmail = (req) => {
    const patient = req.body;
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'docbotadmon@gmail.com',
            pass: 'f5J~w5Q]=1JDj'
        }
    });
    const mailOptions = {
        from: 'docbotadmon@gmail.com', // sender address
        to: patient["email"], // list of receivers
        subject: 'BIENVENIDO A DOCBOT', // Subject line
        html: '<h2>Bienvenido a DocBot!</h2><p>' + patient["name"] + ', su cuenta ha sido creada exitosamente<br/><br/><b>Nombre de usuario: </b>' + patient["documentNumber"] + '<br/><b>Contraseña: </b>' + patient["password"] + '<br/><br/><br/>Cordialmente, <br/> <img src="https://raw.githubusercontent.com/CCode02/DocBot-Movil/master/assets/logo.png" width="200" height="250"><br/> <i>"Sistema de acompañamiento para pacientes con<i><br/><i>Diabetes tipo 2 y síndrome metabólico"<i><br/><strong>Universidad del norte - 2019</strong></p>'// plain text body
    };
    console.log(patient["email"]);
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
};
/**
 * Delete patient- Preguntar si debo borrar las metas
 */
exports.delete = async function (req, res, next) {
    const patient = req.headers;
    const id = patient["id"];
    console.log(id);
    await MedicalInfo.deleteMany({ 'patient': id }, function (err) {
        if (err) {
            console.log(err)
        }
    });
    await Paraclinical.deleteMany({ 'patient': id }, function (err) {
        if (err) {
            console.log(err)
        }
    });
    await Patient.deleteOne({ '_id': id }, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.json({ "delete": "ok" });
        }
    });
}
/**
 * Actualizar token
 */
exports.putoken = (req, res, next) => {
    const update = req.body;
    const aidi = update["id"];
    console.log(update);
    Patient.updateOne({ '_id': aidi }, { 'token': update["token"] }, function (err, user) {
        if (err) {
            console.log("Error: " + err);
        }
    });
    res.json({ "update": "ok" });
};
/**
 * Actualizar logged
 */
exports.putlogged = (req, res, next) => {
    const update = req.body;
    const aidi = update["id"];
    console.log(update);
    Patient.updateOne({ '_id': aidi }, { 'logged': update["logged"] }, function (err, user) {
        if (err) {
            console.log("Error: " + err);
        }
    });
    res.json({ "update": "ok" });
};
/**
 * Enviar notificación según hora
 */
exports.sendNotification = (req, res, next) => {
    const data = req.body;
    const tag = req.headers;
    //tag= 1, en la mañana - 7am; tag=2, en la tarde-noche 6pm
    if (tag == 1) {
        exports.notification(data, "");
    } else {
        exports.notification(data, "");
    }
};

/**
 * Enviar notificación
 */
exports.notification = (req, messa) => {
    const patients = req.body;
    for (var i in patients) {
        var token = patients[i].token;
        var logged = patients[i].logged;
        if (logged) {
            // Create a new Expo SDK client
            let expo = new Expo();
            console.log(patient);
            // Create the messages that you want to send to clents
            let pushToken = token;
            let messages = [];
            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                return;
            }

            // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
            messages.push({
                to: pushToken,
                sound: 'default',
                body: messa,
                title: '',
                data: { withSome: 'data' },
            });

            // The Expo push notification service accepts batches of notifications so
            // that you don't need to send 1000 requests to send 1000 notifications. We
            // recommend you batch your notifications to reduce the number of requests
            // and to compress them (notifications with similar content will get
            // compressed).
            let chunks = expo.chunkPushNotifications(messages);
            let tickets = [];
            (async () => {
                // Send the chunks to the Expo push notification service. There are
                // different strategies you could use. A simple one is to send one chunk at a
                // time, which nicely spreads the load out over time:
                for (let chunk of chunks) {
                    try {
                        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        console.log(ticketChunk);
                        tickets.push(...ticketChunk);
                        // NOTE: If a ticket contains an error code in ticket.details.error, you
                        // must handle it appropriately. The error codes are listed in the Expo
                        // documentation:
                        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();
        }
    }
};

/**
 * Exportar datos de los pacientes selecionados
 */
exports.exportData = (req, res, next) => {
    const ids = req.body;
    //const ids = headrs['ids'];
    console.log(ids);
    var users = [];
    const tam = ids.length - 1;
    for (var i in ids) {
        Patient.findOne({ '_id': ids[i].id }, ['name', 'lastName', 'birthdate', 'age', 'documentType', 'documentNumber', 'sex', 'email',
            'doc', 'civilStatus', 'socioeconimic', 'educationLevel', 'smoking'], function (err, user) {
                if (user == null) {
                    console.log(err);
                } else {
                    users.push(user);
                    console.log(users);
                }
                if (users.length == ids.length) {
                    res.json(users);
                }
            });
    }
}

/*
exports.validate = (req, res, next) => {
    const token = req.headers["token"];
    jwt.verify(token, 'shhhhh', function(err, decoded) {
        if(err){
            res.json({"Error": err});
        }else{
            next();
    }
    });
}*/



