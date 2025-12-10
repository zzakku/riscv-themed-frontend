import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Navigation } from "../components/Navigation";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { type AppDispatch, type RootState } from "../store/store";
import { updateUserProfile, clearError } from '../store/slices/userSlice';
import './ProfilePage.css';

export const ProfilePage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [login, setLogin] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user, loading, error, isAuthenticated } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
    if (user?.login) {
      setLogin(user.login);
    }
  }, [dispatch, user]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
      try {
        await dispatch(updateUserProfile({ password })).unwrap();
        if (!error) {
          setPassword('');
          setConfirmPassword('');
          setShowPasswordForm(false);
          alert('Пароль успешно изменен');
        }
      } catch (error) {
        // Ошибка обрабатывается в слайсе
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (login && login !== user?.login) {
      try {
        await dispatch(updateUserProfile({ login })).unwrap();
        if (!error) {
          alert('Логин успешно изменен');
        }
      } catch (error) {
        // Ошибка обрабатывается в слайсе
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <Navigation />

      {/* Breadcrumbs */}
      <Container fluid className="breadcrumbs-section">
        <BreadCrumbs 
          crumbs={[
            { label: ROUTE_LABELS.COMMANDS, path: ROUTES.COMMANDS },
            { label: ROUTE_LABELS.PROFILE }
          ]} 
        />
      </Container>

      <Container fluid className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h2 className="profile-title">Личный кабинет</h2>
            {error && (
              <Alert 
                variant="danger" 
                dismissible 
                onClose={() => dispatch(clearError())}
                className="profile-alert"
              >
                {error}
              </Alert>
            )}
          </div>

          {/* Информация о пользователе */}
          <div className="user-info-section">
            <div className="section-header">
              <h3 className="section-title">Информация о пользователе</h3>
            </div>
            
            <div className="user-details">
              <div className="detail-row">
                <div className="detail-label">Логин:</div>
                <div className="detail-value">
                  <div className="detail-value-content">{user?.login}</div>
                  <Form onSubmit={handleLoginSubmit} className="login-form">
                    <Form.Group className="mb-2">
                      <div className="input-wrapper">
                        <Form.Control
                          type="text"
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          disabled={loading}
                          placeholder="Новый логин"
                          className="profile-input"
                          size="sm"
                        />
                      </div>
                      <Form.Text className="form-hint">
                        Логин должен содержать от 3 до 25 символов
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="form-actions">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setLogin(user?.login || '')}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        type="submit"
                        disabled={loading || !login || login === user?.login}
                        className="ms-2"
                      >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Сохранить'}
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Роль:</div>
                <div className="detail-value role-display">
                  {user?.is_moderator ? 'Модератор' : 'Пользователь'}
                </div>
              </div>
            </div>
          </div>

          {/* Смена пароля */}
          <div className="password-section">
            <div className="section-header">
              <h3 className="section-title">Безопасность</h3>
              {!showPasswordForm && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Сменить пароль
                </Button>
              )}
            </div>
            
            {showPasswordForm && (
              <Form onSubmit={handlePasswordSubmit} className="password-form">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label">Новый пароль</Form.Label>
                  <div className="input-wrapper">
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Введите новый пароль"
                      className="profile-input"
                    />
                  </div>
                  <Form.Text className="form-hint">
                    Пароль должен содержать не менее 6 символов
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label">Подтверждение пароля</Form.Label>
                  <div className="input-wrapper">
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Повторите пароль"
                      className={`profile-input ${password !== confirmPassword && confirmPassword !== '' ? 'is-invalid' : ''}`}
                    />
                    {password !== confirmPassword && confirmPassword !== '' && (
                      <div className="invalid-feedback">Пароли не совпадают</div>
                    )}
                  </div>
                </Form.Group>

                <div className="form-actions">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={loading || !password || password !== confirmPassword}
                    className="ms-2"
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
                        Сохранение...
                      </>
                    ) : 'Сохранить пароль'}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProfilePage;