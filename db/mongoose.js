const mongoose = require('mongoose')

// Connection a la base de donnée hoste dur mongodbatlas (Mouad, password:azerty)
const serverURI = 'mongodb+srv://Mouad:azerty@cluster0.p0sm0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(serverURI);
