import { Container, Row, Image, Card, Button, Alert, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MyNavbar from "./MyNavbar";
import API from "../API.mjs";
import dayjs from "dayjs";



function GamePage(props) {
    const [loading, setLoading] = useState(true);
    //stati usati per mostrare immagini e didascalie correnti nella pagina 
    const [currentImg, setCurrentImg] = useState(null);
    const [currentCaps, setCurrentCaps] = useState([]);

    //stati mantenuti per caricamento dei dati nello storico delle partite dell'utente a fine partita
    const [images, setImages] = useState([]);
    const [captions, setCaptions] = useState([]);

    //stati per la gestione del round attuale, della fine del rounde e del numero di rounde totali
    const [currentRound, setCurrentRound] = useState(1);
    const [endRound, setEndRound] = useState(false);
    const [showRecap, setShowRecap] = useState(false);
    const [showEndGame, setShowEndGame] = useState(false);

    //stati per la gestione della partita e dei round
    const [game, setGame] = useState({});
    const [points, setPoints] = useState(0);
    const [rounds, setRounds] = useState([]);

    const location = useLocation();
    const roundNum = location.state;
    const navigate = useNavigate();

    //funzione per il caricamento della nuova partita completata nel db
    const updateGameRecord = async (game, rounds) => {
        try {
            const gameId = await API.addGame(game);
            const resultId = await API.addRounds(rounds, gameId);
        } catch (error) {
            console.log(error);
        }
    }

    //funzione usata per randomizzare l'ordine degli elementi dell'array contenente le didascalie 
    const randomizeCurrentCaptions = (arrayOfCaps) => {
        const randomCaps = [...arrayOfCaps];
        for (let i = randomCaps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [randomCaps[i], randomCaps[j]] = [randomCaps[j], randomCaps[i]];
        }
        return randomCaps;
    };

    const showRec = () => {
        setShowRecap(true);
    }

    const handleSubmitChoice = (capText, capIsCorrect) => {
        //fermo il timer
        setIsActive(false);
        //fine del round e disabilito i bottoni
        setEndRound(true);
        // aggiungo la caption alla lista dopo che l'utente l'ha scelta
        const caption = {text: capText, isCorrect: capIsCorrect};
        setCaptions(capList => capList.concat(caption));
        if (caption.isCorrect) {
            setPoints(p => p + 5);
        }
        
    }

    const handleSubmitRound = () => {
        //round finito + mostro recap
        setEndRound(false);
        setShowRecap(false);
        setLoading(true);
        //aggiornamento round
        setCurrentRound(cr => cr + 1);
    }

    const handleSubmitGame = () => {
        if (roundNum == 1) {
            navigate('/home');
        } 
        else if (roundNum == currentRound) {
            //aggiorno lo stato "game"
            const today = dayjs();
            const gameData = {date: today.format("YYYY-MM-DD"), score: points};
            setGame(gameData);
            //aggiorno lo stato relativo ai round
            if (images.length === captions.length) {
                const allRounds = images.map((el, index) => {
                    return {
                        meme: el.imageUrl.split('/').pop(),
                        text: captions[index].text,
                        isCorrect: captions[index].isCorrect
                    };
                });
                setRounds(allRounds);
                setShowEndGame(true);
            } else {
                console.log("Errore durante la registrazione del round");
            }
        }
    }

    const concludeGame = () => {
        setShowEndGame(false);
        updateGameRecord(game, rounds);
        navigate('/home');
    }

    //stati e funzioni per la gestione del Timer
    const [seconds, setSeconds] = useState(30);
    const [isActive, setIsActive] = useState(true);

    const startTimer = () => {
        setSeconds(30);
        setIsActive(true);
    }

    useEffect(() => {    
        const setUpRound = async () => {
            try {
                if (!props.logged) {
                    //se gioco come ospite genero localmente un numeroo random per selezionare l'immagine
                    const imgId = Math.floor(Math.random()*10)+1;
                    const img = await API.getImage(imgId);
                    setImages([img]);
                }
                else {
                    const imgs = await API.getImages();
                    setImages(imgs);
                }
            } catch (err) {
                console.log(err);
            }
        };
        setUpRound();   
    }, []);

    useEffect(() => {
        const getRoundsElements = async () => {
            if (loading) {
                try {
                    const wrongCaps = await API.getWrongCaptions();
                    if (images.length > 0) {
                        const meme = images[currentRound - 1];
                        setCurrentImg(meme);
                        const rightCaps = await API.getRightCaptions(meme.id);  
                        setCurrentCaps(randomizeCurrentCaptions([...wrongCaps, ...rightCaps]));
                        setLoading(false);
                        startTimer();
                    } 
                } catch (err) {
                    console.log(err);
                }
            }    
        };
        getRoundsElements();
    }, [currentRound, images]);

    useEffect(() => {
        let intervalId;

        if (isActive && seconds > 0) {
            intervalId = setInterval(() => {
                setSeconds(s => s - 1);
            }, 1000);
        }
        else if (seconds === 0 && isActive) { 
            //il timer ha raggiunto lo zero
            clearInterval(intervalId);
            //il rounde è finito
            setEndRound(true); 
            handleSubmitChoice("Nessun abbinamento", false);
        }

        return () => clearInterval(intervalId);
    }, [isActive, seconds]);

    return (
        <>
            <MyNavbar logged={props.logged} handleLogout={props.handleLogout} />
            {loading && <Spinner animation="border"/>}
            <Container className="mt-4">
                {!showRecap ? 
                <Game 
                    seconds={seconds}
                    isActive={isActive}
                    currentImg={currentImg}
                    currentCaps={currentCaps}
                    endRound={endRound}
                    showRecap={showRec}
                    handleSubmitChoice={handleSubmitChoice}
                    isLoading={loading}
                /> : 
                <GameRecap 
                    logged={props.logged} 
                    round={currentRound} 
                    image={images[currentRound-1]}
                    images={images}
                    captions={captions}
                    points={points}
                    cap={captions[currentRound-1]} 
                    handleSubmitRound={handleSubmitRound}
                    handleSubmitGame={handleSubmitGame}
                    concludeGame={concludeGame}
                    showEndGame={showEndGame}
                />
                } 
            </Container>
        </>
    )
}

function Game(props) {
    return (
        <>
            <CountdownTimer seconds={props.seconds} isActive={props.isActive} />
            <Row className="justify-content-center mt-4">
                {!props.isLoading ? (
                    <Image style={{ width: '250px', height: '250px' }} src={props.currentImg.imageUrl} rounded  />
                ) : (
                    <p>Caricamento...</p>
                )}
            </Row>
            <Row className="justify-content-center mt-4">
                {!props.isLoading ? (
                    props.currentCaps.map((el, index) => 
                    <Captions 
                        key={index} 
                        text={el.text} 
                        isCorrect={el.isCorrect}
                        handleSubmitChoice={() => props.handleSubmitChoice(el.text, el.isCorrect)}
                        endRound={props.endRound}
                    />)
                ) : (
                    <p>Didascalia non disponibile</p>
                )}
            </Row>
            {props.endRound && ( 
                <Row className="justify-content-center mt-4 text-center">
                    <Button variant="primary" onClick={props.showRecap} className="col-auto">Avanti al recap</Button>
                </Row>  
            )}
        </>
    )
}

function Captions(props) {
    return(
        <>
            <Card className="mt-4 text-center" style={{ width: '18rem', margin: '10px' }}>
                <Card.Body>
                    <Card.Title>
                    {props.endRound && (props.isCorrect 
                        ? <Alert variant='success'>Didascalia giusta!</Alert> 
                        : <Alert variant='danger'>Didascalia errata!</Alert>) 
                    }
                    </Card.Title>
                    <Card.Text>{props.text}</Card.Text>
                    <Button 
                        disabled={props.endRound} 
                        variant="primary" 
                        onClick={() => props.handleSubmitChoice(props.text, props.isCorrect)} 
                        className="col-auto"> Scegli </Button>      
                </Card.Body>
            </Card>
        </>
    )
}

function CountdownTimer(props) {
    return (
        <h3 className="text-center mt-4">
            {props.isActive 
                ? (props.seconds ? `Tempo restante: ${props.seconds} sec` : <Alert variant="danger">Tempo scaduto!</Alert>) 
                : `Tempo restante: ${props.seconds} sec`
            }    
        </h3>
    )
}

function GameRecap(props) {
    return (
        <Row className="justify-content-center mt-4 text-center">
        {props.showEndGame ? 
            <>
                {props.images.map((el, index) => (
                    <Associations key={index} source={el.imageUrl} cap={props.captions[index].text}/>
                ))}
                <h4 className="mt-4">Punteggio totale ottenuto: {props.points}</h4>
                <Button className="col-auto" variant="primary" onClick={() => props.concludeGame()}>Salva partita</Button>
            </>
            : 
            <>
                <Row className="justify-content-center">
                    <Image style={{ width: '250px', height: '250px' }} src={props.image.imageUrl} rounded/>
                </Row>
                {(props.cap.text==='Nessun abbinamento') ? <h4 className="mt-4">Tempo scaduto! Per questo round non hai scelto nessuna didscalia</h4>
                : 
                    <>
                        <Row className="justify-content-center">
                            <Card style={{ width: '18rem', margin: '10px' }}>
                                <Card.Body>
                                    <Card.Text>{props.cap.text}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Row>
                        <h3 className="mt-4">Punteggio: {(props.cap.isCorrect) ? 5 : 0}</h3>
                    </>
                }
                <Row className="justify-content-center mt-4 text-center">
                    {(props.logged && props.round!=3) 
                        ? <Button variant="primary" onClick={() => props.handleSubmitRound()} className="col-auto">Prossimo Round</Button>
                        : <Button variant="primary" onClick={() => props.handleSubmitGame()} className="col-auto">Fine partita</Button>
                    }
                </Row>
            </>
            }
        </Row>
    )
}

function Associations(props) {
    return (
        <>
            <Row className="justify-content-center mt-4">
                <Image style={{ width: '300px', height: '300px' }} src={props.source} rounded/>
            </Row>
            <Row className="justify-content-center mt-4">
                <h4>Didascalia abbinata: {props.cap}</h4>
            </Row>  
        </>
    )
}

export default GamePage;