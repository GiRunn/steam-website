// src/App.jsx
import React from 'react';
import { ParallaxProvider } from 'react-scroll-parallax';
import Homepage from './pages/Homepage';

function App() {
  return (
    <ParallaxProvider>
      <Homepage />
    </ParallaxProvider>
  );
}

export default App;