import './MovieCard.css';
import defaultImage from '../../assets/default.jpg';

function MovieCard({ movie, isWatchlisted, toggleWatchlist, onOpen }) {
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
        <div
            key={movie.id}
            className={`movie-card ${isWatchlisted ? 'watchlisted' : ''}`}
            onClick={onOpen}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div className="movie-image">
                <img 
                    src={getImageSrc(movie.image)} 
                    alt={movie.title}
                    onError={(e) => {
                        e.target.src = defaultImage;
                    }}
                />
                <button 
                    className={`watchlist-btn ${isWatchlisted ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist();
                    }}
                >
                    {isWatchlisted ? 'In watchlist' : 'Add to watchlist'}
                </button>
            </div>
            <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <div className="movie-details">
                    <span 
                        className="movie-genre" 
                        style={{ backgroundColor: getGenreColor(movie.genre) }}
                    >
                        {movie.genre.charAt(0).toUpperCase() + movie.genre.slice(1)}
                    </span>
                    <span 
                        className="movie-rating"
                        style={{ color: getRatingColor(movie.rating) }}
                    >
                        ⭐ {movie.rating}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MovieCard;