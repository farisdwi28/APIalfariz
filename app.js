require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const mediaPropertyRoutes = require('./routes/mediaPropertyRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static('public')); 

app.use('/users', userRoutes);
app.use('/photos', photoRoutes);
app.use('/property', propertyRoutes);
app.use('/media', mediaPropertyRoutes);

app.get('/', (req, res) => {
    res.render('form');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
