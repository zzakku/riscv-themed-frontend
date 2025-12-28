// CommandsPage.tsx
import "./CommandsPage.css";
import { type FC, useEffect, useState } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Spinner
} from "react-bootstrap";
import { CommandCard } from "../components/CommandCard";
import { CartIcon } from "../components/CartIcon";
import { useNavigate } from "react-router-dom";
import { ROUTE_LABELS, ROUTES } from "../Routes";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { Navigation } from "../components/Navigation";
import { COMMANDS_MOCK } from "../modules/mock";

import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setSearchQuery } from '../store/slices/filterSlice';
import { type RootState } from '../store/store';
import { getCommands } from '../store/slices/commandSlice';
import { 
  getDraftProgram, 
  addCommandToProgram
} from "../store/slices/programDraftSlice";

export const CommandsPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Получаем данные из Redux store
  const { searchQuery: reduxSearchQuery } = useAppSelector((state: RootState) => state.filters);
  const { cartCount, programId, loading: draftLoading } = useAppSelector((state) => state.draftProgram);
  const { commands, loading: commandsLoading } = useAppSelector((state: RootState) => state.commands);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.users);

  const [useMockData, setUseMockData] = useState(false);
  const [filteredMockCommands, setFilteredMockCommands] = useState(COMMANDS_MOCK);
  const [addToProgramLoading, setAddToProgramLoading] = useState<number | null>(null);
  
  // Локальное состояние для поля поиска
  const [localSearchQuery, setLocalSearchQuery] = useState(reduxSearchQuery);

  // Объединяем состояния загрузки
  const loading = commandsLoading || draftLoading;

  useEffect(() => {
    // Загружаем команды при первом рендере
    dispatch(getCommands({ query: reduxSearchQuery }))
      .unwrap()
      .catch((error) => {
        console.error("Ошибка загрузки команд через API:", error);
        setUseMockData(true);
      });
    
    // Загружаем данные корзины если пользователь авторизован
    if (isAuthenticated) {
      dispatch(getDraftProgram());
    }
  }, [dispatch, isAuthenticated]);

  // Фильтрация мок-данных при использовании моков
  useEffect(() => {
    if (useMockData) {
      if (reduxSearchQuery) {
        const filtered = COMMANDS_MOCK.filter((command) =>
          command.com_name.toLowerCase().includes(reduxSearchQuery.toLowerCase()) ||
          command.fmt.toLowerCase().includes(reduxSearchQuery.toLowerCase())
        );
        setFilteredMockCommands(filtered);
      } else {
        setFilteredMockCommands(COMMANDS_MOCK);
      }
    }
  }, [reduxSearchQuery, useMockData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сохраняем поисковый запрос в Redux store
    dispatch(setSearchQuery(localSearchQuery));
    
    if (useMockData) {
      // Фильтрация мок-данных
      const filtered = COMMANDS_MOCK.filter((command) =>
        command.com_name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        command.fmt.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
      setFilteredMockCommands(filtered);
    } else {
      // Поиск через API
      dispatch(getCommands({ query: localSearchQuery }))
        .unwrap()
        .catch((error) => {
          console.error("Ошибка поиска команд:", error);
          setUseMockData(true);
          // Фильтрация мок-данных при ошибке API
          const filtered = COMMANDS_MOCK.filter((command) =>
            command.com_name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
            command.fmt.toLowerCase().includes(localSearchQuery.toLowerCase())
          );
          setFilteredMockCommands(filtered);
        });
    }
  };

  const handleDetailsClick = (id?: number) => {
    if (id == null) {
      console.error("ID команды не указан");
      return;
    }
    navigate(`/commands/${id}`);
  };

  const handleAddToProgram = async (commandId?: number) => {
    if (commandId == null) {
      console.error("ID команды не указан");
      return;
    }

    // Проверяем авторизацию
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setAddToProgramLoading(commandId);

    try {
      // Добавляем команду в черновик
      await dispatch(addCommandToProgram(commandId)).unwrap();
      
      // После успешного добавления обновляем данные корзины
      await dispatch(getDraftProgram()).unwrap();
      
      console.log("Команда добавлена в программу:", commandId);
    } catch (error: any) {
      console.error("Ошибка при добавлении команды:", error);
    } finally {
      setAddToProgramLoading(null);
    }
  };

  const handleCartClick = () => {
    if (cartCount > 0 && programId && programId !== -1) {
      navigate(`/program/${programId}`);
    } else if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  };

  // Определяем какие данные показывать
  const displayCommands = useMockData ? filteredMockCommands : commands;

  return (
    <div className="commands-page">
      {/* Хедер и навбар */}
      <Navigation />

      <Container fluid className="navigation-section">
        <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.COMMANDS }]} />
        <Row 
          className="justify-content-between align-items-center navigation-row"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            gap: '10px',
            width: '100%'
          }}
        >
          {/* Поиск и кнопка - слева */}
          <Col 
            xs={12} 
            md={8} 
            lg={9} 
            xl={10}
            style={{
              flex: '1 1 auto',
              minWidth: '0',
              overflow: 'hidden'
            }}
          >
            <Form onSubmit={handleSearch} className="custom-search-form">
              <div className="search-fields-wrapper">
                <div className="search-input-container">
                  <Form.Control
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Поиск команд"
                    className="custom-search-input mag-glass"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="custom-search-btn"
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
                      Поиск...
                    </>
                  ) : "Найти"}
                </Button>
              </div>
            </Form>
          </Col>
          
          {/* Корзина - справа */}
          <Col 
            xs={12} 
            md={4} 
            lg={3} 
            xl={2} 
            className="cart-col-wrapper"
            style={{
              flex: '0 0 auto'
            }}
          >
            <CartIcon 
              count={cartCount}
              onClick={handleCartClick}
              disabled={!isAuthenticated || cartCount === 0 || !programId || programId === -1}
              showCount={true}
              size="md"
            />
          </Col>
        </Row>
      </Container>

      {/* Commands Grid */}
      <Container fluid className="commands-container">

        {loading ? (
          <div className="loading-wrapper">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка команд...</span>
            </Spinner>
          </div>
        ) : (
          <div className="commands-grid">
            {displayCommands.map((command) => (
              <div key={command.id} className="command-card-wrapper">
                <CommandCard
                  id={command.id}
                  img={command.img}
                  comName={command.com_name}
                  fmt={command.fmt}
                  rsNum={command.rs_num}
                  rdNum={command.rd_num}
                  onDetailsClick={() => handleDetailsClick(command.id)}
                  onAddToProgram={() => handleAddToProgram(command.id)}
                  isAddingToProgram={addToProgramLoading === command.id}
                  disabled={addToProgramLoading !== null}
                />
              </div>
            ))}
            
            {displayCommands.length === 0 && !loading && (
              <div className="no-commands">
                <h5>Команды не найдены</h5>
                <p className="text-muted">Попробуйте изменить поисковый запрос</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default CommandsPage;