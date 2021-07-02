'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middleware/authorizaded');

var api = express.Router();

api.post('/loginUser', userController.loginUser);
api.post('/saveClient/:id', [mdAuth.ensureAuth, mdAuth.validRol], userController.saveUser);
api.put('/:id/updateClient/:idC', [mdAuth.ensureAuth, mdAuth.validRol], userController.updateUser);
api.delete('/:id/removeClient/:idC', [mdAuth.ensureAuth, mdAuth.validRol], userController.removeClient);

//FUNCTIONES DE CLIENTE
api.post('/saveUser', userController.saveClient);
api.post('/listProducts/:id', mdAuth.ensureAuth, userController.listProducts);
api.post('/searchProduct/:id', mdAuth.ensureAuth, userController.searchProduct);
api.post('/getCategoryProduct/:id', mdAuth.ensureAuth, userController.getCategoryProduct);
api.post('/setShoppingCart/:id', mdAuth.ensureAuth, userController.setShoppingCart);
api.delete('/removedUser/:id', mdAuth.ensureAuth, userController.removedUser);
api.put('/updateClient/:id', mdAuth.ensureAuth, userController.updateClient);
api.get('/outOfStockProducts', userController.outOfStockProducts);
api.post('/creatOrUpdateBill/:id', mdAuth.ensureAuth, userController.creatOrUpdateBill);

module.exports = api;