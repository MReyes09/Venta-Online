'use strict'

var express = require('express');
var productCOntroller = require('../controllers/product.controller');
var mdAuth = require('../middleware/authorizaded');

var api = express.Router();

//FUNCIONES DE ADMIN ----------------------> CRUD DE PRODUCTOS
api.post('/creatProduct/:id', [mdAuth.ensureAuth, mdAuth.validRol],productCOntroller.creatProduct);
api.post('/getProducts/:id', [mdAuth.ensureAuth,mdAuth.validRol], productCOntroller.getProducts);
api.put('/:idU/updateProduct/:idP', [mdAuth.ensureAuth, mdAuth.validRol], productCOntroller.updateProduct);
api.delete('/:id/deleteProduct/:idP', [mdAuth.ensureAuth, mdAuth.validRol], productCOntroller.deleteProduct);
//##########################################################################################################

module.exports = api;