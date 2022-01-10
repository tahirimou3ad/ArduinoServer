const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
const router = require('./controllers/router');
const bodyParser = require('body-parser')
const Notification = require('./models/notification')

require('./db/mongoose');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(function (req, res, next) {
  /*var err = new Error('Not Found');
   err.status = 404;
   next(err);*/

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // Pass to next layer of middleware
  next();
});

const io = require('socket.io')(3031, {
  cors: {
      origin: 'http://localhost:3000',
  }
})

app.io = io;

io.on("connection", socket => {
  //SerialPort
  const id = 12;
  socket.emit("send-id", id);
})

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
    const notification = new Notification({notificationType: "temperature", temperature});
    const description = `Temperature actuelle: ${temperature} `
    req.app.io.emit('popup', {title: "Porte Ouverte !", description});
    
    // Send message to the UI
    try {
        await notification.save();

    } catch (e) {
      console.log(e)
    }
  }
});
 
parser.on('error', (err) => console.log(err));
port.on('error', (err) => console.log(err));