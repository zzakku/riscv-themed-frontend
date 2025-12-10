import "./ProgramPage.css";
import { type FC, useState, useEffect, useMemo } from "react";
import { 
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Modal
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Navigation } from "../components/Navigation";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { type AppDispatch, type RootState } from "../store/store";
import { 
  getProgram, 
  updateProgram, 
  clearCurrentProgram,
  submitProgram 
} from "../store/slices/programSlice";
import { 
  deleteDraftProgram,
  updateCommandOperand 
} from "../store/slices/programDraftSlice";

// Интерфейс для адаптированного ответа API
interface AdaptedCommandWithOperand {
  command?: {
    id?: number;
    com_name?: string;
    fmt?: string;
    rs_num?: number;
    rd_num?: number;
    img?: string;
    description?: string;
    is_delete?: boolean;
  };
  operand?: number;
}

interface AdaptedProgramData {
  program?: {
    id?: number;
    status?: string;
    date_create?: string;
    date_update?: string;
    date_finish?: string;
    creator_login?: string;
    moderator_login?: string;
    init_t1?: number | null;
    init_t2?: number | null;
    res_t1?: number | null;
    res_t2?: number | null;
  };
  commands_with_operands?: AdaptedCommandWithOperand[];
}

// Функция для форматирования даты
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString || dateString.trim() === '' || dateString === 'null') {
    return 'Не указана';
  }
  
  // Возвращаем дату как есть из API
  return dateString.trim();
};

