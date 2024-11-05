import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Cadastros from "./pages/Cadastros"; // Ensure this path is correct
import VisualizacaoGeral from "./pages/VisualizacaoGeral"; // Adjust path as necessary
import HomePage from "./pages/Homepage";
import "./App.css"; // Ensure the CSS file is correctly imported
import theme from "./Theme/CustomTheme";


function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <div className="app-container">
          <div className="sidebar">
            <Sidebar />
          </div>
          <div className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cadastros" element={<Cadastros />} />
              <Route
                path="/visualizacao-geral"
                element={<VisualizacaoGeral />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
