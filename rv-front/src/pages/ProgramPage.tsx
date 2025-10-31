import "./ProgramPage.css";
import { type FC, useState, useEffect } from "react";
import { 
  Container,
  Row,
  Col,
  Button,
  Form
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";

interface ProgramCommand {
  id: number;
  img: string;
  comName: string;
  fmt: string;
  rsNum: number;
  rdNum: number;
}

interface ProgramData {
  id: number;
  init_t1?: number;
  init_t2?: number;
  res_t1?: number;
  res_t2?: number;
}

interface ProgramPageData {
  program: ProgramData;
  commands: ProgramCommand[];
  operands: number[]; // Предположение: массив операндов по commandId
}

export const ProgramPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [programData, setProgramData] = useState<ProgramPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initT1, setInitT1] = useState<number>(0);
  const [initT2, setInitT2] = useState<number>(0);
  const [operands, setOperands] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (id) {
      loadProgramData(parseInt(id));
    }
  }, [id]);

  // TODO: Реализовать получение данных программы с бекенда
  const loadProgramData = async (programId: number) => {
    setLoading(true);
    try {
      // Заглушка - заменить на реальный API вызов
      const mockData: ProgramPageData = {
        program: {
          id: programId,
          init_t1: 0,
          init_t2: 0,
          res_t1: 0xEE, // Пример результатов
          res_t2: 0x1F
        },
        commands: [
          {
            id: 1,
            img: "http://127.0.0.1:9000/rvimg/command1.png",
            comName: "ADD",
            fmt: "R",
            rsNum: 1,
            rdNum: 2
          },
          {
            id: 2,
            img: "http://127.0.0.1:9000/rvimg/command2.png", 
            comName: "SUB",
            fmt: "R",
            rsNum: 2,
            rdNum: 3
          }
        ],
        operands: [10, 20] // Пример операндов
      };
      
      setProgramData(mockData);
      setInitT1(mockData.program.init_t1 || 0);
      setInitT2(mockData.program.init_t2 || 0);
      
      // Инициализируем операнды
      const initialOperands: { [key: number]: number } = {};
      mockData.commands.forEach((cmd, index) => {
        initialOperands[cmd.id] = mockData.operands[index] || 0;
      });
      setOperands(initialOperands);
      
    } catch (error) {
      console.error("Ошибка при загрузке программы:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProgram = async () => {
    if (!programData) return;
    
    try {
      // TODO: Реализовать вызов API для удаления программы
      console.log("Удаляем программу:", programData.program.id);
      
      // После удаления переходим на главную
      navigate('/commands');
    } catch (error) {
      console.error("Ошибка при удалении программы:", error);
    }
  };

  const handleOperandChange = (commandId: number, value: number) => {
    setOperands(prev => ({
      ...prev,
      [commandId]: value
    }));
  };

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!programData) {
    return <div>Программа не найдена</div>;
  }

  return (
    <div className="program-page">
      {/* Header */}
      <Navigation />

      {/* Breadcrumbs */}
      <Container fluid className="breadcrumbs-section">
        <BreadCrumbs crumbs={[
            { label: ROUTE_LABELS.COMMANDS, path: ROUTES.COMMANDS },
            { label: ROUTE_LABELS.PROGRAM }]} />
      </Container>

      {/* Remove Program Button */}
      <Container fluid className="actions-section">
        <Row>
          <Col>
            <Button 
              variant="danger" 
              className="remove-btn"
              onClick={handleRemoveProgram}
            >
              Удалить заявку
            </Button>
          </Col>
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
              />
              <label htmlFor="initT2">t2</label>
              <input 
                id="initT2"
                type="number" 
                value={initT2}
                onChange={(e) => setInitT2(parseInt(e.target.value) || 0)}
                placeholder="00" 
                className="init-input"
              />
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
        </Row>

        {programData.commands.map((command) => (
          <Row key={command.id} className="command-row">
            <Col className="table-cell">
              <img 
                src={command.img} 
                alt={command.comName}
                className="command-image"
              />
            </Col>
            <Col className="table-cell">
              <p className="cell-text">{command.comName}</p>
            </Col>
            <Col className="table-cell">
              <p className="cell-text">{command.fmt}</p>
            </Col>
            <Col className="table-cell">
              <p className="cell-text">{command.rsNum}</p>
            </Col>
            <Col className="table-cell">
              <p className="cell-text">{command.rdNum}</p>
            </Col>
            <Col className="table-cell">
              <input 
                type="number" 
                value={operands[command.id] || 0}
                onChange={(e) => handleOperandChange(
                  command.id, 
                  parseInt(e.target.value) || 0
                )}
                placeholder="Введите значение" 
                className="operand-input"
              />
            </Col>
          </Row>
        ))}
      </Container>

      {/* Results */}
      <Container fluid className="results-section">
        <Row>
          <Col>
            <p className="section-caption">Результат</p>
            <div className="result-box">
              t1: 0x{programData.program.res_t1?.toString(16).toUpperCase() || '0'}, 
              t2: 0x{programData.program.res_t2?.toString(16).toUpperCase() || '0'}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProgramPage;