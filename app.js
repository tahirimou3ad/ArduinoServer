const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const router = require('./controllers/router');
const bodyParser = require('body-parser')

require('./db/mongoose');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use('/', router);
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`The server is now listening on port ${PORT} ... `);
});
