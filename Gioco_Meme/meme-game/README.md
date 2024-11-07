[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/J0Dv0VMM)
# Exam #1: "Gioco dei Meme"
## Student: s319572 DI PAOLO DOMENICO 

## React Client Application Routes

- Route `/`: pagina di apertura dell'applicazione, mostra il form per effettuare il login o entrare come ospite (utente non registrato)
- Route `/home`: pagina principale per la logica dell'applicazione, mostra il pulsante per cominciare una nuova partita e altre         informazioni come lo storico delle partite per l'utente che ha effettuato l'accesso
- Route `/home/game`: pagina dedicata allo svolgimento della partita con i vari round (3 nel caso di utente registrato, 1 nel caso di utente ospite) con le varie informazioni di riepilogo alla fine di ogni round e al concludersi della partita
- Rout `/*`: per le pagine che non esistono (page not found)

## API Server

### Autenticazione

- POST `/api/session`: autentica l'utente che prova ad effettuare il login
  - request body: credenziali dell'utente che prova ad autenticarsi

``` JSON
{
    "username": "username",
    "password": "password"
}
```
  - response: `201 OK` (success)
  - response body: authenticated user
``` JSON
{
    "id": 1,
    "username": "m.r@alice.it", 
    "name": "mario rossi"
}
```
  - error responses: `401 Unauthorized User` (login fallito)

- GET `/api/session/current`: controlla se l'utente attuale è loggato e recupera i suoi dati
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: authenticated user

``` JSON
{
    "id": 1,
    "username": "m.r@alice.it", 
    "name": "mario rossi"
}
```
  - error responses: `500 Unauthorized User` (utente non loggato)

- DELETE `/api/session/current`: effettua il logout dell'utente
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: _nessuno_
  - error responses: `500 Internal Server Error` (errore generico)


### Altre

- GET `/api/memes` : Non autenticata, ritorna una lista di tre immagini di meme 
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: 

``` JSON
[
  {
    "id": 9,
    "imageUrl": "http://localhost:3001/Spiderman_nice.jpg"
  },
  {
    "id": 4,
    "imageUrl": "http://localhost:3001/Kermit.jpg"
  },
  {
    "id": 3,
    "imageUrl": "http://localhost:3001/Fry_Futurama.jpg"
  }
]
```
  - error responses: `500 Internal Server Error` (errore generico), `404 Not Found` (non disponibile)

- GET `/api/memes/:memeId` : non autenticata, ritorna il meme corrispondente all'id
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: 

``` JSON
  {
    "id": 9,
    "imageUrl": "http://localhost:3001/Spiderman_nice.jpg"
  },
```
  - error responses: `500 Internal Server Error` (errore generico), `404 Not Found` (non disponibile) 

- GET `/api/captions` : Non autenticata, ritorna una lista di 5 didascalie che sono sbagliate per un meme (scelte tra quelle che non si adattano a nessun meme) 
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: 

``` JSON
[
  {
    "text": "Aspettando l'ispirazione per una didascalia che fa perdere",
    "isCorrect": false
  },
  {
    "text": "Didascalia di prova",
    "isCorrect": false
  },
  ...
]
```
  - error responses: `500 Internal Server Error` (errore generico)

- GET `/api/memes/:id/captions` : Non autenticata, ritorna una lista di 2 didascalie che sono giuste per un meme 
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: 

``` JSON
[
  {
    "text": "Quando dopo mesi passati da fuori sede torni a casa e mamma non ti fa trovare quattro lasagne e due teglie di cannelloni",
    "isCorrect": true
  },
  {
    "text": "Quando ti dicono che in realtà mangiare tutti i weekend da McDonald's non è salutare",
    "isCorrect": true
  }
]
```
  - error responses: `500 Internal Server Error` (errore generico)

- GET `/api/games` : Autenticata, ritorna la lista di tutte le partite disputate dall'utente
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: 

``` JSON
[
  {
    "id": 1,
    "data": "2024-06-27", 
    "score": 10
  },
  {
    "id": 2,
    "date": "2024-06-27", 
    "score": 15
  },
  ...
]
```
  - error responses: `500 Internal Server Error` (errore generico), `401 Unauthorized User` (utente non autenticato)

- POST `/api/games` : Autenticata, aggiunge una nuova partita alla lista di partite effettuate dall'utente
  - request body: (id della partita ignorato e generato dal db)

