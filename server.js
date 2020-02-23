'use strict';
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb+srv://clus_admin:lunallena@cluster0-m4c2l.mongodb.net/Botic?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log("Conectado a la base de dato")
});

const api = require("./api/");

var cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use("/api", api);

app.listen(process.env.PORT || 8080, () => {
    console.log('Servidor iniciado');
});

