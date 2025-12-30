/**
 * Enhanced Cleanup Extension for Scratch Blocks
 * Extends the default cleanUp functionality with better block organization
 * Based on ScratchAddons editor-cleanup-plus
 */

import {enhancedCleanUp} from './cleanup-utils.js';
import log from './log.js';

/**
 * Install enhanced cleanup functionality to ScratchBlocks
 * @param {object} ScratchBlocks - The ScratchBlocks instance
 * @param {object} options - Configuration options
 * @returns {object} Object with restore method
 */
export const installEnhancedCleanup = (ScratchBlocks, options = {}) => {
    if (!ScratchBlocks || !ScratchBlocks.WorkspaceSvg) {
        log.warn('ScratchBlocks not available for enhanced cleanup');
        return null;
    }
    
    // Store reference to original cleanUp function
    const originalCleanUp = ScratchBlocks.WorkspaceSvg.prototype.cleanUp;
    
    // Override with enhanced version
    ScratchBlocks.WorkspaceSvg.prototype.cleanUp = function () {
        // Check if we should use enhanced cleanup
        const useEnhanced = options.useEnhancedCleanup !== false;
        
        if (!useEnhanced) {
            // Fall back to original implementation
            return originalCleanUp.call(this);
        }
        
        // Disable resize events during cleanup for performance
        const wasResizeEnabled = this.resizesEnabled_;
        this.setResizesEnabled(false);
        
        // Use event grouping for undo/redo
        if (ScratchBlocks.Events.isEnabled()) {
            ScratchBlocks.Events.setGroup(true);
        }
        
        try {
            // Call enhanced cleanup with animation options
            const success = enhancedCleanUp(this, {
                animate: options.animate !== false,
                animationDelay: options.animationDelay || 10
            });
            
            if (!success) {
                // Fall back to original if enhanced fails
                log.warn('Enhanced cleanup failed, falling back to original');
                originalCleanUp.call(this);
            }
        } finally {
            // Re-enable events and resize after animation completes
            setTimeout(() => {
                if (ScratchBlocks.Events.isEnabled()) {
                    ScratchBlocks.Events.setGroup(false);
                }
                this.setResizesEnabled(wasResizeEnabled);
            }, 100);
        }
    };
    
    // Store reference to original function for potential restoration
    ScratchBlocks.WorkspaceSvg.prototype.cleanUp._original = originalCleanUp;
    
    return {
        // Method to restore original cleanup
        restore: () => {
            if (ScratchBlocks.WorkspaceSvg.prototype.cleanUp._original) {
                ScratchBlocks.WorkspaceSvg.prototype.cleanUp =
                    ScratchBlocks.WorkspaceSvg.prototype.cleanUp._original;
            }
        }
    };
};

export default installEnhancedCleanup;
