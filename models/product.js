const express = require('express');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nom: {type: String, required: true},
    dateExp: {type: Date, required: true}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;