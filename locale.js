const i18n = require('i18n');

i18n.configure({
    locales: ['en', 'pl'],
    defaultLocale: process.env.LANGUAGE || 'en',
    directory: `${__dirname}/locales`,
});

module.exports = i18n;
