// imports
import express from 'express';
import { check, validationResult } from "express-validator";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import morgan from "morgan";
import cors from "cors";
import dao from "./dao/dao.mjs";
import userDao from "./dao/user-dao.mjs";

// init express
const app = new express();
const port = 3001;

// setup express app-middlewares
app.use(express.json());
app.use(express.static('meme_img'));
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Passport: set up
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password);
  if(!user)
    return cb(null, false, 'Password e/o username errati');
    
  return cb(null, user);
}));

//passo alla sessione solo lo user id per mantenere la sessione molto piccola
passport.serializeUser(function (user, cb) {
  cb(null, user.id); 
});

passport.deserializeUser(function (id, cb) {
  userDao.getUserById(id)
    .then(user => {
      cb(null, user);
    }).catch(err => {
      cb(err, null);
    });
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Non autenticato'});
}

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

//SERVER ROUTES

//Passport Session API
//POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        return res.status(401).send(info);
      }
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});

//GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Utente non autenticato!'});
});

//DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => { res.end(); } );
});

//GET /api/memes/:memeId
app.get('/api/memes/:memeId', async (req, res) => {
  try {
    const memeImg = await dao.getOneMeme(req.params.memeId);
    if (memeImg.error) res.status(404).json(memeImg);
    else {
      const data = {
        id: memeImg.id,
        imageUrl: `http://localhost:${port}/` + memeImg.filename
      };
      res.json(data);
    }
  } catch {
    res.status(500).end();
  }
});

//GET /api/memes/
app.get('/api/memes', async (req, res) => {
  try {
    const memeImgs = await dao.getMemes();
    if (!memeImgs || memeImgs.length === 0) {
      res.status(404).json({ error: "No memes found" });
    } 
    else {
        const data = memeImgs.map(meme => ({
            id: meme.id,
            imageUrl: `http://localhost:${port}/` + meme.filename
        }));
        res.json(data);
      }
  } catch (error) {
    res.status(500).end();
  }

});

//GET /api/captions
app.get('/api/captions', async (req, res) => {
  try {
    const captions = await dao.getWrongDidas();
    res.json(captions);
  } catch {
    res.status(500).end();
  }
});

//GET /api/memes/:id/captions
app.get('/api/memes/:id/captions', async (req, res) => {
  try {
    const captions = await dao.getRightDidas(req.params.id);
    res.json(captions);
  } catch {
    res.status(500).end();
  }
});

//GET /api/games
app.get('/api/games', isLoggedIn, async (req, res) => {
  try {
    const games = await dao.listAllGames(req.user.id);
    res.json(games);
  } catch {
    res.status(500).end();
  }
});

//POST /api/games
app.post('/api/games', isLoggedIn, [
  check('date').isDate({format: 'YYYY-MM-DD', strictMode: true}),
  check('score').isNumeric()
], async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).json({errors: error.array()});
  }
  const newGame = req.body;
  const userId = req.user.id;
  try {
    const gameId = await dao.addGame(newGame, userId);
    res.status(201).json(gameId);
  } catch (err) {
    res.status(503).json({error: 'Impossibile aggiungere una nuova partita'});
  }
});

//GET /api/games/:id/rounds
app.get('/api/games/:id/rounds', async (req, res) => {
  try {
    const rounds = await dao.listRounds(req.params.id);
    res.json(rounds);
  } catch {
    res.status(500).end();
  }
});

//POST /api/games/:id/rounds
app.post('/api/games/:id/rounds', isLoggedIn, async (req, res) => {

  const newRounds = req.body;
  const gameId = req.params.id;
  try {
    const lastRoundId = await dao.addRounds(newRounds, gameId);
    res.json(lastRoundId);
    res.status(200).end();
  } catch (err) {
    console.log("Errore", err);
    res.status(503).json({error: `Impossibile aggiungere round alla partita ${gameId}`});
  }
});

// activate the server
app.listen(port, () => {
  console.log(`API Server listening at http://localhost:${port}`);
});