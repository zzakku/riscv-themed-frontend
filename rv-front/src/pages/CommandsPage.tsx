import "./CommandsPage.css";
import { type FC, useState, useEffect } from "react";
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Spinner
} from "react-bootstrap";
import { CommandCard } from "../components/CommandCard";
import { type Command, getAllCommands } from "../modules/commandsApi";
import { useNavigate } from "react-router-dom";
import { ROUTE_LABELS } from "../Routes";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { Navigation } from "../components/Navigation";
import { COMMANDS_MOCK } from "../modules/mock";

interface CommandsPageProps {
  cartCount?: number;
  programID?: string;
}

export const CommandsPage: FC<CommandsPageProps> = ({ 
  cartCount = 0, 
  programID = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCommands();
  }, []);

  const loadCommands = async (query: string = "") => {
    setLoading(true);
    try {
      const data = await getAllCommands(query);
      setCommands(data);
    } catch (error) {
      console.error("Ошибка при загрузке команд:", error);
      setCommands(
        COMMANDS_MOCK.filter((item) =>
          item.com_name
            .toLocaleLowerCase()
            .startsWith(searchQuery.toLocaleLowerCase())
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    await loadCommands(searchQuery);
    setSearchLoading(false);
  };

  const handleDetailsClick = (id: number) => {
    navigate(`/commands/${id}`);
  };

  const handleAddToProgram = async (commandId: number) => {
    try {
      // Здесь будет вызов API для добавления команды в программу
      console.log("Добавляем команду в программу:", commandId);
    } catch (error) {
      console.error("Ошибка при добавлении команды:", error);
    }
  };

  const handleCartClick = () => {
    if (cartCount > 0 && programID) {
      navigate(`/program/${programID}`);
    }
  };

  return (
    <div className="commands-page">
      {/* Header с Navbar */}
      <Navigation />

      <Container fluid className="navigation-section">
        <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.COMMANDS }]} />
        <Row className="justify-content-between align-items-center navigation-row">
          <Col xs={12} lg={9} xl={10}>
            <Form onSubmit={handleSearch} className="custom-search-form">
              <Row className="g-2 align-items-center">
                <Col xs={12} md={8} lg={9}>
                  <div className="search-input-wrapper">
                    <Form.Control
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск"
                      className="custom-search-input mag-glass"
                      disabled={searchLoading}
                    />
                  </div>
                </Col>
                <Col xs={12} md={4} lg={3}>
                  <Button 
                    type="submit" 
                    className="custom-search-btn"
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
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
                </Col>
              </Row>
            </Form>
          </Col>
          
          {/* Cart Icon - справа */}
          <Col xs="auto" className="cart-col">
            <div 
              className="cart-icon-wrapper" 
              onClick={handleCartClick}
              style={{ cursor: cartCount > 0 ? 'pointer' : 'default' }}
            >
              <svg width="38" height="34" viewBox="0 0 38 34" fill="none">
                <path d="M24 32H26.5V33.25H11.5V32H14L15.25 28.25H22.75L24 32ZM37.75 0.75V27H0.25V0.75H37.75ZM35.25 3.25H2.75V24.5H35.25V3.25ZM34 23.25H4V4.5H34V23.25ZM7.75 9.5H17.75V8.25H7.75V9.5ZM12.75 18.25H7.75V19.5H12.75V18.25ZM22.75 15.75H11.5V17H22.75V15.75ZM22.75 13.25H11.5V14.5H22.75V13.25ZM24 10.75H11.5V12H24V10.75Z" fill="#111918"/>
              </svg>
              {cartCount > 0 && (
                <div className="cart-badge">
                  {cartCount}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Commands Grid */}
      <Container fluid className="commands-container">
        {loading ? (
          <div className="loading-wrapper">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </Spinner>
          </div>
        ) : (
          <div className="commands-grid">
            {commands.map((command) => (
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
                />
              </div>
            ))}
            
            {commands.length === 0 && !loading && (
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