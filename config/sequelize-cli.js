require('dotenv').config();

module.exports = {
    dialec: 'postgres',
    url: process.env.DATABASE_URL
}