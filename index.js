const express = require('express');
const bodyParser = require('body-parser');
const main = require('./main');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/run-test', async (req, res) => {
    const { links, extraParameter } = req.body;
    try {
        await main(links, extraParameter);
        res.send('Test completed successfully.');
    } catch (error) {
        res.status(500).send('Error running test: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});