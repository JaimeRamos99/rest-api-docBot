"use strict";

const Goal = require("./../models/goals");
const Patient = require("./../models/patients");
const { Expo } = require('expo-server-sdk');
/**
 * Muestra todos las metas guardados en la bd
 */
exports.all = (req, res, next) => {
    Goal.find()
    .then( goals => {
        res.json(goals);
    })
    .catch( err => {
        next(new Error(err));
    });
};
/**
 * Recibe un JSON con toda la info de la meta y lo guarda en la bd
 */
exports.post = (req, res, next) => {
    const goal = req.body;
    var patient;
    goal["progress"] = {'value': goal["progress"], 'date': goal["date"] };
    new Goal(goal).save(err=>{
       console.log(err);
    });
    Patient.findOne({ '_id': goal["pat"] }, ['token', 'logged'] , function (err, user){
        console.log(user);
        if(user==null){
            console.log(err);
        }else{
            patient= user['token'];
        if(user.logged){ 
            // Create a new Expo SDK client
            let expo = new Expo();
            console.log(patient);
            // Create the messages that you want to send to clents
            let pushToken = patient;
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
                body: 'Tiene una nueva meta asignada por su médico!',
                title: 'NUEVA META',
                data: { withSome: 'data' },
            });
            
            // The Expo push notification service accepts batches of notifications so
            // that you don't need to send 1000 requests to send 1000 notifications. We
            // recommend you batch your notifications to reduce the number of requests
            // and to compress them (notifications with similar content will get
            // compressed).
            let chunks = expo.chunkPushNotifications(messages);
            let tickets= [];
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
        // Later, after the Expo push notification service has delivered the
        // notifications to Apple or Google (usually quickly, but allow the the service
        // up to 30 minutes when under load), a "receipt" for each notification is
        // created. The receipts will be available for at least a day; stale receipts
        // are deleted.
        //
        // The ID of each receipt is sent back in the response "ticket" for each
        // notification. In summary, sending a notification produces a ticket, which
        // contains a receipt ID you later use to get the receipt.
        //
        // The receipts may contain error codes to which you must respond. In
        // particular, Apple or Google may block apps that continue to send
        // notifications to devices that have blocked notifications or have uninstalled
        // your app. Expo does not control this policy and sends back the feedback from
        // Apple and Google so you can handle it appropriately.
        /*
        let receiptIds;
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (tickets.id) {
            receiptIds.push(tickets.id);
        }
        
        chunk = expo.chunkPushNotificationReceiptIds(receiptIds);
        (async () => {
        // Like sending notifications, there are different strategies you could use
        // to retrieve batches of receipts from the Expo service.
            try {
            let receipt = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipt);

            // The receipts specify whether Apple or Google successfully received the
            // notification and information about an error, if one occurred.
            
                if (receipt.status === 'ok') {
                    return;
                } else if (receipt.status === 'error') {
                console.error(`There was an error sending a notification: ${receipt.message}`);
                if (receipt.details && receipt.details.error) {
                    // The error codes are listed in the Expo documentation:
                    // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                    // You must handle the errors appropriately.
                    console.error(`The error code is ${receipt.details.error}`);
                }
                }
            } catch (error) {
            console.error(error);
            }
        })();
        
        */
    }
    });
    res.json(goal);
    
};
/**
 * Recibe un JSON con el id del paciente, devuelve JSONs con las metas asociados a este
 */
exports.findgoals = (req, res, next) => { 
    const user2 = req.body;
    const patient= user2["pat"];
    Goal.find({ 'pat': patient })
    .then( goals => {
        res.json(goals);
    })
    .catch( err => {
        next(new Error(err));
    });
  
};
/**
 * Actualizar datos de la meta
 */
exports.putpat = (req, res, next) => {
    const updates = req.body;
    const id = updates["id"];
    console.log(updates);
    Goal.updateOne({ '_id': id }, {$push:{'progress':{'value': updates["progress"],'date':updates["date"]}},
    'state':updates["state"], 'nMessages': updates["nMessages"],
    'complianceDate': updates["complianceDate"]}, function (err, patient) {
        if(err){
            console.log(err);
        }
    });
    res.json({"update": "OK"});
};

/**
 * Actualizar datos de la meta
 */
exports.putpd = (req, res, next) => {
    const updates = req.body;
    const id = updates["id"];
    console.log(updates);
    Goal.updateOne({ '_id': id }, {'description': updates["description"],
     'dueDate':updates["dueDate"], 'quantity': updates["quantity"],
     'frequency': updates["frequency"]}, function (err, patient) {
        if(err){
            console.log(err);
        }
    });
    res.json({"update": "OK"});
};

/**
 * Borrar meta
 */
exports.delete = (req, res, next) => {
    const goal = req.headers;
    const id= goal["id"];
    console.log(goal);
    Goal.deleteOne({'_id': id }, function (err) {
        if(err){
            console.log(err)
        }
        res.json({"delete":"ok"});
    });
};

/**
 * Actualizar progreso de la meta del paciente
 */
exports.putprogress = (req, res, next) => {
    const updates = req.body;
    const id = updates["id"];
    console.log(updates);
    const daatee= updates["date"];
    Goal.updateOne({ '_id': id }, {$push:{'progress':{'value': updates["progress"],'date': daatee}}}, function (err, goal) {
        if(err){
            console.log(err);
        }
        console.log(goal)
    });
    res.json({"update": "OK"});
};
/**
 * Recibe el id de la meta y nueva, devuelve JSON asociados a este
 */
exports.getprogress = (req, res, next) => { 
    const user2 = req.headers;
    const id= user2["id"];
    Goal.findOne({ '_id': id },['progress'],function (err, user) {
        if(user==null){
            res.json({"progress":"no asociado a meta"});
        }else{
            res.json({"progress":user.progress});
        }
    });
};


