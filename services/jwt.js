'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-venta@Online';

exports.createToken = (user) => {
    var payload ={
        sub: user._id,
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        rol: user.rol,
        iat: moment().unix(),
        exp: moment().add(3600, 'seconds').unix()
    }
    return jwt.encode(payload, secretKey);
}