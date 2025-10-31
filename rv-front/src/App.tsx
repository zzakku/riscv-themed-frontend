import './App.css'
import { MainPage } from './pages/MainPage';
import CommandsPage from './pages/CommandsPage';
import CommandInfoPage from './pages/CommandInfoPage';
import ProgramPage from './pages/ProgramPage'
import { ROUTES } from './Routes';
import { type FC } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App: FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path={ROUTES.HOME} element={<MainPage />} />
          <Route path={ROUTES.COMMANDS} element={<CommandsPage />} />
          <Route path={ROUTES.COMMANDS_INFO} element={<CommandInfoPage />} />
          <Route path={ROUTES.PROGRAM} element={<ProgramPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App
