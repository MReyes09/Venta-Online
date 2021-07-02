'use strict'

var express = require('express');
var categoryController = require('../controllers/category.controller');
var mdAuth = require('../middleware/authorizaded');

var api = express.Router();

//FUNCIONES DE ADMIN ----------------------> CRUD DE CATEGORIA
api.post('/createCategory/:id', [mdAuth.ensureAuth, mdAuth.validRol], categoryController.createCategory);
api.get('/getCategorys/:id', [mdAuth.ensureAuth, mdAuth.validRol], categoryController.getCategory);
api.put('/:id/updateCategory/:idC', [mdAuth.ensureAuth, mdAuth.validRol], categoryController.updateCategory);
api.post('/:id/setProductInCategory/:idC', [mdAuth.ensureAuth, mdAuth.validRol], categoryController.setProduct);
api.delete('/:id/deleteCategory/:idC', [mdAuth.ensureAuth, mdAuth.validRol], categoryController.deleteCategory);
//##########################################################################################################

module.exports = api;