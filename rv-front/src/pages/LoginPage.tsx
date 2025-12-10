import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError, restoreSession } from '../store/slices/userSlice';
import { ROUTES } from '../Routes';
import './AuthPages.css';

export const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.users);

  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        await dispatch(restoreSession()).unwrap();
      } catch (error) {
        // Игнорируем ошибки при восстановлении
      } finally {
        setIsRestoring(false);
      }
    };

    restoreUserSession();
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !isRestoring) {
      navigate(ROUTES.COMMANDS);
    }
  }, [isAuthenticated, isRestoring, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (login && password) {
      try {
        await dispatch(loginUser({ login, password })).unwrap();
      } catch (error) {
        // Ошибка уже обрабатывается в слайсе
      }
    }
  };

  if (isRestoring) {
    return (
      <div className="auth-page">
        <Container className="loading-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Восстановление сессии...</span>
          </Spinner>
          <p className="mt-3">Восстановление сессии...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Вход в систему</h2>
            {error && (
              <Alert 
                variant="danger" 
                dismissible 
                onClose={() => dispatch(clearError())}
                className="auth-alert mb-4"
              >
                {error}
              </Alert>
            )}
          </div>
          
          <Form onSubmit={handleSubmit} className="auth-form">
            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Логин</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Введите ваш логин"
                  autoComplete="username"
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="auth-label">Пароль</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Введите ваш пароль"
                  autoComplete="current-password"
                  className="auth-input"
                />
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="auth-btn"
              disabled={loading || !login || !password}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>

            <div className="auth-footer">
              <span className="auth-footer-text">Нет аккаунта? </span>
              <Link 
                to={ROUTES.REGISTER} 
                className="auth-link"
                onClick={() => dispatch(clearError())}
              >
                Зарегистрироваться
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;