import { CanvasApp } from './canvas.js';
import { WindowStateMonitor } from './windowState.js';
import { Rectangle, Circle, Square, Triangle, Ellipse, Star } from './shapes.js';

window.addEventListener('DOMContentLoaded', () => {
    const app = new CanvasApp('myCanvas');
    const windowState = new WindowStateMonitor();

    document.getElementById('addRect')?.addEventListener('click', () => {
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const rect = new Rectangle(
            Math.random() * 600 + 50, // Keep shapes away from edges
            Math.random() * 300 + 50, 
            60, 40, randomColor
        );
        app.addShape(rect);
    });

    document.getElementById('addCircle')?.addEventListener('click', () => {
        const circ = new Circle(
            Math.random() * 600 + 50,
            Math.random() * 300 + 50, 
            30, '#9b59b6'
        );
        app.addShape(circ);
    });

    document.getElementById('addSquare')?.addEventListener('click', () => {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const square = new Square(
            Math.random() * 600 + 50,
            Math.random() * 300 + 50,
            50, randomColor
        );
        app.addShape(square);
    });

    document.getElementById('addTriangle')?.addEventListener('click', () => {
        const triangle = new Triangle(
            Math.random() * 600 + 50,
            Math.random() * 300 + 50,
            60, '#ff7675'
        );
        app.addShape(triangle);
    });

    document.getElementById('addEllipse')?.addEventListener('click', () => {
        const ellipse = new Ellipse(
            Math.random() * 600 + 50,
            Math.random() * 300 + 50,
            40, 25, '#a29bfe'
        );
        app.addShape(ellipse);
    });

    document.getElementById('addStar')?.addEventListener('click', () => {
        const star = new Star(
            Math.random() * 600 + 50,
            Math.random() * 300 + 50,
            35, 15, '#fdcb6e'
        );
        app.addShape(star);
    });

    document.getElementById('clearCanvas')?.addEventListener('click', () => {
        app.clear();
    });

    document.getElementById('toggleCollision')?.addEventListener('click', (event) => {
        const button = event.target as HTMLButtonElement;
        const isEnabled = app.toggleCollisionAvoidance();
        button.textContent = `Collision Avoidance: ${isEnabled ? 'ON' : 'OFF'}`;
        button.classList.toggle('active', isEnabled);
    });

    // Global mouse tracking for window state
    document.addEventListener('mousemove', (event) => {
        windowState.updateMousePosition(event.clientX, event.clientY);
    });
});