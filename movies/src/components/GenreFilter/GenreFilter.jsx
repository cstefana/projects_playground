import { useState, useRef, useEffect } from 'react';
import './GenreFilter.css';

function GenreFilter({ genres, selectedGenres, setSelectedGenres }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter(g => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]); // if genre is not here, add it
        }
    };

    return (
        <div className="filter-container" ref={dropdownRef}>
            <div 
                className={`custom-dropdown ${isOpen ? 'open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedGenres.length === 0 
                    ? "Select Genres" 
                    : `${selectedGenres.length} Genre(s)`}
                <span className="arrow">▼</span>
            </div>
            
            {isOpen && (
                <div className="dropdown-options">
                    {genres.map(genre => (
                        <label key={genre} className="option-label">
                            <input 
                                type="checkbox"
                                checked={selectedGenres.includes(genre)}
                                onChange={() => toggleGenre(genre)}
                            />
                            {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GenreFilter;