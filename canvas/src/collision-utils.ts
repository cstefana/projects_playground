import { Shape } from './geometry-shapes.js';

export class CollisionDetector {
    static checkCollision(shape1: Shape, shape2: Shape): boolean {
        const bounds1 = shape1.getBounds();
        const bounds2 = shape2.getBounds();
        
        return !(bounds1.x + bounds1.width < bounds2.x ||
                 bounds2.x + bounds2.width < bounds1.x ||
                 bounds1.y + bounds1.height < bounds2.y ||
                 bounds2.y + bounds2.height < bounds1.y);
    }

    static wouldCollideAtPosition(
        shape: Shape, 
        newX: number, 
        newY: number, 
        allShapes: Shape[]
    ): boolean {
        const originalX = shape.x;
        const originalY = shape.y;
        
        // temporarily move shape to new position
        shape.x = newX;
        shape.y = newY;
        
        // check collision with all other shapes
        const hasCollision = allShapes.some(otherShape => 
            otherShape !== shape && this.checkCollision(shape, otherShape)
        );
        
        // restore original position
        shape.x = originalX;
        shape.y = originalY;
        
        return hasCollision;
    }
}