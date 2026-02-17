import { useNavigate } from 'react-router-dom';
import moviesData from '../../../movies.json';
import MovieCard from '../../components/MovieCard';
import './Watchlist.css';

function Watchlist({ watchlist, toggleWatchlist }) {
    const navigate = useNavigate();
    
    const watchlistMovies = moviesData.filter(movie => watchlist.includes(movie.id));

    return (
        <div className="watchlist-page">
            {watchlistMovies.length === 0 ? (
                <div className="empty-state">
                    <h2>Your watchlist is empty</h2>
                    <p>Add movies to your watchlist from the home page to see them here.</p>
                </div>
            ) : (
                <div className="movies-grid">
                    {watchlistMovies.map(movie => (
                        <MovieCard 
                            key={movie.id} 
                            movie={movie} 
                            isWatchlisted={watchlist.includes(movie.id)}
                            toggleWatchlist={() => toggleWatchlist(movie.id)}
                            onOpen={() => navigate(`/movie/${movie.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Watchlist;