'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-venta@Online';

exports.ensureAuth = (req, res, next) => {
    if(!req.headers.authorization){
        return res.status(404).send({message: 'La petición no lleva cabecera de autenticación'});
    }else{
        var token = req.headers.authorization.replace(/['"']+/g,'');

        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message:'El token ah expirado'});
            }
        }catch(err){
            return res.status(401).send({message:'Token invalido'});
        }
        req.user = payload;
        console.log(req.user);
        next();
    }
}

exports.validRol = (req, res, next) => {
    var payload = req.user;

    if(payload.rol != 'ROL_ADMIN'){
        return res.status(401).send({message:'No tienes permiso para realizar esta acción'});
    }else{
        next();
    }
}