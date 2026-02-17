import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moviesData from '../../../movies.json';
import MovieCard from '../../components/MovieCard';
import GenreFilter from '../../components/GenreFilter';
import RatingFilter from '../../components/RatingFilter';
import './Home.css';

function Home({ watchlist, toggleWatchlist }) {
    const location = useLocation();
    const navigate = useNavigate();
    
    // helper function to parse query parameters
    const getQueryParams = useCallback(() => {
        const params = new URLSearchParams(location.search);
        return {
            search: params.get('search') || '',
            genres: params.get('genres') ? params.get('genres').split(',') : [],
            ratings: params.get('ratings') ? params.get('ratings').split(',').map(r => parseInt(r)) : []
        };
    }, [location.search]);

    // helper function to update URL with current filters
    const updateURL = useCallback((filters) => {
        // Only update URL if we're on the home page
        if (location.pathname !== '/') return;

        const params = new URLSearchParams();
        
        if (filters.search) {
            params.set('search', filters.search);
        }
        if (filters.genres.length > 0) {
            params.set('genres', filters.genres.join(','));
        }
        if (filters.ratings.length > 0) {
            params.set('ratings', filters.ratings.join(','));
        }
        
        const newSearch = params.toString();
        const newURL = newSearch ? `/?${newSearch}` : '/';
        
        navigate(newURL, { replace: true });
    }, [navigate, location.pathname]);

    // initialize state from URL query parameters
    const initialFilters = getQueryParams();
    const [searchTerm, setSearchTerm] = useState(initialFilters.search);
    const [selectedGenres, setSelectedGenres] = useState(initialFilters.genres);
    const [selectedRatings, setSelectedRatings] = useState(initialFilters.ratings);

    // update state when URL changes
    useEffect(() => {
        const queryFilters = getQueryParams();
        setSearchTerm(queryFilters.search);
        setSelectedGenres(queryFilters.genres);
        setSelectedRatings(queryFilters.ratings);
    }, [getQueryParams]);

    // update URL when filters change
    useEffect(() => {
        const filters = {
            search: searchTerm,
            genres: selectedGenres,
            ratings: selectedRatings
        };
        updateURL(filters);
    }, [searchTerm, selectedGenres, selectedRatings, updateURL]);
    
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

    return (
        <div className="home-page">
            <div className="filters-section">
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

                {(searchTerm || selectedGenres.length > 0 || selectedRatings.length > 0) && (
                    <button
                        type="button"
                        className="clear-filters"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedGenres([]);
                            setSelectedRatings([]);
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="movies-grid">
                {filteredMovies.map(movie => (
                    <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        isWatchlisted={watchlist.includes(movie.id)}
                        toggleWatchlist={() => toggleWatchlist(movie.id)}
                        onOpen={() => navigate(`/movie/${movie.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Home;