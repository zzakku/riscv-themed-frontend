import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError } from '../store/slices/userSlice';
import { ROUTES } from '../Routes';
import './AuthPages.css';

export const RegisterPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    login?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.COMMANDS);
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors: {
      login?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!login.trim()) {
      errors.login = 'Логин обязателен';
    } else if (login.length < 3) {
      errors.login = 'Логин должен содержать не менее 3 символов';
    } else if (login.length > 25) {
      errors.login = 'Логин должен содержать не более 25 символов';
    }

    if (!password) {
      errors.password = 'Пароль обязателен';
    } else if (password.length < 6) {
      errors.password = 'Пароль должен содержать не менее 6 символов';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors({});
    
    if (validateForm()) {
      try {
        const result = await dispatch(registerUser({ login, password })).unwrap();
        
        if (result.message) {
          alert(result.message);
          navigate(ROUTES.LOGIN);
        }
      } catch (error) {
        // Ошибка уже обрабатывается в слайсе
      }
    }
  };

  const handleLoginChange = (value: string) => {
    setLogin(value);
    if (validationErrors.login) {
      setValidationErrors(prev => ({ ...prev, login: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
    if (validationErrors.confirmPassword && value === confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Регистрация</h2>
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
                  onChange={(e) => handleLoginChange(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Введите логин (3-25 символов)"
                  autoComplete="username"
                  className={`auth-input ${validationErrors.login ? 'is-invalid' : ''}`}
                />
                {validationErrors.login && (
                  <div className="invalid-feedback">{validationErrors.login}</div>
                )}
              </div>
              <Form.Text className="auth-hint">
                Логин должен содержать от 3 до 25 символов
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="auth-label">Пароль</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Введите пароль (минимум 6 символов)"
                  autoComplete="new-password"
                  className={`auth-input ${validationErrors.password ? 'is-invalid' : ''}`}
                />
                {validationErrors.password && (
                  <div className="invalid-feedback">{validationErrors.password}</div>
                )}
              </div>
              <Form.Text className="auth-hint">
                Пароль должен содержать не менее 6 символов
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="auth-label">Подтверждение пароля</Form.Label>
              <div className="input-wrapper">
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  className={`auth-input ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                />
                {validationErrors.confirmPassword && (
                  <div className="invalid-feedback">{validationErrors.confirmPassword}</div>
                )}
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="auth-btn"
              disabled={loading || !login || !password || !confirmPassword}
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
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>

            <div className="auth-footer">
              <span className="auth-footer-text">Уже есть аккаунт? </span>
              <Link 
                to={ROUTES.LOGIN} 
                className="auth-link"
                onClick={() => dispatch(clearError())}
              >
                Войти
              </Link>
            </div>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;