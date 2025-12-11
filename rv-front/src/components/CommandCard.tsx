import { type FC } from 'react'
import { Card, Button } from 'react-bootstrap'
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
    img, 
    comName, 
    fmt, 
    rsNum, 
    rdNum, 
    onDetailsClick,
}) => {

    return (
        <Card className="custom-command-card">
            <Card.Img 
                variant="top" 
                src={img} 
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
                
            </Card.Body>
        </Card>
    );
};