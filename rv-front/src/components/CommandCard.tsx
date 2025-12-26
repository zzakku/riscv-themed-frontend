import { type FC } from 'react'
import { Card, Button, Spinner } from 'react-bootstrap'
import "./CommandCard.css"
import defaultImage1 from "../assets/1.png";
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';


interface Props {
    id?: number
    img?: string
    comName?: string
    fmt?: string
    rsNum?: number
    rdNum?: number
    onDetailsClick: () => void
    onAddToProgram: () => void
    isAddingToProgram?: boolean
    disabled?: boolean
}

export const CommandCard: FC<Props> = ({ 
    img, 
    comName, 
    fmt, 
    rsNum, 
    rdNum, 
    onDetailsClick,
    onAddToProgram,
    isAddingToProgram = false,
    disabled = false
}) => {

  const { isAuthenticated } = useSelector((state: RootState) => state.users);

    const processImageUrl = (url: string | undefined) => {
        if (!url) return '';
        
        // const localhostPatterns = [
        //     /http:\/\/localhost(?::\d+)?/,
        //     /http:\/\/127.0.0.1(?::\d+)?/,
        //     /http:\/\/0.0.0.0(?::\d+)?/,
        //     /http:\/\/::1(?::\d+)?/
        // ];
        
        // let processedUrl = url;
        // localhostPatterns.forEach(pattern => {
        //     if (pattern.test(url)) {
        //     const currentHost = window.location.host;
        //     processedUrl = url.replace(pattern, `https://${currentHost}`);
        //     }
        // });
        
        // return processedUrl;

        let processedUrl = url.replace('9000','8081/minio');

        return processedUrl;
    };

    return (
        <Card className="custom-command-card">
            <Card.Img 
                variant="top" 
                src={processImageUrl(img)} 
                className="custom-card-image"
                alt={comName}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultImage1;
                }}
            />
            
            <Card.Body className="custom-card-body p-0">
                <div className="field-group">
                    <div className="field-label">Название команды</div>
                    <div className="field-value">{comName}</div>
                </div>
                
                <div className="field-group">
                    <div className="field-label">Формат</div>
                    <div className="field-value">{fmt}</div>
                </div>
                
                <div className="field-group">
                    <div className="field-label">№ регистра rs</div>
                    <div className="field-value">{rsNum}</div>
                </div>
                
                <div className="field-group">
                    <div className="field-label">№ регистра rd</div>
                    <div className="field-value">{rdNum}</div>
                </div>
                
                <Button 
                    className="custom-card-btn my-btn" 
                    onClick={onDetailsClick}
                    disabled={disabled}
                >
                    Подробнее
                </Button>
                {isAuthenticated && (
                <Button 
                    className="custom-card-btn my-btn" 
                    onClick={onAddToProgram}
                    disabled={disabled || isAddingToProgram || !isAuthenticated}
                >
                    {isAddingToProgram ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Добавление...
                        </>
                    ) : 'Добавить в программу'}
                </Button>
                )}
            </Card.Body>
        </Card>
    );
};