'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = Schema({
    nameProduct: String,
    stock: Number,
    price: Number,
    totalSale: Number
})

module.exports = mongoose.model('product', productSchema);