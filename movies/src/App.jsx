import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Watchlist from './pages/Watchlist';
import MovieModal from './pages/MovieModal';

function App() {
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem('watchlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const toggleWatchlist = (movieId) => {
        setWatchlist(prev => 
            prev.includes(movieId) 
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
    };

    return (
        <Routes>
            <Route path="/" element={<Layout watchlistCount={watchlist.length} />}>
                <Route index element={<Home watchlist={watchlist} toggleWatchlist={toggleWatchlist} />} />
                <Route path="watchlist" element={<Watchlist watchlist={watchlist} toggleWatchlist={toggleWatchlist} />} />
                <Route path="movie/:id" element={<MovieModal watchlist={watchlist} toggleWatchlist={toggleWatchlist} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
