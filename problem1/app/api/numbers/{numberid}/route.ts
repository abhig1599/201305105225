const express = require('express');
const axios = require('axios');
const app = express();

let numbers = [];
const windowSize = 10;

app.use(async (req, res, next) => {
  const numberId = req.params.numberid;
  const startTime = Date.now();

  // Check if numberId is valid
  if (!['p', 'f', 'e', 'F'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid numberId' });
  }

  try {
    const response = await axios.get(`http://localhost:3000/numbers/${numberId}`);
    const responseTime = Date.now() - startTime;

    if (responseTime > 500) {
      return next();
    }

    const number = response.data;

    if (!numbers.includes(number)) {
      numbers.push(number);
    }

    if (numbers.length > windowSize) {
      numbers.shift();
    }

    req.numbers = numbers;
    req.number = number;
    req.avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;

    next();
  } catch (error) {
    next();
  }
});

app.get('/numbers/:numberid', (req, res) => {
  res.json({
    windowPrevState: req.numbers.slice(0, -1),
    windowCurrState: req.numbers,
    numbers: req.number,
    avg: req.avg.toFixed(2),
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));