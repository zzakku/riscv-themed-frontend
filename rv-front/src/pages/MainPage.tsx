import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ROUTES, ROUTE_LABELS } from '../Routes';
import './MainPage.css';
import { Navigation } from '../components/Navigation';
import { BreadCrumbs } from '../components/BreadCrumbs';

export const MainPage: FC = () => {
  return (
    <div className="mainpage">
      <div className="standartpage">
          <Navigation />
          <Container fluid className="breadcrumbs-section">
            <BreadCrumbs crumbs={[]} />
          </Container>
          <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <Card className="home-card">
                <Card.Body className="text-center">
                  <h1 className="home-main-title mb-4">Ассемблер RISC-V</h1>
                  
                  <div className="welcome-section mb-4">
                    <p className="welcome-text">
                      Добро пожаловать в веб-сервис для программирования на ассемблере RISC-V! 
                      Здесь вы сможете составить простую программу и запросить её выполнение
                      с предоставлением результатов.
                    </p>
                  </div>

                  <hr className="divider my-4" />

                  <div className="reactions-section">
                    <h2 className="reactions-title mb-3">Список команд</h2>
                    
                    <Link to={ROUTES.COMMANDS}>
                      <Button variant="primary" size="lg" className="commands-btn">
                        Перейти к списку команд
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};