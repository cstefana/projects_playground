import { CanvasApp } from './canvas-app.js';
import { WindowStateMonitor } from './debug-monitor.js';
import { ShapeFactory } from './shape-factory.js';
import { PdfExporter } from './pdf-export.js';

window.addEventListener('DOMContentLoaded', () => {
    const app = new CanvasApp('myCanvas');
    const windowState = new WindowStateMonitor();

    document.getElementById('addRect')?.addEventListener('click', () => {
        app.addShape(ShapeFactory.createRectangle());
    });

    document.getElementById('addCircle')?.addEventListener('click', () => {
        app.addShape(ShapeFactory.createCircle());
    });

    document.getElementById('addSquare')?.addEventListener('click', () => {
        app.addShape(ShapeFactory.createSquare());
    });

    document.getElementById('addTriangle')?.addEventListener('click', () => {
        app.addShape(ShapeFactory.createTriangle());
    });

    document.getElementById('addEllipse')?.addEventListener('click', () => {
        app.addShape(ShapeFactory.createEllipse());
    });

    document.getElementById('addStar')?.addEventListener('click', () => {
        app.addShape(ShapeFactory.createStar());
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

    document.getElementById('savePdf')?.addEventListener('click', () => {
        const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        PdfExporter.exportCanvasToPdf(canvas);
    });

    // Global mouse tracking for window state
    document.addEventListener('mousemove', (event) => {
        windowState.updateMousePosition(event.clientX, event.clientY);
    });
});