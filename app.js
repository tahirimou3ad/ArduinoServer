const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const router = require('./controllers/router');
const bodyParser = require('body-parser')
const Notification = require('./models/notification')

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

const SerialPort = require('serialport');
const ReadLine = SerialPort.parsers.Readline;

const port = new SerialPort("COM4", {
  baudRate: 9600
});
const parser = port.pipe(new ReadLine({ delimiter: '\r\n' }));

parser.on('open', function () {
  console.log('connection is opened');
});

parser.on('data', async (data) => { 
  if (data){
    const temperature = parseInt(data);
    console.log(temperature);
    const notification = new Notification({notificationType: "temperature", temperature})
    
    try {
        await notification.save();

    } catch (e) {
      console.log(e)
    }
  }
});
 
parser.on('error', (err) => console.log(err));
port.on('error', (err) => console.log(err));