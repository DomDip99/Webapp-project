import 'bootstrap/dist/css/bootstrap.min.css';
import { Container} from "react-bootstrap";
import { Link } from "react-router-dom";

export default function ErrorRoute() {
    return (
      <Container>
        <h1>Errore!</h1>
        <h2>Questa non è la pagina che stavi cercando...</h2>
        <Link to='/'>Torna alla pagina di login</Link>
      </Container>
    )
  }