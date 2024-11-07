import dayjs from "dayjs";
import sqlite from "sqlite3";
import { Games, Rounds } from "../models/Games-Rounds.mjs";

// apertura del db
const db = new sqlite.Database("esame_meme.sqlite", err => { if (err) throw err; });

// recupera tutte le partite dato l'id di un utente
const listAllGames = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id, data, punteggio FROM Partite WHERE idUtente = ?";
        db.all(sql, [id], (err, rows) => {
            if (err) reject(err);
            else if (rows === undefined) resolve(rows);
            else {
                const games = rows.map(e => new Games(e.id, dayjs(e.date), e.punteggio));
                resolve(games);
            }
        });
    });
}

const listRounds = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Round WHERE idPartita = ?";
        db.all(sql, [id], (err, rows) => {
            if (err) reject(err);
            else {
                const rounds = rows.map(e => new Rounds(e.id, e.Meme, e.Didascalia, e.idPartita, e.isCorrect*5));
                resolve(rounds);
            }
        });
    })
}

const getOneMeme = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Meme WHERE id=?";
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve({error: "Errore nella selezione dell'immagine meme"});
            else resolve({id: row.id, filename: row.fileName});
        });
    });
}

const getMemes = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Meme ORDER BY RANDOM() LIMIT 3";
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else if (rows === undefined) resolve({error: "Errore nella selezione delle immagini meme"});
            else {
                const memes = rows.map(e => ({id: e.id, filename: e.fileName}));
                resolve(memes);
            }
        });
    });
}

const getWrongDidas = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT testo FROM Didascalie WHERE idMeme is NULL ORDER BY RANDOM() LIMIT 5";
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else {
                const captions = rows.map(e => ({text: e.testo, isCorrect: false}));
                resolve(captions);
            }
        });
    });
}

const getRightDidas = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT testo FROM Didascalie WHERE idMeme=? ORDER BY RANDOM() LIMIT 2";
        db.all(sql, [id], (err, rows) => {
            if (err) reject(err);
            else {
                const captions = rows.map(e => ({text: e.testo, isCorrect: true}));
                resolve(captions);
            }
        });
    });
}

const addGame = (game, userId) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO Partite (idUtente, data, punteggio) VALUES (?, DATE(?), ?)";
        db.run(sql, [userId, game.date, game.score], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

const addRounds = (rounds, gameId) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO Round (Meme, Didascalia, idPartita, isCorrect) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)";
        const values = [
            rounds[0].meme, rounds[0].text, gameId, rounds[0].isCorrect,
            rounds[1].meme, rounds[1].text, gameId, rounds[1].isCorrect,
            rounds[2].meme, rounds[2].text, gameId, rounds[2].isCorrect,
        ];
        db.run(sql, values, function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

const dao = { listAllGames, listRounds, getOneMeme, getMemes, getWrongDidas, getRightDidas, addGame, addRounds};
export default dao;
