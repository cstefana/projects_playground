import { useEffect } from 'react';
import './MovieModal.css';
import defaultImage from '../../assets/default.jpg';

function MovieModal({ movie, onClose, isWatchlisted, toggleWatchlist }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!movie) {
        return null;
    }

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

    return (
        <div className="movie-modal-backdrop" onClick={onClose}>
            <div className="movie-modal" onClick={(event) => event.stopPropagation()}>
                <button className="modal-close" type="button" onClick={onClose}>
                    Close
                </button>
                <div className="modal-content">
                    <div className="modal-image">
                        <img
                            src={getImageSrc(movie.image)}
                            alt={movie.title}
                            onError={(event) => {
                                event.target.src = defaultImage;
                            }}
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
                                ⭐ {movie.rating}
                            </span>
                        </div>
                        <div className="modal-actions">
                            <button
                                type="button"
                                className={`modal-watchlist ${isWatchlisted ? 'active' : ''}`}
                                onClick={toggleWatchlist}
                            >
                                {isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieModal;
