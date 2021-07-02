'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shoppingCartSchema = Schema({
    nameProduct: String,
    stockShopping: Number,
    price: Number,
    propietario: String
})

module.exports = mongoose.model('shoppingCart', shoppingCartSchema);