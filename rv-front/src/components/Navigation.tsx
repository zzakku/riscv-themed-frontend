import "./Navigation.css";
import { type FC } from "react";
import { 
  Container, 
  Navbar
} from "react-bootstrap";
import { NavLink } from "react-router-dom"

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
          <div className='nav__wrapper'>
            <div className='nav__links'>
              <NavLink to='/' className='nav__link'>Главная</NavLink>
              <NavLink to='/items' className='nav__link'>Товары</NavLink>
            </div>
          </div>
        </Container>
      </Navbar>
  );
};