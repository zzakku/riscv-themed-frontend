import "./Navigation.css";
import { type FC, useState } from "react";
import { 
  Container, 
  Navbar,
  Button
} from "react-bootstrap";
import { Link, NavLink } from "react-router-dom"
import Logo from "../assets/logo.png";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { type AppDispatch, type RootState } from '../store/store';
import { logoutUser } from '../store/slices/userSlice'; 
// import { setSearchValue, getCitiesList } from '../store/filterSlice'; 
import { setSearchQuery } from '../store/filterSlice'; 
import { ROUTES } from "../Routes";

export const Navigation: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector((state: RootState) => state.users.isAuthenticated); // получение из стора значения флага состояния приложения

  // Обработчик события нажатия на кнопку "Выйти"
  const handleExit = async ()  => {
      await dispatch(logoutUser());

      dispatch(setSearchQuery('')); // можно реализовать в `extrareducers` у функции logoutUser
      
      navigate('/commands'); // переход на страницу списка услуг

      // await dispatch(getCitiesList()); // для показа очищения поля поиска
  }

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
            {(isAuthenticated == false ) && (
                <Link to={ROUTES.LOGIN}>
                    <Button className="my-btn">Войти</Button>
                </Link>
            )}

            {(isAuthenticated == true) && (
                <Button type="submit" className="my-btn" onClick={ handleExit }>
                    Выйти
                </Button>
            )}
            
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