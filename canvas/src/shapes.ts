export abstract class Shape {
    constructor(
        public x: number, 
        public y: number, 
        public color: string
    ) {}

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract isPointInside(x: number, y: number): boolean;
    abstract resize(factor: number): void;
    abstract getBounds(): { x: number, y: number, width: number, height: number };
}

// Concrete implementations that extend the base class Shape

export class Rectangle extends Shape {
    constructor(x: number, y: number, public width: number, public height: number, color: string) {
        super(x, y, color);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isPointInside(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    resize(factor: number): void {
        this.width *= factor;
        this.height *= factor;
        // clamp to reasonable sizes
        this.width = Math.max(10, Math.min(this.width, 200));
        this.height = Math.max(10, Math.min(this.height, 200));
    }

    getBounds(): { x: number, y: number, width: number, height: number } {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

export class Circle extends Shape {
    constructor(x: number, y: number, public radius: number, color: string) {
        super(x, y, color);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    isPointInside(x: number, y: number): boolean {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.radius;
    }

    resize(factor: number): void {
        this.radius *= factor;
        // Clamp to reasonable sizes
        this.radius = Math.max(5, Math.min(this.radius, 100));
    }

    getBounds(): { x: number, y: number, width: number, height: number } {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}

// Square inherits from Rectangle
export class Square extends Rectangle {
    constructor(x: number, y: number, public size: number, color: string) {
        super(x, y, size, size, color);
    }

    // Override to ensure it stays square when manipulated
    setSize(newSize: number) {
        this.width = newSize;
        this.height = newSize;
        this.size = newSize;
    }

    resize(factor: number): void {
        this.size *= factor;
        // Clamp to reasonable sizes
        this.size = Math.max(10, Math.min(this.size, 150));
        this.width = this.size;
        this.height = this.size;
    }

    getBounds(): { x: number, y: number, width: number, height: number } {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }
}

// Triangle shape
export class Triangle extends Shape {
    constructor(x: number, y: number, public size: number, color: string) {
        super(x, y, color);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.size); // Bottom left
        ctx.lineTo(this.x + this.size, this.y + this.size); // Bottom right
        ctx.lineTo(this.x + this.size / 2, this.y); // Top center
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isPointInside(x: number, y: number): boolean {
        // Check if point is inside triangle using barycentric coordinates
        const x1 = this.x;
        const y1 = this.y + this.size;
        const x2 = this.x + this.size;
        const y2 = this.y + this.size;
        const x3 = this.x + this.size / 2;
        const y3 = this.y;

        const denom = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
        const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denom;
        const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denom;
        const c = 1 - a - b;

        return a >= 0 && b >= 0 && c >= 0;
    }

    resize(factor: number): void {
        this.size *= factor;
        // Clamp to reasonable sizes
        this.size = Math.max(15, Math.min(this.size, 120));
    }

    getBounds(): { x: number, y: number, width: number, height: number } {
        return { x: this.x, y: this.y, width: this.size, height: this.size };
    }
}

export class Ellipse extends Shape {
    constructor(x: number, y: number, public radiusX: number, public radiusY: number, color: string) {
        super(x, y, color);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    isPointInside(x: number, y: number): boolean {
        const dx = x - this.x;
        const dy = y - this.y;
        return (dx * dx) / (this.radiusX * this.radiusX) + (dy * dy) / (this.radiusY * this.radiusY) <= 1;
    }

    resize(factor: number): void {
        this.radiusX *= factor;
        this.radiusY *= factor;
        // Clamp to reasonable sizes
        this.radiusX = Math.max(8, Math.min(this.radiusX, 80));
        this.radiusY = Math.max(8, Math.min(this.radiusY, 80));
    }

    getBounds(): { x: number, y: number, width: number, height: number } {
        return {
            x: this.x - this.radiusX,
            y: this.y - this.radiusY,
            width: this.radiusX * 2,
            height: this.radiusY * 2
        };
    }
}

// Star shape
export class Star extends Shape {
    constructor(x: number, y: number, public outerRadius: number, public innerRadius: number, color: string) {
        super(x, y, color);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const spikes = 5;
        const step = Math.PI / spikes;
        let rotation = -Math.PI / 2;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.outerRadius);

        for (let i = 0; i < spikes; i++) {
            // Outer point
            let x = this.x + Math.cos(rotation) * this.outerRadius;
            let y = this.y + Math.sin(rotation) * this.outerRadius;
            ctx.lineTo(x, y);
            rotation += step;

            // Inner point
            x = this.x + Math.cos(rotation) * this.innerRadius;
            y = this.y + Math.sin(rotation) * this.innerRadius;
            ctx.lineTo(x, y);
            rotation += step;
        }

        ctx.lineTo(this.x, this.y - this.outerRadius);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isPointInside(x: number, y: number): boolean {
        // Simple approximation: check if point is within outer radius
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.outerRadius;
    }

    resize(factor: number): void {
        this.outerRadius *= factor;
        this.innerRadius *= factor;
        // Clamp to reasonable sizes
        this.outerRadius = Math.max(10, Math.min(this.outerRadius, 80));
        this.innerRadius = Math.max(5, Math.min(this.innerRadius, 40));
        // Ensure inner radius stays smaller than outer radius
        if (this.innerRadius >= this.outerRadius) {
            this.innerRadius = this.outerRadius * 0.4;
        }
    }

    getBounds(): { x: number, y: number, width: number, height: number } {
        return {
            x: this.x - this.outerRadius,
            y: this.y - this.outerRadius,
            width: this.outerRadius * 2,
            height: this.outerRadius * 2
        };
    }
}