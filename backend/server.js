const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('CareerAgent Backend is running!');
});

app.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
});
