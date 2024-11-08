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

//Other Server Routes for APIs
//<method> /api/<url>

// activate the server
app.listen(port, () => {
    console.log(`API Server listening at http://localhost:${port}`);
  });
