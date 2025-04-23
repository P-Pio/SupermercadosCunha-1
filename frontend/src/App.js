import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Header from "./components/layout/Header";
import Cadastros from "./pages/Cadastros";
import VisualizacaoGeral from "./pages/VisualizacaoGeral";
import VisualizacaoAutomatica from "./pages/VisualizacaoAutomatica";
import HomePage from "./pages/Homepage";
import "./App.css";
import theme from "./Theme/CustomTheme";

// Animated page wrapper
const AnimatedPage = ({ children }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10
    },
    in: {
      opacity: 1,
      y: 0
    },
    out: {
      opacity: 0,
      y: -10
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

// AnimatedRoutes component to handle route transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <AnimatedPage>
              <HomePage />
            </AnimatedPage>
          } 
        />
        <Route 
          path="/cadastros" 
          element={
            <AnimatedPage>
              <Cadastros />
            </AnimatedPage>
          } 
        />
        <Route 
          path="/visualizacao-geral" 
          element={
            <AnimatedPage>
              <VisualizacaoGeral />
            </AnimatedPage>
          } 
        />
        <Route 
          path="/visualizacao-automatica" 
          element={
            <AnimatedPage>
              <VisualizacaoAutomatica />
            </AnimatedPage>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <div className="app-container">
          <div className="sidebar">
            <Sidebar />
          </div>
          <div className="main-content">
            <Header />
            <AnimatedRoutes />
          </div>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
