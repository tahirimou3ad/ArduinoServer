const express = require('express');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nom: {type: String, required: true},
    dateExp: {type: String, required: true}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;