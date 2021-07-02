'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var repositoryShoppingCartSchema = Schema({
    nameProduct: String,
    stockShopping: Number,
    price: Number,
    propietario: String
})

module.exports = mongoose.model('repositoryShoppingCart', repositoryShoppingCartSchema);