import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

console.log('Main.jsx is loading...');
const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
  ReactDOM.createRoot(root).render(<App />);
  console.log('App should be rendered now');
} else {
  console.error('Root element not found!');
}