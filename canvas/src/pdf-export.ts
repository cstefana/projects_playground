import { jsPDF } from 'jspdf';

export class PdfExporter {
    static exportCanvasToPdf(canvas: HTMLCanvasElement, filename?: string): void {
        // Create a new jsPDF instance
        const isLandscape = canvas.width > canvas.height;
        const pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        // Generate filename with timestamp if not provided
        const finalFilename = filename || this.generateTimestampFilename();
        
        // Save the PDF
        pdf.save(finalFilename);
    }

    private static generateTimestampFilename(): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `canvas-${timestamp}.pdf`;
    }
}