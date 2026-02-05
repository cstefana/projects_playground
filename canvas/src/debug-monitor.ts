export class WindowStateMonitor {
    private innerSizeElement: HTMLElement;
    private mousePosElement: HTMLElement;
    private canvasSizeElement: HTMLElement;
    private canvasDisplaySizeElement: HTMLElement;
    private canvas: HTMLCanvasElement | null = null;

    constructor() {
        this.innerSizeElement = document.getElementById('innerSize')!;
        this.mousePosElement = document.getElementById('mousePos')!;
        this.canvasSizeElement = document.getElementById('canvasSize')!;
        this.canvasDisplaySizeElement = document.getElementById('canvasDisplaySize')!;
        
        // Get reference to canvas
        this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;

        this.initializeEventListeners();
        this.updateDisplay();
    }

    private initializeEventListeners() {
        
        window.addEventListener('resize', () => this.updateDisplay());
        
        // update periodically to catch any missed events
        setInterval(() => this.updateDisplay(), 1000);
    }

    private updateInnerSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.innerSizeElement.textContent = `${width}×${height}`;
    }


    public updateMousePosition(x: number, y: number) {
        this.mousePosElement.textContent = `${Math.round(x)}, ${Math.round(y)}`;
    }

    private updateCanvasSize() {
        if (this.canvas) {
            // Internal canvas resolution
            const width = this.canvas.width;
            const height = this.canvas.height;
            this.canvasSizeElement.textContent = `${width}×${height}`;
            
            // Actual displayed size (CSS size)
            const rect = this.canvas.getBoundingClientRect();
            const displayWidth = Math.round(rect.width);
            const displayHeight = Math.round(rect.height);
            this.canvasDisplaySizeElement.textContent = `${displayWidth}×${displayHeight}`;
        } else {
            this.canvasSizeElement.textContent = 'N/A';
            this.canvasDisplaySizeElement.textContent = 'N/A';
        }
    }

    private updateDisplay() {
        this.updateInnerSize();
        this.updateCanvasSize();
    }
}