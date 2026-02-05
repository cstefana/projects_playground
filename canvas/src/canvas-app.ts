import { Shape } from './geometry-shapes.js';
import { CollisionDetector } from './collision-utils.js';

export class CanvasApp {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private shapes: Shape[] = [];
    private isDragging: boolean = false;
    private draggedShape: Shape | null = null;
    private dragOffset: { x: number, y: number } = { x: 0, y: 0 };
    private collisionAvoidanceEnabled: boolean = false;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        
        this.canvas.style.cursor = 'default';
    }

    private getMousePos(event: MouseEvent): { x: number, y: number } {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    private getShapeAtPoint(x: number, y: number): Shape | null {
        // Check shapes in reverse order (top to bottom)
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.shapes[i].isPointInside(x, y)) {
                return this.shapes[i];
            }
        }
        return null;
    }

    private wouldCollide(shape: Shape, newX: number, newY: number): boolean {
        if (!this.collisionAvoidanceEnabled) return false;
        return CollisionDetector.wouldCollideAtPosition(shape, newX, newY, this.shapes);
    }

    public toggleCollisionAvoidance(): boolean {
        this.collisionAvoidanceEnabled = !this.collisionAvoidanceEnabled;
        return this.collisionAvoidanceEnabled;
    }

    public isCollisionAvoidanceEnabled(): boolean {
        return this.collisionAvoidanceEnabled;
    }

    private onMouseDown(event: MouseEvent) { // selection 
        const mousePos = this.getMousePos(event);
        const shape = this.getShapeAtPoint(mousePos.x, mousePos.y);
        
        if (shape) {
            this.isDragging = true;
            this.draggedShape = shape;
            this.dragOffset = {
                x: mousePos.x - shape.x,
                y: mousePos.y - shape.y
            };
            this.canvas.style.cursor = 'grabbing';
        }
    }

    private onMouseMove(event: MouseEvent) { // dragging start
        const mousePos = this.getMousePos(event);
        
        if (this.isDragging && this.draggedShape) {
            // Calculate new position
            const newX = mousePos.x - this.dragOffset.x;
            const newY = mousePos.y - this.dragOffset.y;
            
            // Check for collision before moving
            if (!this.wouldCollide(this.draggedShape, newX, newY)) {
                this.draggedShape.x = newX;
                this.draggedShape.y = newY;
                this.render();
            }
        } else {
            // Update cursor based on whether mouse is over a shape
            const shape = this.getShapeAtPoint(mousePos.x, mousePos.y);
            this.canvas.style.cursor = shape ? 'grab' : 'default';
        }
    }

    private onMouseUp(event: MouseEvent) { // release - dragging end
        this.isDragging = false;
        this.draggedShape = null;
        this.canvas.style.cursor = 'default';
        
        // Update cursor for current mouse position
        const mousePos = this.getMousePos(event);
        const shape = this.getShapeAtPoint(mousePos.x, mousePos.y);
        this.canvas.style.cursor = shape ? 'grab' : 'default';
    }

    private onDoubleClick(event: MouseEvent) {
        const mousePos = this.getMousePos(event);
        const shape = this.getShapeAtPoint(mousePos.x, mousePos.y);
        
        if (shape) {
            // randomly resize between 0.7x and 1.5x
            const factor = 0.7 + Math.random() * 0.8;
            shape.resize(factor);
            this.render();
        }
    }

    addShape(shape: Shape) {
        this.shapes.push(shape);
        this.render();
    }

    clear() {
        this.shapes = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render() {
        // Clear the canvas before redrawing
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.shapes.forEach(shape => shape.draw(this.ctx));
    }
}