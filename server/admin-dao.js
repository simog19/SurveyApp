'use strict';
/* Data Access Object (DAO) module for accessing admins */

const db = require('./db');
const bcrypt = require('bcrypt');

exports.getAdminById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM admin WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined)
                resolve({error: 'Admin not found.'});
            else {

                const admin = {id: row.id, email: row.email, username: row.username}
                resolve(admin);
            }
        });
    });
};

exports.getAdmin = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM admin WHERE email = ?';
        db.get(sql, [username], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined) {
                resolve(false);
            } else {
                const admin = {id: row.id, email: row.email, username: row.username};

                // check the hashes with an async call, given that the operation may be CPU-intensive (and we don't want to block the server)
                bcrypt.compare(password, row.hash).then(result => {
                    if (result)
                        resolve(admin);
                    else
                        resolve(false);
                });
            }
        });
    });
};