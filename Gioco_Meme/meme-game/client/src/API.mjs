
const url = 'http://localhost:3001/api';

const logIn = async (credentials) => {
    const response = await fetch(url + '/sessions', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (response.ok) {
        const user = await response.json();
        return user;
    }
    else { const err = await response.json(); throw err.message; }
}

const getUserInfo = async () => {
    const response = await fetch(url + '/sessions/current', {
        credentials: 'include',
    });
    const user = await response.json();
    if (response.ok) {
        return user;
    }
    else { throw user; }
};

const logOut = async () => {
    const response = await fetch(url + '/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok) return null;
}

const getImage = async (memeId) => {
    const response = await fetch(`${url}/memes/${memeId}`);
    if (response.ok) {
        const memeJson = await response.json();
        return memeJson;
    }
    else throw new Error('Internal Server Error');
}

const getImages = async () => {
    const response = await fetch(`${url}/memes`);
    if (response.ok) {
        const memeJson = await response.json();
        return memeJson;
    }
    else throw new Error('Internal Server Error');
}

const getWrongCaptions = async () => {
    const response = await fetch(url + '/captions');
    if (response.ok) {
        const captionsJson = await response.json();
        return captionsJson;
    }
    else throw new Error('Internal Server Error');
}

const getRightCaptions = async (id) => {
    const response = await fetch(`${url}/memes/${id}/captions`);
    if (response.ok) {
        const captionsJson = await response.json();
        return captionsJson;
    }
    else throw new Error('Internal Server Error');
}

const getGames = async () => {
    const response = await fetch(`${url}/games`, {
        credentials: 'include'
    });
    if (response.ok) {
        const gamesJson = await response.json();
        return gamesJson;
    }
    else throw new Error('Internal Server Error');
}

const getRounds = async (id) => {
    const response = await fetch(`${url}/games/${id}/rounds`);
    if (response.ok) {
        const roundsJson = await response.json();
        return roundsJson;
    }
    else throw new Error('Internal Server Error');
}

const addGame = async (game) => {
    const response = await fetch(`${url}/games`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({
            date: game.date,
            score: game.score
        }),
        credentials: 'include'
    });
    if (response.ok) {
        const gameId = await response.json();
        return gameId;
    }
    else throw new Error('Internal Server Error');
    
}

const addRounds = async (rounds, gameId) => {
    try {
        const response = await fetch(`${url}/games/${gameId}/rounds`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(rounds),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Errore durante l\'invio dei round');
        }

        const lastRoundId = await response.json();
        return lastRoundId;
    } catch (error) {
        console.error('Errore durante l\'invio dei round:', error);
        throw error; 
    }
};


//async function <function name> che chiama la specifica API del server
    //controllo della risposta con fetch


const API = { logIn, getUserInfo, logOut, getImage, getImages, getWrongCaptions, getRightCaptions, getGames, getRounds, 
    addGame, addRounds };
export default API; 
