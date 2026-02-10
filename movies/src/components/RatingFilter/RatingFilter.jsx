import { useState, useRef, useEffect } from 'react';
import './RatingFilter.css';

function RatingFilter({ selectedRatings, setSelectedRatings }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // we'll define ratings as integer buckets for multi-select
    const ratings = [
        { label: '9 Stars', value: 9 },
        { label: '8 Stars', value: 8 },
        { label: '7 Stars', value: 7 },
        { label: '6 Stars', value: 6 },
        { label: '5 Stars & Below', value: 5 }, // catch-all for lower
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleRating = (value) => {
        // exact integer match for main ones
        
        if (selectedRatings.includes(value)) {
            setSelectedRatings(selectedRatings.filter(r => r !== value));
        } else {
            setSelectedRatings([...selectedRatings, value]);
        }
    };

    return (
        <div className="rating-filter-container" ref={dropdownRef}>
             <div 
                className={`custom-dropdown ${isOpen ? 'open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedRatings.length === 0 
                    ? "Select Ratings" 
                    : `${selectedRatings.length} Rating(s)`}
                <span className="arrow">▼</span>
            </div>
            
            {isOpen && (
                <div className="dropdown-options">
                    {ratings.map(rating => (
                        <label key={rating.value} className="option-label">
                            <input 
                                type="checkbox"
                                checked={selectedRatings.includes(rating.value)}
                                onChange={() => toggleRating(rating.value)}
                            />
                            {rating.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RatingFilter;