export const ProgramPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Получаем данные из Redux store
  const {
    currentProgram: programData,
    loading,
    error
  } = useSelector((state: RootState) => state.programs);
  
  // Получаем данные о черновике пользователя
  const { programId: draftProgramId, cartCount } = useSelector(
    (state: RootState) => state.draftProgram
  );
  
  // Состояния UI
  const [initT1, setInitT1] = useState<number>(0);
  const [initT2, setInitT2] = useState<number>(0);
  const [operands, setOperands] = useState<{ [key: number]: number }>({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatingOperandId, setUpdatingOperandId] = useState<number | null>(null);

  // Адаптируем данные из API
  const adaptedData: AdaptedProgramData | null = useMemo(() => {
    if (!programData) return null;
    
    console.log('Исходные данные programData:', programData);
    
    // Преобразуем структуру данных
    const adapted: AdaptedProgramData = {
      program: programData.program || {},
    };
    
    // Обрабатываем команды - API возвращает Command и Operand с большой буквы
    if (programData.commands_with_operands) {
      adapted.commands_with_operands = programData.commands_with_operands.map((item: any) => {
        // Проверяем разные варианты структуры
        const command = item.Command || item.command || {};
        const operand = item.Operand !== undefined ? item.Operand : item.operand;
        
        return {
          command: {
            id: command.id,
            com_name: command.com_name || command.comName,
            fmt: command.fmt,
            rs_num: command.rs_num || command.rsNum,
            rd_num: command.rd_num || command.rdNum,
            img: command.img,
            description: command.description,
            is_delete: command.is_delete
          },
          operand: operand
        };
      });
    }
    
    console.log('Адаптированные данные:', adapted);
    return adapted;
  }, [programData]);

  // Проверяем, является ли текущая программа черновиком текущего пользователя
  const isDraftForCurrentUser = useMemo(() => {
    if (!adaptedData?.program?.id || draftProgramId === -1) return false;
    return adaptedData.program.id === draftProgramId;
  }, [adaptedData, draftProgramId]);

  // Проверяем статус программы
  const isDraftStatus = useMemo(() => {
    const status = adaptedData?.program?.status?.toLowerCase();
    return status === 'draft' || status === 'черновик';
  }, [adaptedData]);

  // Проверяем, можно ли редактировать программу
  const canEditProgram = useMemo(() => {
    return isDraftForCurrentUser && isDraftStatus;
  }, [isDraftForCurrentUser, isDraftStatus]);

  // Загружаем данные программы
  useEffect(() => {
    if (id) {
      const programId = parseInt(id);
      if (!isNaN(programId)) {
        dispatch(getProgram(programId));
      }
    }
    
    // Очищаем данные программы при размонтировании компонента
    return () => {
      dispatch(clearCurrentProgram());
    };
  }, [id, dispatch]);

  // Инициализируем состояние из загруженных данных
  useEffect(() => {
    if (adaptedData?.program) {
      setInitT1(adaptedData.program.init_t1 || 0);
      setInitT2(adaptedData.program.init_t2 || 0);
      
      // Инициализируем операнды из загруженных данных
      const initialOperands: { [key: number]: number } = {};
      adaptedData.commands_with_operands?.forEach((cmdWithOperand) => {
        if (cmdWithOperand.command?.id !== undefined) {
          initialOperands[cmdWithOperand.command.id] = cmdWithOperand.operand || 0;
        }
      });
      setOperands(initialOperands);
    }
  }, [adaptedData]);

  const handleRemoveProgram = async () => {
    if (!canEditProgram) {
      setUpdateError("Нельзя удалить эту программу");
      return;
    }
    
    try {
      await dispatch(deleteDraftProgram()).unwrap();
      navigate(ROUTES.COMMANDS);
    } catch (error: any) {
      setUpdateError(error.message || "Ошибка при удалении программы");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleSubmitProgram = async () => {
    if (!adaptedData?.program?.id || !canEditProgram) {
      setUpdateError("Нельзя отправить эту программу на модерацию");
      return;
    }
    
    try {
      await dispatch(submitProgram(adaptedData.program.id)).unwrap();
      setUpdateSuccess("Программа успешно отправлена на модерацию");
      
      // Обновляем данные программы после отправки
      dispatch(getProgram(adaptedData.program.id));
    } catch (error: any) {
      setUpdateError(error.message || "Ошибка при отправке программы");
    }
  };

  const handleUpdateInitialValues = async () => {
    if (!adaptedData?.program?.id || !canEditProgram) {
      setUpdateError("Нельзя обновить эту программу");
      return;
    }
    
    try {
      await dispatch(updateProgram({
        programId: adaptedData.program.id,
        updateData: {
          init_t1: initT1,
          init_t2: initT2
        }
      })).unwrap();
      
      setUpdateSuccess("Начальные значения успешно обновлены");
      setUpdateError(null);
    } catch (error: any) {
      setUpdateError(error.message || "Ошибка при обновлении начальных значений");
      setUpdateSuccess(null);
    }
  };

  const handleOperandChange = (commandId: number, value: number) => {
    if (!canEditProgram) {
      setUpdateError("Нельзя редактировать операнды этой программы");
      return;
    }
    
    setOperands(prev => ({
      ...prev,
      [commandId]: value
    }));
  };

  const handleUpdateOperand = async (commandId: number, operand: number) => {
    if (!canEditProgram) {
      setUpdateError("Нельзя обновлять операнды этой программы");
      return;
    }
    
    setUpdatingOperandId(commandId);
    
    try {
      await dispatch(updateCommandOperand({ 
        commandId, 
        operand 
      })).unwrap();
      
      setUpdateSuccess(`Операнд для команды обновлен`);
      setUpdateError(null);
    } catch (error: any) {
      setUpdateError(error.message || "Ошибка при обновлении операнда");
      setUpdateSuccess(null);
    } finally {
      setUpdatingOperandId(null);
    }
  };

  // Показать модальное окно подтверждения удаления
  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="program-page">
        <Navigation />
        <Container fluid className="loading-section">
          <Row className="justify-content-center">
            <Col xs="auto">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
              <p className="mt-2">Загрузка программы...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="program-page">
        <Navigation />
        <Container fluid className="error-section">
          <Row>
            <Col>
              <Alert variant="danger">
                <Alert.Heading>Ошибка загрузки программы</Alert.Heading>
                <p>{error}</p>
                <Button 
                  variant="outline-danger" 
                  onClick={() => navigate(ROUTES.COMMANDS)}
                >
                  Вернуться к списку команд
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!adaptedData || !adaptedData.program) {
    return (
      <div className="program-page">
        <Navigation />
        <Container fluid className="not-found-section">
          <Row>
            <Col>
              <Alert variant="warning">
                <Alert.Heading>Программа не найдена</Alert.Heading>
                <p>Запрошенная программа не существует или у вас нет к ней доступа.</p>
                <Button 
                  variant="outline-warning" 
                  onClick={() => navigate(ROUTES.COMMANDS)}
                >
                  Вернуться к списку команд
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const commandsWithOperands = adaptedData.commands_with_operands || [];

  return (
    <div className="program-page">
      {/* Header */}
      <Navigation />

      {/* Модальное окно подтверждения удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить этот черновик программы? Это действие нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleRemoveProgram}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Breadcrumbs */}
      <Container fluid className="breadcrumbs-section">
        <BreadCrumbs crumbs={[
            { label: ROUTE_LABELS.COMMANDS, path: ROUTES.COMMANDS },
            { label: `Программа #${adaptedData.program.id}` }
          ]} 
        />
      </Container>

      {/* Status and Actions Section */}
      <Container fluid className="actions-section">
        <Row className="align-items-center mb-3">
          <Col>
            <div className="program-status">
              <span className="status-label">Статус: </span>
              <span className={`status-value status-${adaptedData.program.status?.toLowerCase() || 'unknown'}`}>
                {adaptedData.program.status || 'Неизвестно'}
              </span>
              {adaptedData.program.creator_login && (
                <span className="creator-info ms-3">
                  Создатель: {adaptedData.program.creator_login}
                </span>
              )}
              {adaptedData.program.moderator_login && (
                <span className="moderator-info ms-3">
                  Модератор: {adaptedData.program.moderator_login}
                </span>
              )}
              {cartCount > 0 && isDraftForCurrentUser && (
                <span className="cart-info ms-3">
                  Команд в черновике: {commandsWithOperands.length}
                </span>
              )}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            {updateError && (
              <Alert variant="danger" dismissible onClose={() => setUpdateError(null)}>
                {updateError}
              </Alert>
            )}
            {updateSuccess && (
              <Alert variant="success" dismissible onClose={() => setUpdateSuccess(null)}>
                {updateSuccess}
              </Alert>
            )}
          </Col>
        </Row>

        <Row className="actions-buttons">
          {canEditProgram && (
            <>
              <Col xs="auto">
                <Button 
                  variant="danger" 
                  className="remove-btn me-2"
                  onClick={confirmDelete}
                >
                  Удалить черновик
                </Button>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="primary" 
                  className="submit-btn"
                  onClick={handleSubmitProgram}
                >
                  Отправить на модерацию
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Container>

      {/* Initial Values */}
      <Container fluid className="init-values-section">
        <Row>
          <Col>
            <p className="section-caption">Начальные значения регистров:</p>
            <div className="init-inputs">
              <label htmlFor="initT1">t1</label>
              <input 
                id="initT1"
                type="number" 
                value={initT1}
                onChange={(e) => setInitT1(parseInt(e.target.value) || 0)}
                placeholder="00" 
                className="init-input"
                disabled={!canEditProgram}
              />
              <label htmlFor="initT2">t2</label>
              <input 
                id="initT2"
                type="number" 
                value={initT2}
                onChange={(e) => setInitT2(parseInt(e.target.value) || 0)}
                placeholder="00" 
                className="init-input"
                disabled={!canEditProgram}
              />
              {canEditProgram && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="ms-2"
                  onClick={handleUpdateInitialValues}
                >
                  Сохранить
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Commands Table */}
      <Container fluid className="commands-section">
        <Row className="table-header">
          <Col className="table-column-name">
            <p className="column-name-text">Иллюстрация</p>
          </Col>
          <Col className="table-column-name">
            <p className="column-name-text">Название команды</p>
          </Col>
          <Col className="table-column-name">
            <p className="column-name-text">Формат</p>
          </Col>
          <Col className="table-column-name">
            <p className="column-name-text">Регистр-источник</p>
          </Col>
          <Col className="table-column-name">
            <p className="column-name-text">Регистр для результата</p>
          </Col>
          <Col className="table-column-name">
            <p className="column-name-text">Числовой операнд</p>
          </Col>
          {canEditProgram && (
            <Col className="table-column-name">
              <p className="column-name-text">Действия</p>
            </Col>
          )}
        </Row>

        {commandsWithOperands.length === 0 ? (
          <Row>
            <Col>
              <p className="text-center py-4">В программе нет команд</p>
            </Col>
          </Row>
        ) : (
          commandsWithOperands.map((cmdWithOperand: AdaptedCommandWithOperand, index: number) => {
            const command = cmdWithOperand.command;
            if (!command) return null;
            
            const commandId = command.id || 0;
            const currentOperand = operands[commandId] || cmdWithOperand.operand || 0;
            
            return (
              <Row key={commandId || index} className="command-row">
                <Col className="table-cell">
                  {command.img && (
                    <img 
                      src={command.img} 
                      alt={command.com_name}
                      className="command-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </Col>
                <Col className="table-cell">
                  <p className="cell-text">{command.com_name || 'Не указано'}</p>
                </Col>
                <Col className="table-cell">
                  <p className="cell-text">{command.fmt || 'Не указано'}</p>
                </Col>
                <Col className="table-cell">
                  <p className="cell-text">{command.rs_num || 'Не указано'}</p>
                </Col>
                <Col className="table-cell">
                  <p className="cell-text">{command.rd_num || 'Не указано'}</p>
                </Col>
                <Col className="table-cell">
                  <div className="operand-input-wrapper">
                    <input 
                      type="number" 
                      value={currentOperand}
                      onChange={(e) => handleOperandChange(
                        commandId, 
                        parseInt(e.target.value) || 0
                      )}
                      placeholder="Введите значение" 
                      className="operand-input"
                      disabled={!canEditProgram}
                    />
                  </div>
                </Col>
                {canEditProgram && (
                  <Col className="table-cell">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleUpdateOperand(commandId, currentOperand)}
                      disabled={updatingOperandId === commandId}
                    >
                      {updatingOperandId === commandId ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        'Сохранить'
                      )}
                    </Button>
                  </Col>
                )}
              </Row>
            );
          })
        )}
      </Container>

      {/* Results */}
      {(adaptedData.program.res_t1 !== null || adaptedData.program.res_t2 !== null) && (
        <Container fluid className="results-section">
          <Row>
            <Col>
              <p className="section-caption">Результат</p>
              <div className="result-box">
                t1: 0x{(adaptedData.program.res_t1 || 0).toString(16).toUpperCase().padStart(2, '0')}, 
                t2: 0x{(adaptedData.program.res_t2 || 0).toString(16).toUpperCase().padStart(2, '0')}
              </div>
            </Col>
          </Row>
        </Container>
      )}

      {/* Program Info */}
      <Container fluid className="info-section">
        <Row>
          <Col md={4}>
            <div className="info-item">
              <span className="info-label">Дата создания: </span>
              <span className="info-value">
                {formatDate(adaptedData.program.date_create || '')}
              </span>
            </div>
          </Col>
          <Col md={4}>
            <div className="info-item">
              <span className="info-label">Дата обновления: </span>
              <span className="info-value">
                {formatDate(adaptedData.program.date_update || '')}
              </span>
            </div>
          </Col>
          {adaptedData.program.date_finish && adaptedData.program.date_finish.trim() !== '' && (
            <Col md={4}>
              <div className="info-item">
                <span className="info-label">Дата завершения: </span>
                <span className="info-value">
                  {formatDate(adaptedData.program.date_finish)}
                </span>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default ProgramPage;