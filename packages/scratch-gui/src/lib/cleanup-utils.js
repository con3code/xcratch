/**
 * Utility functions for enhanced workspace cleanup
 * Based on ScratchAddons editor-cleanup-plus
 */

import log from './log.js';

/**
 * Auto position a comment near its associated block or in a good default location
 * @param {object} comment - Workspace comment
 */
export const autoPositionComment = comment => {
    if (typeof comment.autoPosition_ === 'function') {
        comment.needsAutoPositioning_ = true;
        comment.autoPosition_();
        comment.needsAutoPositioning_ = false;
    }
};

/**
 * Check if a block is an orphan (has output connection)
 * @param {object} topBlock - Block to check
 * @returns {boolean} True if block is an orphan
 */
const isBlockAnOrphan = topBlock => !!topBlock.outputConnection;

/**
 * Column class for organizing blocks
 */
class Col {
    constructor (x, count, blocks) {
        this.x = x;
        this.count = count;
        this.blocks = blocks;
    }
}

/**
 * Get ordered top block columns with layout information
 * @param {boolean} separateOrphans - Whether to separate orphan blocks
 * @param {object} workspace - Blockly workspace
 * @returns {object} Object with cols, orphans, and maxWidths
 */
export const getOrderedTopBlockColumns = (separateOrphans, workspace) => {
    const topBlocks = workspace.getTopBlocks(true);
    const maxWidths = {};
    
    // Calculate max widths including comments
    if (separateOrphans) {
        const topComments = workspace.getTopComments();
        
        if (topComments) {
            for (const comment of topComments) {
                if (comment.block_) {
                    autoPositionComment(comment);
                    const right = comment.getBoundingRectangle().bottomRight.x;
                    const root = comment.block_.getRootBlock();
                    const left = root.getBoundingRectangle().topLeft.x;
                    maxWidths[root.id] = Math.max(right - left, maxWidths[root.id] || 0);
                }
            }
        }
    }
    
    // Group blocks into columns based on X position
    const cols = [];
    const TOLERANCE = 256;
    const orphans = {x: -999999, count: 0, blocks: []};
    
    for (const topBlock of topBlocks) {
        const position = topBlock.getRelativeToSurfaceXY();
        let bestCol = null;
        let bestError = TOLERANCE;
        
        // Check if block is an orphan
        if (separateOrphans && isBlockAnOrphan(topBlock)) {
            orphans.blocks.push(topBlock);
            continue;
        }
        
        // Find the best matching column
        for (const col of cols) {
            const err = Math.abs(position.x - col.x);
            if (err < bestError) {
                bestError = err;
                bestCol = col;
            }
        }
        
        if (bestCol) {
            // Add to existing column and update average X position
            bestCol.x = ((bestCol.x * bestCol.count) + position.x) / ++bestCol.count;
            bestCol.blocks.push(topBlock);
        } else {
            // Create new column
            cols.push(new Col(position.x, 1, [topBlock]));
        }
    }
    
    // Sort columns by X position
    cols.sort((a, b) => a.x - b.x);
    
    // Sort blocks within each column by Y position
    for (const col of cols) {
        col.blocks.sort((a, b) => {
            const aY = a.getRelativeToSurfaceXY().y;
            const bY = b.getRelativeToSurfaceXY().y;
            return aY - bY;
        });
    }
    
    return {
        cols: cols,
        orphans: orphans,
        maxWidths: maxWidths
    };
};

/**
 * Animate block movement
 * @param {object} block - Block to animate
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 * @returns {Promise} Promise that resolves when animation completes
 */
const animateBlockMove = (block, targetX, targetY) => new Promise(resolve => {
    const currentPos = block.getRelativeToSurfaceXY();
    const dx = targetX - currentPos.x;
    const dy = targetY - currentPos.y;
    
    // Skip animation if block doesn't need to move
    if (dx === 0 && dy === 0) {
        resolve();
        return;
    }
    
    // Use CSS transition for smooth animation
    const svgRoot = block.getSvgRoot();
    if (svgRoot) {
        // Store original transition
        const originalTransition = svgRoot.style.transition;
        
        // Apply transition
        svgRoot.style.transition = 'transform 0.3s ease-out';
        
        // Move the block
        block.moveBy(dx, dy);
        
        // Wait for animation to complete
        setTimeout(() => {
            // Restore original transition
            svgRoot.style.transition = originalTransition;
            resolve();
        }, 300);
    } else {
        // Fallback: immediate move
        block.moveBy(dx, dy);
        resolve();
    }
});

/**
 * Position workspace comments
 * @param {object} workspace - Blockly workspace
 */
const positionComments = workspace => {
    const topComments = workspace.getTopComments();
    if (topComments) {
        for (const comment of topComments) {
            autoPositionComment(comment);
        }
    }
};

/**
 * Enhanced cleanup function for workspace
 * @param {object} workspace - Blockly workspace
 * @param {object} options - Cleanup options
 * @returns {boolean} Whether cleanup was successful
 */
export const enhancedCleanUp = (workspace, options = {}) => {
    if (!workspace) return false;
    
    const {
        animate = true,
        animationDelay = 10
    } = options;
    
    try {
        // Get ordered columns with orphan separation
        const result = getOrderedTopBlockColumns(true, workspace);
        const columns = result.cols;
        const orphanCount = result.orphans.blocks.length;
        
        // Add orphans at the beginning if there are any
        if (orphanCount > 0) {
            columns.unshift(result.orphans);
        }
        
        // Get grid size (support both new and old Blockly)
        const gridSize = workspace.getGrid().spacing || workspace.getGrid().spacing_;
        
        // Coordinates start between the workspace dots but script-snap snaps to them
        let cursorX = gridSize / 2;
        const maxWidths = result.maxWidths;
        
        // Collect all block movements
        const movements = [];
        
        // Calculate positions for all blocks
        for (const column of columns) {
            let cursorY = gridSize / 2;
            let maxWidth = 0;
            
            for (const block of column.blocks) {
                const xy = block.getRelativeToSurfaceXY();
                const targetX = cursorX;
                const targetY = cursorY;
                
                if (targetX !== xy.x || targetY !== xy.y) {
                    movements.push({block, targetX, targetY});
                }
                
                const heightWidth = block.getHeightWidth();
                cursorY += heightWidth.height + gridSize;
                cursorY += gridSize - ((cursorY + (gridSize / 2)) % gridSize);
                
                const maxWidthWithComments = maxWidths[block.id] || 0;
                maxWidth = Math.max(maxWidth, Math.max(heightWidth.width, maxWidthWithComments));
            }
            
            cursorX += maxWidth + gridSize;
            cursorX += gridSize - ((cursorX + (gridSize / 2)) % gridSize);
        }
        
        // Execute movements with animation
        if (animate && movements.length > 0) {
            // Animate blocks sequentially with small delay
            const animateNext = index => {
                if (index >= movements.length) {
                    // All animations complete, position comments
                    positionComments(workspace);
                    return;
                }
                
                const {block, targetX, targetY} = movements[index];
                animateBlockMove(block, targetX, targetY).then(() => {
                    setTimeout(() => animateNext(index + 1), animationDelay);
                });
            };
            
            animateNext(0);
        } else {
            // No animation: immediate move
            for (const {block, targetX, targetY} of movements) {
                const xy = block.getRelativeToSurfaceXY();
                block.moveBy(targetX - xy.x, targetY - xy.y);
            }
            positionComments(workspace);
        }
        
        return true;
    } catch (error) {
        // Log error but don't throw
        log.error('Enhanced cleanup error:', error);
        return false;
    }
};
