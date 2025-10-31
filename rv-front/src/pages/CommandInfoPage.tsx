import "./CommandInfoPage.css";
import { type FC, useState, useEffect } from "react";
import { 
  Container, 
  Spinner
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { type Command, getCommandById } from "../modules/commandsApi";
import { Navigation } from "../components/Navigation";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { ROUTES, ROUTE_LABELS } from "../Routes";
import { COMMANDS_MOCK } from "../modules/mock";

export const CommandDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [command, setCommand] = useState<Command | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCommand(parseInt(id));
    }
  }, [id]);

  const loadCommand = async (commandId: number) => {
    setLoading(true);
    try {
      const data = await getCommandById(commandId);
      setCommand(data);
    } catch (error) {
      console.error("Ошибка при загрузке команды:", error);
      const data = COMMANDS_MOCK[commandId];
      setCommand(data);
    } finally {
      setLoading(false);
    }
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

  if (!command) {
    return (
      <div className="command-detail-page">
        <Navigation />
        <div className="error-container">
          <h2>Команда не найдена</h2>
          <p>Запрошенная команда не существует или была удалена</p>
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
        <BreadCrumbs crumbs={[
          { label: ROUTE_LABELS.COMMANDS, path: ROUTES.COMMANDS },
          { label: ROUTE_LABELS.COMMANDS_INFO}
          ]} />
      </Container>

      {/* Command Details */}
      <Container fluid className="command-details-container">
            <div className="command-detail-card">
              <img 
                src={command.img} 
                className="command-detail-image"
                alt={command.com_name}
              />
              
              <div className="detail-field-group">
                <div className="detail-field-label">Название команды</div>
                <div className="detail-field-value">{command.com_name}</div>
              </div>
              
              <div className="detail-field-group">
                <div className="detail-field-label">Формат</div>
                <div className="detail-field-value">{command.fmt}</div>
              </div>
              
              <div className="detail-field-group">
                <div className="detail-field-label">№ регистра rs</div>
                <div className="detail-field-value">{command.rs_num}</div>
              </div>
              
              <div className="detail-field-group">
                <div className="detail-field-label">№ регистра rd</div>
                <div className="detail-field-value">{command.rd_num}</div>
              </div>
              
              <div className="detail-field-group">
                <div className="detail-field-label">Описание команды</div>
                <div className="detail-field-value description-text">
                  {command.description || "Описание отсутствует"}
                </div>
              </div>
            </div>
      </Container>
    </div>
  );
};

export default CommandDetailPage;