const express = require('express');
const mongoose = require('mongoose');

// Base schema for Product
const productSchema = new mongoose.Schema({
    nom: {type: String, required: true},

    // date d'expiration
    dateExp: {type: Date, required: true}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;