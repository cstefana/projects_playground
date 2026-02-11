# Movie Collection App

An interactive movie collection app built with React and Vite. Browse movies, filter by genre and rating, manage your personal watchlist, and view detailed movie information.

## Features

### Movie Browsing
- **Home Page**: Browse the complete movie collection with rich visual cards
- **Search**: Real-time search functionality to find movies by title
- **Genre Filter**: Multi-select dropdown to filter movies by genre (Action, Drama, Fantasy, Horror, etc.)
- **Rating Filter**: Multi-select rating filter to find movies by star rating (5-9 stars)

### Watchlist Management
- **Watchlist Page**: Dedicated page to view all saved movies
- **Quick Toggle**: Add or remove movies from your watchlist
- **Persistent Storage**: Watchlist data saved in localStorage
- **Visual Indicators**: Watchlisted movies have a distinct border highlight

### Movie Details Modal
- **Interactive Cards**: Click any movie card to open a detailed modal view
- **Full Information**: View movie title, genre, rating, and poster
- **Keyboard Support**: Navigate with keyboard (Enter/Space to open, Escape to close)
- **Watchlist Controls**: Manage watchlist status directly from the modal

### UI/UX
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Smooth Animations**: Hover effects, transitions, and transforms
- **Dark Theme**: Dark mode interface with gradient accents
- **Accessibility**: Keyboard navigation and focus indicators

## Tech Stack

- **React** 19 - UI library
- **Vite** 4 - Build tool and dev server
- **CSS3** - Styling with modern features (grid, flexbox, gradients, backdrop-filter)
- **LocalStorage API** - Client-side data persistence

## Project Structure

```
movies/
├── src/
│   ├── components/
│   │   ├── GenreFilter/      # Multi-select genre dropdown
│   │   ├── RatingFilter/     # Multi-select rating dropdown
│   │   ├── MovieCard/        # Movie card with hover effects
│   │   └── MovieModal/       # Full-screen movie details modal
│   ├── assets/               # Movie poster images
│   ├── App.jsx              # Main app component with state management
│   ├── index.jsx            # React entry point
│   └── index.css            # Global styles
├── movies.json              # Movie data source
├── package.json
└── vite.config.js
```

## Installation & Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173` by default.

## Data Structure

Movies are stored in `movies.json` with the following schema:

```json
{
  "id": 1,
  "title": "Movie Title",
  "image": "poster.jpg",
  "genre": "action",
  "rating": "8.5"
}
```

