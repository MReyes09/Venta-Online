'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    rol: String,
    totalShoppingCart: Number,
    totaldestock: Number,
    bills:[{ type: Schema.ObjectId, ref:'bill'}],
    shoppingCarts:[{ type: Schema.ObjectId, ref:'shoppingCart'}]
})

module.exports = mongoose.model('user', userSchema);