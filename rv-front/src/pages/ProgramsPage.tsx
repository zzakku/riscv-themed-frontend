// pages/ProgramsPage.tsx
import { type FC, useEffect, useState } from 'react';
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
  Pagination
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getPrograms } from '../store/slices/programSlice';
import { getDraftProgram } from '../store/slices/programDraftSlice';
import type { RootState } from '../store/store';
import { ROUTES } from '../Routes';
import { Navigation } from '../components/Navigation';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { CartIcon } from '../components/CartIcon';
import './ProgramsPage.css';

export const ProgramsPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { programs, loading, error } = useAppSelector((state: RootState) => state.programs);
  const { cartCount, programId } = useAppSelector((state: RootState) => state.draftProgram);
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.users);

  // Состояния для фильтров
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Инициализация данных
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(getPrograms(filters)).unwrap();
      } catch (err) {
        console.error('Ошибка загрузки программ:', err);
      }
      
      if (isAuthenticated) {
        try {
          await dispatch(getDraftProgram()).unwrap();
        } catch (err) {
          console.error('Ошибка загрузки черновика программы:', err);
        }
      }
    };
    
    loadData();
  }, [dispatch, isAuthenticated]);

  // Применить фильтры
  const handleApplyFilters = async () => {
    setCurrentPage(1);
    try {
      await dispatch(getPrograms(filters)).unwrap();
    } catch (err) {
      console.error('Ошибка при применении фильтров:', err);
    }
  };

  // Сбросить фильтры
  const handleResetFilters = async () => {
    const resetFilters = {
      status: '',
      start_date: '',
      end_date: ''
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    try {
      await dispatch(getPrograms(resetFilters)).unwrap();
    } catch (err) {
      console.error('Ошибка при сбросе фильтров:', err);
    }
  };

  const handleCartClick = () => {
    if (cartCount > 0 && isAuthenticated && programId && programId !== -1) {
      navigate(ROUTES.PROGRAM.replace(':programId', programId.toString()));
    } else if (isAuthenticated && cartCount === 0) {
      alert("Корзина пуста. Добавьте команды в программу.");
    } else if (!isAuthenticated) {
      alert("Для просмотра программы необходимо войти в систему");
      navigate('/login');
    }
  };

  const handleViewProgram = (programId: number) => {
    navigate(ROUTES.PROGRAM.replace(':programId', programId.toString()));
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'черновик': 'Черновик',
      'сформирована': 'Сформирована',
      'отклонена': 'Отклонена',
      'завершена': 'Завершена'
    };
    
    return statusMap[status.toLowerCase()] || status;
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

  // Сортировка данных
  const sortedPrograms = Array.isArray(programs) 
    ? [...programs].sort((a, b) => {
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
          aValue = a.init_t1 || 0;
          bValue = b.init_t1 || 0;
        } else if (sortConfig.key === 'init_t2') {
          aValue = a.init_t2 || 0;
          bValue = b.init_t2 || 0;
        } else if (sortConfig.key === 'creator') {
          aValue = a.creator_login || '';
          bValue = b.creator_login || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      })
    : [];

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
  const hasActiveFilters = filters.status || filters.start_date || filters.end_date;

  // Обновляем опции фильтра по статусу
  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'черновик', label: 'Черновик' },
    { value: 'сформирована', label: 'Сформирована' },
    { value: 'ожидает проверки', label: 'Ожидает проверки' },
    { value: 'одобрена', label: 'Одобрена' },
    { value: 'отклонена', label: 'Отклонена' },
    { value: 'в работе', label: 'В работе' },
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
              <h1>Программы</h1>
              {isAuthenticated && user && (
                <Badge bg="light" text="dark" className="user-badge">
                  {user.login}
                </Badge>
              )}
            </div>
            <div className="header-right">
              {/* Убрана кнопка "Новая программа" */}
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
                <Col md={4}>
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
                
                <Col md={4}>
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
                
                <Col md={4}>
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
                  
                  {/* Индикатор активных фильтров */}
                  {hasActiveFilters && (
                    <div className="active-filters-info">
                      <small className="text-muted">
                        Активные фильтры: 
                        {filters.status && ` Статус: ${filters.status}`}
                        {filters.start_date && ` Дата с: ${filters.start_date}`}
                        {filters.end_date && ` Дата по: ${filters.end_date}`}
                      </small>
                    </div>
                  )}
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
              {Array.isArray(programs) && programs.length > 0 && (
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="total-info">
                    Найдено программ: <strong>{programs.length}</strong>
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
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPrograms.length > 0 ? (
                      currentPrograms.map((program) => (
                        <tr key={program.id} className="program-row">
                          <td className="id-cell">
                            <strong>#{program.id}</strong>
                          </td>
                          <td className="status-cell">
                            {/* Убраны цветные рамки - просто текст статуса */}
                            <span className="status-text">
                              {getStatusDisplay(program.status || '')}
                            </span>
                          </td>
                          <td className="date-cell">
                            {formatDate(program.date_create)}
                          </td>
                          <td className="date-cell">
                            {formatDate(program.date_update)}
                          </td>
                          <td className="creator-cell">
                            {program.creator_login}
                            {program.moderator_login && program.moderator_login !== program.creator_login && (
                              <div className="text-muted small">
                                Проверил: {program.moderator_login}
                              </div>
                            )}
                          </td>
                          <td className="actions-cell">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => program.id && handleViewProgram(program.id)}
                              className="action-btn"
                              disabled={!program.id}
                            >
                              Просмотр
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="no-data-cell">
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
                              onClick={() => dispatch(getPrograms(filters))}
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
        </div>
      </Container>
    </div>
  );
};