require('dotenv').config();

module.exports = {
    development: {
        dialec: 'postgres',
        url: process.env.DATABASE_URL
    },
    test:{
        url: process.env.DATABASE_URL?.replace(/_development/, '_test')
    }
}