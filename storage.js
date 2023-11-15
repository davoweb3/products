const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3500;
const httpServer = http.createServer(app);

app.use(bodyParser.json());
app.use(cors());

const scannedData = [];
const otherScannedData = [];

function arraysAreEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
      return false;
    }
  }

  return true;
}

const wss = new WebSocket.Server({ server: httpServer });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});

app.post('/scan', (req, res) => {
  const { cart } = req.body;
  if (cart && Array.isArray(cart)) {
    cart.forEach(item => {
      scannedData.push(item);
      console.log(`Received and stored scanned data: ${JSON.stringify(item)}`);
    });

    if (arraysAreEqual(scannedData, otherScannedData)) {
      console.log('Both scannedData and otherScannedData match.');
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('Both scannedData and otherScannedData match.');
        }
      });
    }

    res.status(200).json({ message: 'Data received and stored in scannedData.' });
  } else {
    res.status(400).json({ message: 'Invalid data received. Expecting an array in the format { "cart": [...] }' });
  }
});

app.post('/scan2', (req, res) => {
  const { cart } = req.body;
  if (cart && Array.isArray(cart)) {
    cart.forEach(item => {
      otherScannedData.push(item);
      console.log(`Received and stored scanned data in otherScannedData: ${JSON.stringify(item)}`);
    });

    if (arraysAreEqual(scannedData, otherScannedData)) {
      console.log('Both scannedData and otherScannedData match.');
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('Both scannedData and otherScannedData match.');
        }
      });
    }

    res.status(200).json({ message: 'Data received and stored in otherScannedData.' });
  } else {
    res.status(400).json({ message: 'Invalid data received. Expecting an array in the format { "cart": [...] }' });
  }
});

app.get('/scanned-data-count-multiplied', (req, res) => {
  const dataCount = scannedData.length - 1;
  const multipliedCount = dataCount * 5;
  res.status(200).json({ multipliedCount });
});

app.get('/scanned-data', (req, res) => {
  res.status(200).json(scannedData);
});

app.get('/scanned-data2', (req, res) => {
  res.status(200).json(otherScannedData);
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
