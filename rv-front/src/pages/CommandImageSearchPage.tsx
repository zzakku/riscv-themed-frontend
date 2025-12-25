import { type FC, useState, useRef, useEffect } from 'react';
import { Button, ProgressBar, Container, Alert, Spinner } from 'react-bootstrap';
import { useCommandSearch } from '../store/hooks/useCommandSearch';
import { COMMANDS_MOCK } from '../modules/mock';
import { ROUTE_LABELS } from "../Routes";
import { BreadCrumbs } from "../components/BreadCrumbs";
import { Navigation } from "../components/Navigation";
import './CommandImageSearchPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { getCommands } from '../store/slices/commandSlice';

export const CommandImageSearchPage: FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  // Получаем данные из Redux
  const { commands, loading, error } = useAppSelector((state) => state.commands);

  // Определяем какие данные использовать
  const displayCommands = useMockData ? COMMANDS_MOCK : commands;

  // Загружаем команды при монтировании
  useEffect(() => {
    dispatch(getCommands({ query: '' }))
      .unwrap()
      .catch((error) => {
        console.error("Ошибка загрузки команд:", error);
        setUseMockData(true);
      });
  }, [dispatch]);

  // Передаем команды в хук поиска
  const { 
    items, 
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
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    resetSearch();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUseMockData = () => {
    setUseMockData(true);
  };

  const uploadLabel = ready ? 'Загрузить фото' : 'Загрузка нейросети...';
  const isUploadDisabled = !ready || loading;
  const canReset = Boolean(selectedImage);

  return (
    <div className="command-img-search-page">
      {/* Хедер и навбар */}
      <Navigation />

      <Container fluid className="navigation-section">
        <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.IMAGE_SEARCH }]} />
        <h1>ИИ-поиск команд</h1>
        <p className="text-muted">Загрузите фото, чтобы найти похожую команду</p>
      </Container>

      {error && !useMockData && (
        <Alert variant="warning" className="mx-3 mb-4">
          <Alert.Heading>Ошибка загрузки команд</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-warning" size="sm" onClick={handleUseMockData}>
              Использовать демо-данные
            </Button>
          </div>
        </Alert>
      )}

      {useMockData && (
        <Alert variant="info" className="mx-3 mb-4">
          Используются демонстрационные данные
        </Alert>
      )}

      <div className="search-section">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          disabled={isUploadDisabled}
        />

        <div style={{ flexShrink: 0 }}>
            {selectedImage ? (
                <img src={selectedImage} alt="Query" className="preview-image" />
            ) : (
                <div className="placeholder-image">
                  {loading ? 'Загрузка...' : 'Нет фото'}
                </div>
            )}
        </div>

        <div className="action-panel">
            <Button 
              className="action-btn" 
              variant="primary" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploadDisabled}
            >
                {isUploadDisabled && loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Загрузка...
                  </>
                ) : uploadLabel}
            </Button>

            {!ready && (
              <ProgressBar 
                className="action-progress" 
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
            
            <Button 
              className="action-btn" 
              variant="outline-danger" 
              onClick={handleClear} 
              disabled={!canReset}
            >
              Сбросить
            </Button>
        </div>
      </div>

      <div className="items-list">
        {items.length === 0 && !loading ? (
          <div className="no-commands text-center py-5">
            <h5>Команды не найдены</h5>
            <p className="text-muted">
              {useMockData 
                ? "Нет доступных демонстрационных данных" 
                : "Попробуйте загрузить другое изображение"}
            </p>
          </div>
        ) : (
          items.map((item) => {
            if (!item.isVisible) return null;

            return (
              <div key={item.id} className="command-row">
                <img src={item.img} alt={item.com_name} className="row-image" />
                
                <div className="row-content">
                  <h5>{item.com_name}</h5>
                  <p className="text-muted mb-1">{item.description}</p>
                  <em>Формат: </em>
                  <strong className="text-primary">{item.fmt} </strong>
                  <em>№ регистра rs: </em>
                  <strong className="text-primary">{item.rs_num} </strong>
                  <em>№ регистра rd: </em>
                  <strong className="text-primary">{item.rd_num}</strong>
                </div>

                <div className="row-stats">
                  <div>
                    Сходство: 
                    <span className="similarity-value">
                      { ` ${(item.score * 100).toFixed(1)}%`}
                    </span>
                  </div>
                  
                  {item.embedding && (
                    <div className="embed-preview-text">
                      <strong>Text Embed:</strong><br/>
                      [{item.embedding.slice(0, 5).map(n => n.toFixed(3)).join(', ')}...]
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommandImageSearchPage;