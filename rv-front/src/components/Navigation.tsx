// Navigation.tsx
import "./Navigation.css";
import { type FC, useState } from "react";
import { 
  Container, 
  Navbar,
  Button,
  Dropdown,
  Nav
} from "react-bootstrap";
import { Link, NavLink } from "react-router-dom"
import Logo from "../assets/logo.png";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { type AppDispatch, type RootState } from '../store/store';
import { logoutUser } from '../store/slices/userSlice'; 
import { setSearchQuery } from '../store/slices/filterSlice'; 
import { ROUTES } from "../Routes";
import { clearDraft } from "../store/slices/programDraftSlice";

export const Navigation: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.users);

  // Обработчик события нажатия на кнопку "Выйти"
  const handleExit = async ()  => {
    await dispatch(logoutUser());
    dispatch(setSearchQuery(''));
    dispatch(clearDraft());
    navigate(ROUTES.COMMANDS);
    setIsMobileMenuOpen(false); // Закрываем мобильное меню при выходе
  };

  // Обработчик перехода в профиль
  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
    setIsMobileMenuOpen(false);
  };

  // Обработчик перехода в программы
  const handleProgramsClick = () => {
    navigate(ROUTES.PROGRAMS);
    setIsMobileMenuOpen(false);
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
            <NavLink to='/command-img-search' className='nav__link'>ИИ-поиск</NavLink>
              
              {isAuthenticated && (
                <NavLink to='/programs' className='nav__link'>Программы</NavLink>
              )}
              
              {isAuthenticated && user && (
                <Dropdown align="end" className="nav__dropdown">
                  <Dropdown.Toggle 
                    variant="link" 
                    id="user-dropdown"
                    className="nav__user-toggle"
                  >
                    <span className="nav__user-name">{user.login}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleProfileClick}>
                      Личный кабинет
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleProgramsClick}>
                      Мои программы
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleExit}>
                      Выйти
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
            
            {(isAuthenticated == false) && (
                <Link to={ROUTES.LOGIN}>
                    <Button className="my-btn">Войти</Button>
                </Link>
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
                
                {/* Ссылка на программы для аутентифицированных в мобильном меню */}
                {isAuthenticated && (
                  <NavLink 
                    to='/programs' 
                    className='nav__link'
                    onClick={toggleMobileMenu}
                  >
                    Программы
                  </NavLink>
                )}
                
                {isAuthenticated && user && (
                  <>
                    <div className="nav__mobile-user-info">
                      <div className="nav__mobile-user-name">{user.login}</div>
                      <div className="nav__mobile-user-role">
                        {user.is_moderator ? 'Ревьюер' : 'Пользователь'}
                      </div>
                    </div>
                    <Nav.Link 
                      as={Link} 
                      to={ROUTES.PROFILE} 
                      className="nav__link"
                      onClick={() => {
                        handleProfileClick();
                        toggleMobileMenu();
                      }}
                    >
                      Личный кабинет
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to={ROUTES.PROGRAMS} 
                      className="nav__link"
                      onClick={() => {
                        handleProgramsClick();
                        toggleMobileMenu();
                      }}
                    >
                      Мои программы
                    </Nav.Link>
                    <Button 
                      variant="link" 
                      className="nav__link nav__mobile-logout"
                      onClick={() => {
                        handleExit();
                        toggleMobileMenu();
                      }}
                    >
                      Выйти
                    </Button>
                  </>
                )}
                
                {(isAuthenticated == false) && (
                  <Link 
                    to={ROUTES.LOGIN} 
                    className='nav__link'
                    onClick={toggleMobileMenu}
                  >
                    Войти
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Navbar>
  );
};