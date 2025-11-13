import "./Navigation.css";
import { type FC, useState } from "react";
import { 
  Container, 
  Navbar
} from "react-bootstrap";
import { NavLink } from "react-router-dom"
import Logo from "../assets/logo.png";

export const Navigation: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
      <Navbar className="custom-navbar" expand="lg">
        <Container fluid className="navbar-container">
          <Navbar.Brand className="custom-brand">
            <img 
              className="logo-image" 
              src={Logo}
              alt="logo" 
            />
          </Navbar.Brand>
          
          {/* Десктопное меню */}
          <div className='nav__wrapper'>
            <div className='nav__links'>
              <NavLink to='/' className='nav__link'>Главная</NavLink>
              <NavLink to='/commands' className='nav__link'>Команды</NavLink>
            </div>
            
            {/* Мобильное меню */}
            <div className='nav__mobile-wrapper'>
              <div 
                className={`nav__mobile-button ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
              >
                <div className='nav__mobile-target' />
              </div>
              <div className='nav__mobile-menu'>
                <NavLink to='/' className='nav__link' onClick={toggleMobileMenu}>Главная</NavLink>
                <NavLink to='/commands' className='nav__link' onClick={toggleMobileMenu}>Команды</NavLink>
              </div>
            </div>
          </div>
        </Container>
      </Navbar>
  );
};