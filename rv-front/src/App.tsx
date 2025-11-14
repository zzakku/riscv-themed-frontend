import './App.css'
import { MainPage } from './pages/MainPage';
import CommandsPage from './pages/CommandsPage';
import CommandInfoPage from './pages/CommandInfoPage';
import { ROUTES } from './Routes';
import { type FC } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BASE_PATH } from './target_config';

const App: FC = () => {
  return (
    <BrowserRouter basename = {BASE_PATH}>
      <div className="App">
        <Routes>
          <Route path={ROUTES.HOME} element={<MainPage />} />
          <Route path={ROUTES.COMMANDS} element={<CommandsPage />} />
          <Route path={ROUTES.COMMANDS_INFO} element={<CommandInfoPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App
