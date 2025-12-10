import "./CommandInfoPage.css";
import { type FC, useEffect, useState } from "react";
import { 
  Container, 
  Spinner,
  Alert,
  Button
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navigation } from "../components/Navigation";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { type AppDispatch, type RootState } from "../store/store";
import { getCommand, clearCurrentCommand, clearError } from "../store/slices/commandSlice";
import { COMMANDS_MOCK } from "../modules/mock";

export const CommandDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Получаем данные из Redux store
  const { 
    currentCommand, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.commands);
  
  // Используем мок-данные если API недоступно
  const [useMockData, setUseMockData] = useState(false);
  const [mockCommand, setMockCommand] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const commandId = parseInt(id);
      
      if (!isNaN(commandId)) {
        // Пытаемся загрузить через API
        dispatch(getCommand(commandId))
          .unwrap()
          .catch((apiError) => {
            console.error("Ошибка загрузки команды через API:", apiError);
            
            // Если API недоступно, используем мок-данные
            const foundMock = COMMANDS_MOCK.find(cmd => cmd.id === commandId);
            if (foundMock) {
              setMockCommand(foundMock);
              setUseMockData(true);
            }
          });
      }
    }
    
    // Очищаем данные при размонтировании компонента
    return () => {
      dispatch(clearCurrentCommand());
      dispatch(clearError());
    };
  }, [id, dispatch]);

  // Определяем какую команду показывать
  const displayCommand = useMockData ? mockCommand : currentCommand;
  const displayError = useMockData ? null : error;

  const handleBackToCommands = () => {
    navigate(ROUTES.COMMANDS);
  };

  if (loading) {
    return (
      <div className="command-detail-page">
        <Navigation />
        <div className="loading-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  if ((!displayCommand && !loading) || displayError) {
    return (
      <div className="command-detail-page">
        <Navigation />
        <div className="error-container">
          <h2>Ошибка загрузки команды</h2>
          <p>{displayError || "Команда не найдена"}</p>
          {!useMockData && (
            <Button 
              variant="outline-primary" 
              onClick={() => setUseMockData(true)}
              className="mt-2"
            >
              Использовать демо-данные
            </Button>
          )}
          <Button 
            variant="outline-secondary" 
            onClick={handleBackToCommands}
            className="mt-2 ms-2"
          >
            Вернуться к списку команд
          </Button>
        </div>
      </div>
    );
  }

  if (!displayCommand) {
    return (
      <div className="command-detail-page">
        <Navigation />
        <div className="error-container">
          <h2>Команда не найдена</h2>
          <p>Запрошенная команда не существует или была удалена</p>
          <Button 
            variant="outline-secondary" 
            onClick={handleBackToCommands}
            className="mt-2"
          >
            Вернуться к списку команд
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="command-detail-page">
      {/* Header */}
      <Navigation />

      {/* Breadcrumbs */}
      <Container fluid className="breadcrumbs-section">
        <BreadCrumbs 
          crumbs={[
            { label: ROUTE_LABELS.COMMANDS, path: ROUTES.COMMANDS },
            { label: displayCommand.com_name || ROUTE_LABELS.COMMANDS_INFO }
          ]}
        />
      </Container>

      {/* Command Details */}
      <Container fluid className="command-details-container">
        {useMockData && (
          <Alert variant="info" className="mb-4" style={{ maxWidth: '992px', margin: '0 auto' }}>
            Используются демонстрационные данные
          </Alert>
        )}
        
        <div className="command-detail-card">
          {displayCommand.img && (
            <img 
              src={displayCommand.img} 
              className="command-detail-image"
              alt={displayCommand.com_name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/992x93?text=Изображение+не+загружено';
              }}
            />
          )}
          
          <div className="detail-field-group">
            <div className="detail-field-label">Название команды</div>
            <div className="detail-field-value">{displayCommand.com_name || 'Не указано'}</div>
          </div>
          
          <div className="detail-field-group">
            <div className="detail-field-label">Формат</div>
            <div className="detail-field-value">{displayCommand.fmt || 'Не указано'}</div>
          </div>
          
          <div className="detail-field-group">
            <div className="detail-field-label">№ регистра rs</div>
            <div className="detail-field-value">{displayCommand.rs_num || 'Не указано'}</div>
          </div>
          
          <div className="detail-field-group">
            <div className="detail-field-label">№ регистра rd</div>
            <div className="detail-field-value">{displayCommand.rd_num || 'Не указано'}</div>
          </div>
          
          <div className="detail-field-group">
            <div className="detail-field-label">Описание команды</div>
            <div className="detail-field-value description-text">
              {displayCommand.description || "Описание отсутствует"}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CommandDetailPage;