``` JSON
{
    "date": "2024-06-27",
    "score": 5
}
```
  - response: `201 Created` (partita aggiunta)
  - response body: l'id della nuova partita inserita nel database
  - error responses: `401 Unauthorized User` (utente non autenticato), `503 Service Unavailable` (impossibile aggiungere nuova partita), `422 Bad request` (validazioni non riuscite)

- GET `/api/games/:id/rounds` : Non autenticata, ritorna la lista dei 3 round che compongono una determinata partita
  - request body: _nessuno_
  - response: `200 OK` (success)
  - Response body: 

``` JSON
[
  {
    "id": 1,
    "meme": "Fry_Futurama.jpg",
    "didas": "Ha smesso di rispondermi o ci sta mettendendo troppo tempo a leggere?",
    "gameId": 1,
    "points": 5
  },
  {
    "id": 2,
    "meme": "Spiderman_letto.jpg",
    "didas": "Quando realizzi che hai dimenticato qualcosa",
    "gameId": 1,
    "points": 0
  },
  {
    "id": 3,
    "meme": "Angry_cat.jpg",
    "didas": "Quando dopo mesi passati da fuori sede torni a casa e mamma non ti fa trovare quattro lasagne e due teglie di cannelloni",
    "gameId": 1,
    "points": 5
  }
]
```
  - error responses: `500 Internal Server Error` (errore generico)

- POST `/api/games/:id/rounds` : Autenticata, i round della partita effettuata dall'utente alla partita corrispondente
  - request body: (id della partita ignorato e generato dal db)

``` JSON
[
  {
    "meme": "Spiderman_letto.jpg",
    "text": "Quando realizzi che hai dimenticato qualcosa",
    "isCorrect": false
  },
  {
    "meme": "Angry_cat.jpg",
    "didas": "Didascalia di prova",
    "points": false
  },
  ...
]
```
  - response: `200 OK` (round aggiunti alla partita)
  - response body: gli id dei round inseriti nel database
  - error responses: `401 Unauthorized User` (utente non autenticato), `503 Service Unavailable` (impossibile aggiungere nuovi round)

## Database Tables

- Tabella `Utenti` - contiene i dati relativi agli utenti. Contiene id, nome, email, hash, salt
- Tabella `Partite` - contiene i dati relativi alle partite disputate dagli utenti. Contiene id, idUtente, data, punteggio
- Tabella `Round` - contiene i dati relativi ai round delle partite. Contiene id, Meme, Didascalia, IdPartita, isCorrect
- Tabella `Meme` - contiene i dati relativi ai meme. Contiene id, fileName
- Tabella `Didascalie` - contiene i dati relativi alle didascalie. Contiene id, idMeme, testo

## Main React Components

- `LoginForm` (in `Login.jsx`): componente con lo scopo di realizzaree l'accesso dell'utente all'applicazione nelle due diverse modalità: utente registrato, utente ospite
- `Home` (in `Home.jsx`): componente principale per la pagina di apertura dell'applicazione dopo aver effettuato il login. Mostra lo storico di partite dell'utente oltre ad una serie di informazioni meno importanti (regole del gioco, come giocare, ecc.). Consente l'avvio di una nuova partita
- `GameList` (in `Home.jsx`): mostra lo storico delle partite effettuate dell'utente, se presenti (non mostrato in caso di utente ospite)
- `MyNavbar` (in `MyNavbar.jsx`): barra di navigazione comune a tutte le pagine che permette di navigare l'applicazione
- `GamPage` (in `GameComponents.jsx`): componente principale per l'applicazione e che contiene tutti gli stati e le funzioni necessarie allo svolgimento di una partita e dei vari round di cui si compone
- `Game` (in `GameComponents.jsx`): componente utilizzato all'avvio della nuova partita e dunque usato per ospitare, ad ogni round, l'immagine meme e le didascalie che l'utente può selezionare (organizzate in delle Card bootstrap)
- `GameRecap` (in `GameComponents.jsx`): componente utilizzato nelle fasi di riepilogo dei vari round di gioco e utilizzato nell recap finale prima che la partita venga salvata nello storico dell'utente (se non ospite)

## Screenshot

![Screenshot](./Screenshot/Screenshot1.png)

![Screenshot](./Screenshot/Screenshot2.png)

## Users Credentials

- Mario Rossi: m.r@alice.it, 123456 
- Utente Storico: utente.storico@email.com, aaaaaa (utente con storico di partite, usato come default login)
