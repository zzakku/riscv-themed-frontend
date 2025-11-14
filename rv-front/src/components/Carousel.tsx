import { type FC } from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Carousel.css';
import defaultImage1 from "../assets/1.png";
import defaultImage2 from "../assets/2.jpg";
import defaultImage3 from "../assets/3.jpg";

export const CustomCarousel: FC = () => {
  return (
    <Carousel variant="dark" className="custom-carousel">
      <Carousel.Item interval={10000}>
        <img 
          className="d-block w-100 carousel-image"
          src={defaultImage1}
          alt="Программирование на ассемблере RISC-V"
        />
        <Carousel.Caption>
          <h5>Поиск</h5>
          <p>Изучите каталог доступных команд</p>
        </Carousel.Caption>
      </Carousel.Item>
      
      <Carousel.Item interval={2000}>
        <img
          className="d-block w-100 carousel-image"
          src={defaultImage2}
          alt="Программирование 2"
        />
        <Carousel.Caption>
          <h5>Программы</h5>
          <p>Составьте программу на ассемблере RISC-V</p>
        </Carousel.Caption>
      </Carousel.Item>
      
      <Carousel.Item>
        <img
          className="d-block w-100 carousel-image"
          src={defaultImage3}
          alt="Logs"
        />
        <Carousel.Caption>
          <h5>Сохранение</h5>
          <p>Изучите полученные в прошлом значения</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};