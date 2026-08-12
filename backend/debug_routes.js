const express = require('express');
const app = express();
const router = express.Router();

router.get('/dashboard', (req, res) => res.send('DASHBOARD'));

app.use('/api/host', router);

app.get('/api/test', (req, res) => res.send('TEST'));

app.use((req, res) => res.status(404).send('404 Not Found'));

app.listen(5001, () => {
  console.log('Test server on 5001');
});
