import { Rectangle, Circle, Square, Triangle, Ellipse, Star } from './geometry-shapes.js';

export class ShapeFactory {
    private static readonly DEFAULT_COLORS = {
        rectangle: ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f'],
        square: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
        circle: '#9b59b6',
        triangle: '#ff7675',
        ellipse: '#a29bfe',
        star: '#fdcb6e'
    };

    private static getRandomPosition(): { x: number; y: number } {
        return {
            x: Math.random() * 600 + 50,
            y: Math.random() * 300 + 50
        };
    }

    private static getRandomColor(colors: string | string[]): string {
        if (typeof colors === 'string') return colors;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static createRectangle(): Rectangle {
        const pos = this.getRandomPosition();
        const color = this.getRandomColor(this.DEFAULT_COLORS.rectangle);
        return new Rectangle(pos.x, pos.y, 60, 40, color);
    }

    static createSquare(): Square {
        const pos = this.getRandomPosition();
        const color = this.getRandomColor(this.DEFAULT_COLORS.square);
        return new Square(pos.x, pos.y, 50, color);
    }

    static createCircle(): Circle {
        const pos = this.getRandomPosition();
        return new Circle(pos.x, pos.y, 30, this.DEFAULT_COLORS.circle);
    }

    static createTriangle(): Triangle {
        const pos = this.getRandomPosition();
        return new Triangle(pos.x, pos.y, 60, this.DEFAULT_COLORS.triangle);
    }

    static createEllipse(): Ellipse {
        const pos = this.getRandomPosition();
        return new Ellipse(pos.x, pos.y, 40, 25, this.DEFAULT_COLORS.ellipse);
    }

    static createStar(): Star {
        const pos = this.getRandomPosition();
        return new Star(pos.x, pos.y, 35, 15, this.DEFAULT_COLORS.star);
    }
}