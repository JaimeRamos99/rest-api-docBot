"use strict";

const Paraclinical = require("./../models/paraclinicals");
const Patient = require("./../models/patients");
var excel = require('excel4node');
//Muestra todos los paraclinicos guardados en la bd
exports.all = (req, res, next) => {
    Paraclinical.find()
    .then( paraclinicals => {
        res.json(paraclinicals);
    })
    .catch( err => {
        next(new Error(err));
    });
};
//Recibe un JSON con toda la info del paraclinico y lo guarda en la bd
exports.post = (req, res, next) => {
    const paraclinical = req.body;
    new Paraclinical(paraclinical).save(err=>{
       console.log(err);
    });
    res.json(paraclinical);
    
};
//Recibe el id de un paciente, devuelve JSONs con los paraclinicos asociados a este
exports.findparaclinicals = (req, res, next) => { 
    const user2 = req.headers;
    const patient= user2['patient'];
    Paraclinical.find({ 'patient': patient })
    .then( paraclinicals => {
        res.json(paraclinicals);
    })
    .catch( err => {
        next(new Error(err));
    });
  
};
//Recibe el id de un paciente y el tipo de paraclinico, devuelve JSONs con los paraclinicos asociados a este
exports.findparaclinicalsbypandt = (req, res, next) => { 
    const user2 = req.body;
    const patient= user2['patient'];
    const type= user2['type'];
    Paraclinical.find({ 'patient': patient, 'type': type })
    .then( paraclinicals => {
        res.json(paraclinicals);
    })
    .catch( err => {
        next(new Error(err));
    });
  
};
/**
 * Exportar datos de los pacientes selecionados
 */
exports.exportData = (req,res,next) =>{
    const ids = req.body;
    var pcs= [];
    console.log(ids);
    const tam=ids.length-1;
    for (var i in ids){
        Paraclinical.find({'patient': ids[i].id}, ['date', 'type', 'value', 'comment'],function(err,pc){
            if(pc == null ){
                console.log(err);
            }else{
                for(var j in pc){
                    pcs.push(pc[j]);
                }
                console.log(pcs);
            }   
            if(i == tam){
                res.json(pcs);
            } 
        });
    }
    
}