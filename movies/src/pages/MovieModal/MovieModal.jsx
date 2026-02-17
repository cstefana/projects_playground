import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import moviesData from '../../../movies.json';
import defaultImage from '../../assets/default.jpg';
import './MovieModal.css';

function MovieModal({ watchlist, toggleWatchlist }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const movie = moviesData.find((m) => m.id === Number(id));

    useEffect(() => {
        if (!movie) {
            navigate('/', { replace: true });
        }
    }, [movie, navigate]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    if (!movie) return null;

    const getImageSrc = (imageName) => {
        if (!imageName) return defaultImage;
        try {
            return new URL(`../../assets/${imageName}`, import.meta.url).href;
        } catch {
            return defaultImage;
        }
    };

    const getGenreColor = (genre) => {
        const colors = {
            action: '#ff6b6b',
            drama: '#4ecdc4',
            fantasy: '#45b7d1',
            horror: '#96ceb4',
            adventure: '#feca57',
            comedy: '#ff9ff3',
            thriller: '#54a0ff'
        };
        return colors[genre.toLowerCase()] || '#8e44ad';
    };

    const getRatingColor = (rating) => {
        const ratingNum = parseFloat(rating);
        if (ratingNum >= 8) return '#2ecc71';
        if (ratingNum >= 6) return '#f39c12';
        return '#e74c3c';
    };

    const isWatchlisted = watchlist.includes(movie.id);

    return (
        <div className="movie-modal-backdrop" onClick={() => navigate(-1)}>
            <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" type="button" onClick={() => navigate(-1)}>
                    Close
                </button>
                <div className="modal-content">
                    <div className="modal-image">
                        <img
                            src={getImageSrc(movie.image)}
                            alt={movie.title}
                            onError={(e) => { e.target.src = defaultImage; }}
                        />
                    </div>
                    <div className="modal-details">
                        <h2 className="modal-title">{movie.title}</h2>
                        <div className="modal-meta">
                            <span
                                className="modal-genre"
                                style={{ backgroundColor: getGenreColor(movie.genre) }}
                            >
                                {movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}
                            </span>
                            <span
                                className="modal-rating"
                                style={{ color: getRatingColor(movie.rating) }}
                            >
                                ★ {movie.rating}
                            </span>
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className={`modal-watchlist ${isWatchlisted ? 'active' : ''}`}
                                onClick={() => toggleWatchlist(movie.id)}
                            >
                                {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieModal;
