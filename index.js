'use strict'

var mongoose = require('mongoose');
var port = 3200;
var app = require('./app');
var userAdmin = require('./controllers/user.controller')

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/Proyecto_Venta_Online', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Conectado a la DB');
        userAdmin.creatInit();
        app.listen(port, () => {
            console.log('Servidor de express activado');
        })
    }).catch((err) => {
        console.log('Error al conectar a la DB', err);
    })    