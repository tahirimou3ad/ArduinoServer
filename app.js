const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const router = require('./controllers/router');

app.use('/', router);
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`The server is now listening on port ${PORT} ... `);
});
