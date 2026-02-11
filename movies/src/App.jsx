import { useState, useEffect } from 'react';
import moviesData from '../movies.json';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import GenreFilter from './components/GenreFilter';
import RatingFilter from './components/RatingFilter';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [activePage, setActivePage] = useState('home');
    const [selectedMovie, setSelectedMovie] = useState(null);
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
    
    // get unique genres from data
    const genres = [...new Set(moviesData.map(movie => movie.genre))];

    const filteredMovies = moviesData.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(movie.genre);
        
        // handle rating filter with multiple selection support
        const ratingVal = Math.floor(parseFloat(movie.rating));
        
        let matchesRating = true;
        if (selectedRatings.length > 0) {
            if (selectedRatings.includes(5)) {
                // If "5 Stars & Below" is selected, match anything <= 5 OR any other selected rating
                 matchesRating = ratingVal <= 5 || selectedRatings.includes(ratingVal);
            } else {
                matchesRating = selectedRatings.includes(ratingVal);
            }
        }
        
        return matchesSearch && matchesGenre && matchesRating;
    });

    const watchlistMovies = moviesData.filter(movie => watchlist.includes(movie.id));

    return (
        <div className="app">
            <header>
                <h1>Movie Collection</h1>
                <p>Discover amazing movies from our collection</p>

                <div className="page-toggle">
                    <button
                        type="button"
                        className={activePage === 'home' ? 'active' : ''}
                        onClick={() => setActivePage('home')}
                    >
                        Home
                    </button>
                    <button
                        type="button"
                        className={activePage === 'watchlist' ? 'active' : ''}
                        onClick={() => setActivePage('watchlist')}
                    >
                        Watchlist ({watchlist.length})
                    </button>
                </div>
                
                {activePage === 'home' && (
                    <>
                        <input 
                            type="text" 
                            placeholder="Search movies..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />

                        <div className="filter-controls">
                            <GenreFilter 
                                genres={genres} 
                                selectedGenres={selectedGenres} 
                                setSelectedGenres={setSelectedGenres} 
                            />
                            <RatingFilter 
                                selectedRatings={selectedRatings}
                                setSelectedRatings={setSelectedRatings}
                            />
                        </div>
                    </>
                )}
            </header>
            <main>
                {activePage === 'home' && (
                    <div className="movies-grid">
                        {filteredMovies.map(movie => (
                            <MovieCard 
                                key={movie.id} 
                                movie={movie} 
                                isWatchlisted={watchlist.includes(movie.id)}
                                toggleWatchlist={() => toggleWatchlist(movie.id)}
                                onOpen={() => setSelectedMovie(movie)}
                            />
                        ))}
                    </div>
                )}
                {activePage === 'watchlist' && (
                    <div className="movies-grid">
                        {watchlistMovies.length === 0 && (
                            <div className="empty-state">Your watchlist is empty.</div>
                        )}
                        {watchlistMovies.map(movie => (
                            <MovieCard 
                                key={movie.id} 
                                movie={movie} 
                                isWatchlisted={watchlist.includes(movie.id)}
                                toggleWatchlist={() => toggleWatchlist(movie.id)}
                                onOpen={() => setSelectedMovie(movie)}
                            />
                        ))}
                    </div>
                )}
            </main>
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    isWatchlisted={watchlist.includes(selectedMovie.id)}
                    toggleWatchlist={() => toggleWatchlist(selectedMovie.id)}
                />
            )}
        </div>
    );
}

export default App;
