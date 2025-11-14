import { type FC } from 'react'
import { Card, Button, Form } from 'react-bootstrap'
import "./CommandCard.css"

interface Props {
    id: number
    img: string
    comName: string
    fmt: string
    rsNum: number
    rdNum: number
    onDetailsClick: () => void
    onAddToProgram: () => void
}

export const CommandCard: FC<Props> = ({ 
    id, 
    img, 
    comName, 
    fmt, 
    rsNum, 
    rdNum, 
    onDetailsClick, 
    onAddToProgram 
}) => {
    const handleAddToProgram = (e: React.FormEvent) => {
        e.preventDefault();
        onAddToProgram();
    };

    const processImageUrl = (url: string) => {
        if (!url) return '';
        
        const localhostPatterns = [
            /http:\/\/localhost(?::\d+)?/,
            /http:\/\/127.0.0.1(?::\d+)?/,
            /http:\/\/0.0.0.0(?::\d+)?/,
            /http:\/\/::1(?::\d+)?/
        ];
        
        let processedUrl = url;
        localhostPatterns.forEach(pattern => {
            if (pattern.test(url)) {
            const currentHost = window.location.host;
            processedUrl = url.replace(pattern, `https://${currentHost}`);
            }
        });
        
        return processedUrl;
    };

    return (
        <Card className="custom-command-card">
            <Card.Img 
                variant="top" 
                src={processImageUrl(img)} 
                className="custom-card-image"
                alt={comName}
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
                >
                    Подробнее
                </Button>
                
                <Form onSubmit={handleAddToProgram} className="w-100">
                    <input type="hidden" name="command_id" value={id} />
                    <Button 
                        type="submit" 
                        className="custom-card-btn my-btn" 
                        variant="outline-primary"
                    >
                        Добавить в программу
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};