import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import ProjectView from './pages/ProjectView';
import ProjectReport from './pages/ProjectReport'; // Importe o relatório aqui

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/CreateProject" element={<CreateProject />} />
                <Route path="/ProjectView" element={<ProjectView />} />

                {/* Esta é a linha que estava faltando para o erro sumir */}
                <Route path="/ProjectReport" element={<ProjectReport />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;