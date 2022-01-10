const express = require('express');
const mongoose = require('mongoose');
const Product = require('./product');

// The base schema for Notification
const notificationSchema = new mongoose.Schema({
    notificationType: {
        type: String,
        enum : ['temperature','expiration'],
    },

    // We can access the expiration date from product.dateExp
    product: {type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Product'},

    // Now date: used when notificationType == "temperature"
    date: { type: Date, required: true, default: Date.now },
    temperature: {type: Number, required: false}

});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;