import sqlite from "sqlite3";
import crypto from 'crypto';

//apertura del db
const db = new sqlite.Database("esame_meme.sqlite", err => { if (err) throw err; });

const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Utenti WHERE email = ?";
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = {id: row.id, name: row.nome, username: row.email};
        
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Utenti WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve({error: 'Utente non trovato!'}); 
      }
      else {
        const user = {id: row.id, username: row.email, name: row.nome};
        resolve(user);
      }
    });
  });
};

const userDao = { getUser, getUserById };
export default userDao;