import "./Navigation.css";
import { type FC } from "react";
import { 
  Container, 
  Navbar
} from "react-bootstrap";

export const Navigation: FC = () => {

  return (
      <Navbar className="custom-navbar" expand="lg">
        <Container fluid className="navbar-container">
          <Navbar.Brand href="/commands" className="custom-brand">
            <img 
              className="logo-image" 
              src="http://127.0.0.1:9000/rvimg/logo.png" 
              alt="logo" 
            />
          </Navbar.Brand>
        </Container>
      </Navbar>
  );
};