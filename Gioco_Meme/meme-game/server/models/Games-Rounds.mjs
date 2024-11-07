import dayjs from "dayjs";  

function Rounds(id, meme, didas, gameId, points) {
    this.id = id;
    this.meme = meme;
    this.didas = didas;
    this.gameId = gameId;
    this.points = points;

}

function Games(id, date, score) {
    this.id = id;
    this.date = date.format("YYYY-MM-DD");
    this.score = score;

}

export { Games, Rounds };