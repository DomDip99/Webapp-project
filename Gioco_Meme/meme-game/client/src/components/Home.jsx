import { Row, Col, Container, Accordion, Button, ListGroup, Image, Spinner } from "react-bootstrap";
import { useState, useEffect, } from "react";
import { useNavigate } from "react-router-dom";
import MyNavbar from "./MyNavbar";
import { GoPlusCircle } from "react-icons/go";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import API from "../API.mjs";


function Home(props) {
    const navigate = useNavigate();
    
    const [history, setHistory] = useState([]);
    const [waiting, setWaiting] = useState(true);
    const [refresh, setRefresh] = useState(0);

    const handleNewGame = () => {
        const roundNum = props.logged ? 3 : 1;
        setWaiting(true);
        navigate('/home/game', {state: roundNum});
    }

    useEffect(() => {
        const getUserHistory = async () => {
            if (waiting) {
                try {
                    if (!props.logged)
                        setHistory([]);
                    else {
                        const games = await API.getGames();
                        const gwrPromise = games.map(async (e) => {
                            try {
                                const rounds = await API.getRounds(e.id);
                                return {...e, rounds: rounds} ;
                            } catch (err) {
                                console.log(`errore nel recupero dei round per la partita ${e.id}`, err)
                                return {...e, rounds: []};
                            }
                        }); 
                        const gameAndRound = await Promise.all(gwrPromise);
                        setHistory(gameAndRound);
                    }
                } catch (err) {
                    setHistory(['Non hai ancora giocato nessuna partita']);
                }
                setWaiting(false); 
            }   
        }
        getUserHistory();
    }, [refresh]);

    useEffect(() => {
        reload();
    }, []);

    const reload = () => {
        setRefresh(oldK => oldK + 1);
    }

    return (
        <>
            <MyNavbar logged={props.logged} handleLogout={props.handleLogout} />
            {waiting && <Spinner animation="border"/>}
            <Container className="mt-4">
                {(props.logged) ? <h1>Bentornato {props.user.name}!</h1> : <h1>Hai effettuato l'accesso come ospite!</h1>}
                <Row className="justify-content-center">
                    <Col className="text-center">
                        <Button variant="primary" size="lg" onClick={handleNewGame} >
                            <GoPlusCircle size={40}/>  Nuova partita
                        </Button>
                    </Col> 
                </Row>
                {!waiting ?
                <Row className="mt-4">
                    {(props.logged) ? <GameList user={props.user} gamelist={history} /> : <Message />}
                </Row>
                : (<p>In attesa di storico partite...</p>)}
                <Row className="mt-4">
                    <Accordion>
                        <Accordion.Item eventKey="0">                            
                            <Accordion.Header>Come si gioca? <HiOutlineQuestionMarkCircle size={20}/></Accordion.Header>
                            <Accordion.Body>
                                <RulesComponent />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Row>
            </Container>    
        </>
    )
}

function GameList(props) {
    return (
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Storico partite</Accordion.Header>
                    <Accordion.Body>
                        Sei loggato come {props.user.username}
                        {(props.gamelist.length ==0) ? <p>Gioca qualche partita, che aspetti!</p> :                         
                         props.gamelist.map((game) => <RoundList key={game.id} game={game}/>) }
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
    )
}

function RoundList(props) {
    return (
        <Accordion>
            <Accordion.Item eventKey={props.game.id}>
                <Accordion.Header>Partita del {props.game.date}, punteggio: {props.game.score}</Accordion.Header>
                <Accordion.Body>
                    {props.game.rounds.map((round) => <RoundEl key={round.id} round={round} />)}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

function RoundEl(props) {
    return (
        <ListGroup>
            <ListGroup.Item key={props.round.id}>
                <Image style={{ width: '50px', height: '50px' }} src={"http://localhost:3001/"+props.round.meme} rounded /> {props.round.didas} - Punteggio: {props.round.points}
            </ListGroup.Item>
        </ListGroup>
    )
}

function Message() {
    return (
        <Row className="justify-content-center">
            <Col xs={10} md={8} className="text-center">
                <h3>Hai effettuato l'accesso come utente ospite...</h3>
                <h4>Ricorda di registrarti se vuoi mantenere uno storico delle tue partite!</h4>
            </Col>
        </Row>
    )
}

function RulesComponent() {
    return (
        <>
            <h5>Giocare è semplicissimo!</h5><br/>
            <p> Basta preme su "Nuova partita" e iniziare a giocare. Ti apparirà l'immagine di un meme e 7
                diverse didascalie ma fai attenzione: 5 di queste saranno errate e solo 2 saranno quelle che 
                si adattano meglio al meme! Per ogni coppia indovinata riceverai 5 punti, se sbagli 0!<br/>
                Ma c'è dell'altro! Se entri come ospite potrai disputare solo partite composte da singoli 
                round e tutte le statistiche andranno perse.<br/> Se invece sei loggato come utente disputerai 
                ogni volta una partita composta da 3 round e le tutte le statistiche relative alla partita 
                (abbinamenti meme-didascalia, punteggio, data di gioco) saranno registrate e potrai consultarle
                tutte le volte che vorrai! <br/>Allora? Che aspetti? Inizia una nuova partita!
            </p>
        </>
    )
}

export default Home;