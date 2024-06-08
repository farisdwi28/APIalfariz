const connection = require("../config/database");

exports.queryPromise = async (query, params) => {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, result) => {
            if(err) {
                return reject(err);
            }
            resolve(result);
        })
    })
};