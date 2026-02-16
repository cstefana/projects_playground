import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './index.css';

const entryPoint = document.getElementById('root');
ReactDOM.createRoot(entryPoint).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
);
