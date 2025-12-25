// pages/ProgramsPage.tsx
import { type FC, useEffect, useState, useCallback, useRef } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Badge, 
  Spinner, 
  Alert, 
  Form, 
  Row, 
  Col, 
  Card,
  Pagination,
  Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getPrograms } from '../store/slices/programSlice';
import { getDraftProgram } from '../store/slices/programDraftSlice';
import { moderateProgram } from '../store/slices/programSlice';
import type { RootState } from '../store/store';
import { ROUTES } from '../Routes';
import { Navigation } from '../components/Navigation';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { CartIcon } from '../components/CartIcon';
import './ProgramsPage.css';

// Константа для интервала polling
const POLLING_INTERVAL = 10000; // 10 секунд

export const ProgramsPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { programs, loading, error } = useAppSelector((state: RootState) => state.programs);
  const { cartCount, programId } = useAppSelector((state: RootState) => state.draftProgram);
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.users);

  // Функция для получения сегодняшней даты в формате DD.MM.YYYY для API
  const getTodayFormatted = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Функция для преобразования формата DD.MM.YYYY → YYYY-MM-DD (для input type="date")
  const formatDateForInput = (dateString: string): string => {
    if (!dateString || dateString === '') return '';
    
    // Если уже в формате YYYY-MM-DD
    if (dateString.includes('-') && dateString.length === 10) {
      return dateString;
    }
    
    // Преобразуем DD.MM.YYYY в YYYY-MM-DD
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return '';
  };

  // Функция для преобразования формата YYYY-MM-DD → DD.MM.YYYY (для API)
  const formatDateForApi = (dateString: string): string => {
    if (!dateString || dateString === '') return '';
    
    // Если уже в формате DD.MM.YYYY
    if (dateString.includes('.') && dateString.length === 10) {
      return dateString;
    }
    
    // Преобразуем YYYY-MM-DD в DD.MM.YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    }
    
    return '';
  };

  // Состояния для фильтров с установкой сегодняшней даты по умолчанию
  const [filters, setFilters] = useState({
    status: '',
    start_date: formatDateForInput(getTodayFormatted()),
    end_date: formatDateForInput(getTodayFormatted()),
    creator_login: '' // Новый фильтр по логину создателя
  });

  // Состояние для хранения фильтров в формате API
  const [apiFilters, setApiFilters] = useState({
    status: '',
    start_date: getTodayFormatted(),
    end_date: getTodayFormatted()
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [moderationDecision, setModerationDecision] = useState<'approve' | 'reject' | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<number | null>(null);

  // Проверяем, является ли пользователь ревьюером
  const isModerator = user?.is_moderator || false;

  // Функция для загрузки данных с фильтрами
  const loadPrograms = useCallback(async () => {
    try {
      await dispatch(getPrograms(apiFilters)).unwrap();
    } catch (err) {
      console.error('Ошибка загрузки программ:', err);
    }
  }, [dispatch, apiFilters]);

  // Инициализация данных с short polling
  useEffect(() => {
    const loadData = async () => {
      await loadPrograms();
      
      if (isAuthenticated) {
        try {
          await dispatch(getDraftProgram()).unwrap();
        } catch (err) {
          console.error('Ошибка загрузки черновика программы:', err);
        }
      }
    };
    
    loadData();
    
    // Запускаем polling только для ревьюеров
    if (isModerator) {
      setIsPolling(true);
    }
    
    // Очистка при размонтировании
    return () => {
      if (pollingRef.current) {
        window.clearTimeout(pollingRef.current);
      }
    };
  }, [dispatch, isAuthenticated, loadPrograms, isModerator]);

  // Short polling эффект
  useEffect(() => {
    if (!isModerator || !isPolling) return;

    const pollPrograms = async () => {
      try {
        await loadPrograms();
      } catch (err) {
        console.error('Ошибка polling:', err);
      } finally {
        // Планируем следующий polling
        if (isPolling && pollingRef.current !== null) {
          pollingRef.current = window.setTimeout(pollPrograms, POLLING_INTERVAL);
        }
      }
    };

    // Запускаем первый polling
    pollingRef.current = window.setTimeout(pollPrograms, POLLING_INTERVAL);

    // Очистка
    return () => {
      if (pollingRef.current) {
        window.clearTimeout(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isModerator, isPolling, loadPrograms]);

  // Применить фильтры
  const handleApplyFilters = async () => {
    setCurrentPage(1);
    
    // Конвертируем фильтры в формат API
    const newApiFilters = {
      status: filters.status,
      start_date: formatDateForApi(filters.start_date),
      end_date: formatDateForApi(filters.end_date)
    };
    
    setApiFilters(newApiFilters);
    
    try {
      await loadPrograms();
    } catch (err) {
      console.error('Ошибка при применении фильтров:', err);
    }
  };

  // Сбросить фильтры
  const handleResetFilters = async () => {
    const todayFormatted = formatDateForInput(getTodayFormatted());
    
    const resetFilters = {
      status: '',
      start_date: todayFormatted,
      end_date: todayFormatted,
      creator_login: ''
    };
    
    const resetApiFilters = {
      status: '',
      start_date: getTodayFormatted(),
      end_date: getTodayFormatted()
    };
    
    setFilters(resetFilters);
    setApiFilters(resetApiFilters);
    setCurrentPage(1);
    
    try {
      await loadPrograms();
    } catch (err) {
      console.error('Ошибка при сбросе фильтров:', err);
    }
  };

  const handleCartClick = () => {
    if (cartCount > 0 && isAuthenticated && programId && programId !== -1) {
      navigate(ROUTES.PROGRAM.replace(':id', programId.toString()));
    } else if (isAuthenticated && cartCount === 0) {
      alert("Корзина пуста. Добавьте команды в программу.");
    } else if (!isAuthenticated) {
      alert("Для просмотра программы необходимо войти в систему");
      navigate('/login');
    }
  };

  const handleViewProgram = (programId: number) => {
    if (!programId) {
      console.error('ID программы не указан');
      return;
    }
    navigate(ROUTES.PROGRAM.replace(':id', programId.toString()));
  };

  // Обработчик модерации программы
  const handleModerateProgram = (program: any) => {
    if (!program?.id) {
      console.error('Нельзя модерировать программу без ID');
      return;
    }
    setSelectedProgram(program);
    setShowModerateModal(true);
  };

  // Подтверждение модерации
  const handleConfirmModeration = async () => {
    if (!selectedProgram?.id || !moderationDecision) return;

    try {
      // Отправляем решение на бекенд
      await dispatch(moderateProgram({
        programId: selectedProgram.id,
        is_accepted: moderationDecision === 'approve'
      })).unwrap();
      
      // Обновляем список программ
      await loadPrograms();
      
      // Закрываем модальное окно
      setShowModerateModal(false);
      setSelectedProgram(null);
      setModerationDecision(null);
      
    } catch (err) {
      console.error('Ошибка модерации:', err);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusDisplay = (status?: string) => {
    if (!status) return 'Не указан';
    
    const statusMap: Record<string, string> = {
      'черновик': 'Черновик',
      'сформирована': 'Сформирована',
      'одобрена': 'Одобрена',
      'отклонена': 'Отклонена',
      'завершена': 'Завершена'
    };
    
    return statusMap[status.toLowerCase()] || status;
  };

  // Функция для определения цвета статуса
  const getStatusColor = (status?: string) => {
    if (!status) return 'secondary';
    
    switch (status.toLowerCase()) {
      case 'черновик':
        return 'secondary';
      case 'сформирована':
        return 'warning';
      case 'одобрена':
        return 'success';
      case 'отклонена':
        return 'danger';
      case 'завершена':
        return 'primary';
      default: 
        return 'secondary';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === '') return '—';
    try {
      if (dateString.includes('.')) {
        return dateString;
      }
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  // Функция для отображения результата программы
  const renderProgramResult = (res_t1?: number, res_t2?: number) => {
    // Проверяем, есть ли результат (не NULL)
    const hasResult = res_t1 !== null && res_t1 !== undefined && 
                     res_t2 !== null && res_t2 !== undefined;
    
    if (!hasResult) {
      return (
        <span className="text-muted fst-italic" style={{ fontSize: '0.9em' }}>
          Не выполнена
        </span>
      );
    }
    
    return (
      <div className="program-result">
        <div className="result-values">
          <Badge bg="secondary" className="me-1">
            T1: {res_t1}
          </Badge>
          <Badge bg="secondary">
            T2: {res_t2}
          </Badge>
        </div>
      </div>
    );
  };

  // Функция для отображения начальных значений
  const renderInitialValues = (init_t1?: number, init_t2?: number) => {
    // Проверяем, есть ли начальные значения (не NULL)
    const hasInitialValues = init_t1 !== null && init_t1 !== undefined && 
                           init_t2 !== null && init_t2 !== undefined;
    
    if (!hasInitialValues) {
      return (
        <span className="text-muted fst-italic" style={{ fontSize: '0.9em' }}>
          Не инициализированы
        </span>
      );
    }
    
    return (
      <div className="initial-values">
        <div className="init-values">
          <Badge bg="light" text="dark" className="me-1">
            T1: {init_t1}
          </Badge>
          <Badge bg="light" text="dark">
            T2: {init_t2}
          </Badge>
        </div>
      </div>
    );
  };

  // Фильтрация по логину создателя на фронтенде
  const filteredPrograms = Array.isArray(programs) ? programs.filter(program => {
    if (!filters.creator_login) return true;
    return program.creator_login?.toLowerCase().includes(filters.creator_login.toLowerCase());
  }) : [];

  // Сортировка данных
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any, bValue: any;
    
    if (sortConfig.key === 'id') {
      aValue = a.id || 0;
      bValue = b.id || 0;
    } else if (sortConfig.key === 'status') {
      aValue = a.status || '';
      bValue = b.status || '';
    } else if (sortConfig.key === 'created_at') {
      aValue = a.date_create || '';
      bValue = b.date_create || '';
    } else if (sortConfig.key === 'updated_at') {
      aValue = a.date_update || '';
      bValue = b.date_update || '';
    } else if (sortConfig.key === 'init_t1') {
      aValue = a.init_t1 !== null && a.init_t1 !== undefined ? a.init_t1 : -1;
      bValue = b.init_t1 !== null && b.init_t1 !== undefined ? b.init_t1 : -1;
    } else if (sortConfig.key === 'init_t2') {
      aValue = a.init_t2 !== null && a.init_t2 !== undefined ? a.init_t2 : -1;
      bValue = b.init_t2 !== null && b.init_t2 !== undefined ? b.init_t2 : -1;
    } else if (sortConfig.key === 'creator') {
      aValue = a.creator_login || '';
      bValue = b.creator_login || '';
    } else if (sortConfig.key === 'result_t1') {
      aValue = a.res_t1 !== null && a.res_t1 !== undefined ? a.res_t1 : -1;
      bValue = b.res_t1 !== null && b.res_t1 !== undefined ? b.res_t1 : -1;
    } else if (sortConfig.key === 'result_t2') {
      aValue = a.res_t2 !== null && a.res_t2 !== undefined ? a.res_t2 : -1;
      bValue = b.res_t2 !== null && b.res_t2 !== undefined ? b.res_t2 : -1;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrograms = sortedPrograms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedPrograms.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  // Проверяем, применены ли какие-либо фильтры
  const hasActiveFilters = filters.status || 
                         (filters.start_date) || 
                         (filters.end_date) || 
                         filters.creator_login;

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'черновик', label: 'Черновик' },
    { value: 'сформирована', label: 'Сформирована' },
    { value: 'отклонена', label: 'Отклонена' },
    { value: 'завершена', label: 'Завершена' }
  ];

  return (
    <div className="programs-page">
      <Navigation />
      
      <Container fluid className="navigation-section">
        <BreadCrumbs crumbs={[{ label: 'Программы' }]} />
        
        {/* Основной контент */}
        <div className="programs-content">
          {/* Заголовок страницы и кнопки действий */}
          <div className="page-header">
            <div className="header-left">
              <h1>Программы {isModerator && <span>(Ревьюер)</span>}</h1>
              {isAuthenticated && user && (
                <Badge bg="light" text="dark" className="user-badge">
                  {user.login}
                </Badge>
              )}
            </div>
            <div className="header-right">
              <CartIcon 
                count={cartCount} 
                onClick={handleCartClick}
                disabled={!isAuthenticated || cartCount === 0 || !programId || programId === -1}
                showCount={true}
                size="md"
              />
            </div>
          </div>

          {/* Карточка с фильтрами */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Фильтры</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Статус</Form.Label>
                    <Form.Select 
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Дата с</Form.Label>
                    <Form.Control 
                      type="date"
                      value={filters.start_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                    <Form.Text className="text-muted">
                      Формат: ДД.ММ.ГГГГ
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Дата по</Form.Label>
                    <Form.Control 
                      type="date"
                      value={filters.end_date}
                      onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                    <Form.Text className="text-muted">
                      Формат: ДД.ММ.ГГГГ
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Создатель</Form.Label>
                    <Form.Control 
                      type="text"
                      value={filters.creator_login}
                      onChange={(e) => setFilters(prev => ({ ...prev, creator_login: e.target.value }))}
                      placeholder="Логин создателя"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={12} className="d-flex align-items-center justify-content-between mt-2">
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleApplyFilters}
                      disabled={loading}
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
                          Загрузка...
                        </>
                      ) : 'Применить фильтры'}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleResetFilters}
                      disabled={!hasActiveFilters || loading}
                    >
                      Сбросить фильтры
                    </Button>
                  </div>
                  
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {error && (
            <Alert variant="danger" className="mb-3">
              <Alert.Heading>Ошибка</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}
          
          {loading ? (
            <div className="text-center loading-container">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
              <p className="loading-text">Загрузка программ...</p>
            </div>
          ) : (
            <>
              {sortedPrograms.length > 0 && (
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="total-info">
                    Найдено программ: <strong>{sortedPrograms.length}</strong>
                    {hasActiveFilters && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        Применены фильтры
                      </Badge>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="pagination-info">
                      Страница {currentPage} из {totalPages}
                    </div>
                  )}
                </div>
              )}
              
              <div className="table-responsive">
                <Table striped bordered hover className="programs-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('id')}>
                        ID {renderSortIcon('id')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('status')}>
                        Статус {renderSortIcon('status')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('created_at')}>
                        Создано {renderSortIcon('created_at')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('updated_at')}>
                        Обновлено {renderSortIcon('updated_at')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('creator')}>
                        Автор {renderSortIcon('creator')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('init_t1')}>
                        Начальные значения {renderSortIcon('init_t1')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('result_t1')}>
                        Результат {renderSortIcon('result_t1')}
                      </th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPrograms.length > 0 ? (
                      currentPrograms.map((program) => (
                        <tr key={program.id || Math.random()} className="program-row">
                          <td className="id-cell">
                            <strong>#{program.id || 'N/A'}</strong>
                          </td>
                          <td className="status-cell">
                            <Badge 
                              bg={getStatusColor(program.status)}
                              className="status-badge"
                            >
                              {getStatusDisplay(program.status)}
                            </Badge>
                          </td>
                          <td className="date-cell">
                            {formatDate(program.date_create)}
                          </td>
                          <td className="date-cell">
                            {formatDate(program.date_update)}
                          </td>
                          <td className="creator-cell">
                            {program.creator_login || 'Не указан'}
                            {program.moderator_login && program.moderator_login !== program.creator_login && (
                              <div className="text-muted small">
                                Проверил: {program.moderator_login}
                              </div>
                            )}
                          </td>
                          <td className="initial-values-cell">
                            {renderInitialValues(program.init_t1, program.init_t2)}
                          </td>
                          <td className="result-cell">
                            {renderProgramResult(program.res_t1, program.res_t2)}
                          </td>
                          <td className="actions-cell">
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => program.id && handleViewProgram(program.id)}
                                className="action-btn"
                                disabled={!program.id}
                              >
                                Просмотр
                              </Button>
                              {isModerator && program.status === 'сформирована' && (
                                <Button 
                                  variant="warning" 
                                  size="sm"
                                  onClick={() => handleModerateProgram(program)}
                                >
                                  Модерировать
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="no-data-cell">
                          <div className="no-data-content">
                            <h5>Программы не найдены</h5>
                            <p>
                              {hasActiveFilters 
                                ? 'По выбранным фильтрам программ не найдено. Попробуйте изменить условия поиска.' 
                                : 'У вас пока нет программ.'
                              }
                            </p>
                            {hasActiveFilters && (
                              <Button 
                                variant="outline-primary" 
                                className="mt-3"
                                onClick={handleResetFilters}
                              >
                                Сбросить фильтры
                              </Button>
                            )}
                            <Button 
                              variant="outline-primary" 
                              className="ms-2 mt-3"
                              onClick={handleApplyFilters}
                            >
                              Обновить
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Пагинация */}
              {sortedPrograms.length > itemsPerPage && (
                <div className="pagination-container">
                  <Pagination className="custom-pagination">
                    <Pagination.First 
                      onClick={() => paginate(1)} 
                      disabled={currentPage === 1} 
                    />
                    <Pagination.Prev 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1} 
                    />
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item
                          key={pageNumber}
                          active={pageNumber === currentPage}
                          onClick={() => paginate(pageNumber)}
                        >
                          {pageNumber}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages} 
                    />
                    <Pagination.Last 
                      onClick={() => paginate(totalPages)} 
                      disabled={currentPage === totalPages} 
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}

          {/* Модальное окно модерации */}
          <Modal show={showModerateModal} onHide={() => setShowModerateModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Модерация программы #{selectedProgram?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Создатель:</strong> {selectedProgram?.creator_login || 'Не указан'}</p>
              <p><strong>Дата создания:</strong> {formatDate(selectedProgram?.date_create)}</p>
              <p><strong>Текущий статус:</strong> {getStatusDisplay(selectedProgram?.status)}</p>
              
              <div className="mt-3">
                <Form.Group>
                  <Form.Label><strong>Решение модерации:</strong></Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Button 
                      variant={moderationDecision === 'approve' ? 'success' : 'outline-success'}
                      onClick={() => setModerationDecision('approve')}
                    >
                      Одобрить
                    </Button>
                    <Button 
                      variant={moderationDecision === 'reject' ? 'danger' : 'outline-danger'}
                      onClick={() => setModerationDecision('reject')}
                    >
                      Отклонить
                    </Button>
                  </div>
                </Form.Group>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModerateModal(false)}>
                Отмена
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirmModeration}
                disabled={!moderationDecision}
              >
                Применить решение
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </Container>
    </div>
  );
};