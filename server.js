const app = require('./app');
const config = require('./config/config.json')[process.env.NODE_ENV || 'development'];

app.listen(config.PORT, () => {
    console.log(`App is on ${config.PORT}`);
});
