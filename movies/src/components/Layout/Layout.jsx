import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

function Layout({ watchlistCount }) {
    return (
        <div className="app">
            <header>
                <h1>Movie Collection</h1>
                <p>Discover amazing movies from our collection</p>

                <nav className="page-toggle">
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/watchlist"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        Watchlist ({watchlistCount})
                    </NavLink>
                </nav>
            </header>
            
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;