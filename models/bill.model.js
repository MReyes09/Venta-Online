'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var billSchema = Schema({
    date: String,
    total: Number,
    stockTotal: Number,
    propietario: String,
    repositoryShoppingCarts:[{ type: Schema.ObjectId, ref:'repositoryShoppingCart'}]
});

module.exports = mongoose.model('bill', billSchema);