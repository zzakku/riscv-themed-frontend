import "./CommandsPage.css";
import { type FC, useEffect, useState, useRef } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Spinner,
  Alert,
  ProgressBar
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
import { useCommandSearch } from '../store/hooks/useCommandSearch';

export const CommandsPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Получаем данные из Redux store
  const { searchQuery: reduxSearchQuery } = useAppSelector((state: RootState) => state.filters);
  const { cartCount, programId, loading: draftLoading, error: draftError } = useAppSelector((state) => state.draftProgram);
  const { commands, loading: commandsLoading, error: commandsError } = useAppSelector((state: RootState) => state.commands);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.users);

  const [useMockData, setUseMockData] = useState(false);
  const [filteredMockCommands, setFilteredMockCommands] = useState(COMMANDS_MOCK);
  const [addToProgramLoading, setAddToProgramLoading] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  
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

  // Используем хук поиска по изображению
  const displayCommands = useMockData ? filteredMockCommands : commands;
  const { 
    items: imageSearchItems, 
    ready, 
    progress, 
    imageEmbedding, 
    searchByImage, 
    resetSearch 
  } = useCommandSearch(displayCommands);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      searchByImage(file);
      setSearchMode('image');
    }
  };

  const handleClearImageSearch = () => {
    setSelectedImage(null);
    resetSearch();
    setSearchMode('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchMode('text');
    
    // Если есть загруженное изображение, очищаем его
    if (selectedImage) {
      handleClearImageSearch();
    }
    
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

  const handleUseMockData = () => {
    setUseMockData(true);
  };

  // Определяем какие данные показывать
  const getDisplayCommands = () => {
    if (searchMode === 'image') {
      // В режиме изображения показываем отфильтрованные результаты
      return imageSearchItems.filter(item => item.isVisible);
    }
    
    // В текстовом режиме показываем либо моки, либо команды из API
    return useMockData ? filteredMockCommands : commands;
  };

  const displayCommandsToShow = getDisplayCommands();
  const isUploadDisabled = !ready || loading;
  const uploadLabel = ready ? 'Поиск по фото' : 'Загрузка нейросети...';
  const canReset = Boolean(selectedImage);

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

                {/* Кнопка загрузки изображения */}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={isUploadDisabled}
                />
                <Button 
                  variant="outline-primary"
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploadDisabled}
                  style={{
                    height: '40px',
                    flexShrink: 0,
                    minWidth: '140px'
                  }}
                >
                  {isUploadDisabled && loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Загрузка...
                    </>
                  ) : uploadLabel}
                </Button>

                {canReset && (
                  <Button 
                    variant="outline-danger"
                    onClick={handleClearImageSearch}
                    style={{
                      height: '40px',
                      flexShrink: 0,
                      minWidth: '100px'
                    }}
                  >
                    Сбросить фото
                  </Button>
                )}
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

        {commandsError && !useMockData && (
          <Alert variant="warning" className="mt-3 mb-0">
            <Alert.Heading>Ошибка загрузки команд</Alert.Heading>
            <p>{commandsError}</p>
            <div className="d-flex justify-content-end">
              <Button variant="outline-warning" size="sm" onClick={handleUseMockData}>
                Использовать демо-данные
              </Button>
            </div>
          </Alert>
        )}

        {/* Секция предпросмотра изображения и прогресса */}
        {selectedImage && (
          <div className="image-search-section mt-3">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <img src={selectedImage} alt="Query" className="preview-image" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!ready && (
                  <ProgressBar 
                    style={{ width: '200px' }}
                    now={progress} 
                    label={`${Math.round(progress)}%`} 
                    animated 
                  />
                )}
                {imageEmbedding && Array.isArray(imageEmbedding) && (
                  <div className="embed-preview">
                    <strong>Image Embed: </strong><br/>
                    [{(imageEmbedding as number[]).slice(0, 5).map((n: number) => n.toFixed(3)).join(', ')}...]
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>

      {draftError && (
        <Alert variant="danger" className="mb-3">
          Ошибка загрузки корзины: {draftError}
        </Alert>
      )}

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
            {displayCommandsToShow.map((command) => {
              // Безопасная проверка типа для отображения сходства
              const showSimilarity = searchMode === 'image' && 
                                    command && 
                                    typeof command === 'object' && 
                                    'score' in command && 
                                    typeof (command as any).score === 'number';
              
              const score = showSimilarity ? (command as any).score : 0;
              
              return (
                <div key={command.id} className="command-card-wrapper">
                  {/* Отображение сходства для поиска по изображению */}
                  {showSimilarity && score > 0 && (
                    <div className="similarity-badge">
                      <span className="badge">
                        Сходство: {(score * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  
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
              );
            })}
            
            {displayCommandsToShow.length === 0 && !loading && (
              <div className="no-commands">
                <h5>Команды не найдены</h5>
                <p className="text-muted">
                  {searchMode === 'image' 
                    ? "Попробуйте загрузить другое изображение"
                    : "Попробуйте изменить поисковый запрос"}
                </p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default CommandsPage;