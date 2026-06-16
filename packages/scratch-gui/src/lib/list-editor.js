/**
 * List Editor - Add a context menu item to `data_listcontents` reporter blocks
 * that opens a multi-line list editor modal.
 *
 * Patterned after edit-value-in-editor.js: we override
 * `ScratchBlocks.ContextMenu.show` once (guarded by an `initialized` flag) and
 * append our menu entry on every right click against a list-contents block.
 * The callback references are refreshed on every `initializeListEditor` call
 * so locale / VM hot swaps are picked up automatically.
 */

let initialized = false;
let ScratchBlocks = null;
let intl = null;
let vm = null;
let openListEditor = null;

const getRightClickedBlock = () => {
    const mainWorkspace = ScratchBlocks.mainWorkspace;
    if (!mainWorkspace) return null;
    // Gestures on flyout blocks are created on the flyout's workspace,
    // not on the main workspace.
    const gesture = mainWorkspace.currentGesture_ ||
        mainWorkspace.getFlyout()?.getWorkspace()?.currentGesture_;
    return gesture?.targetBlock_ || null;
};

/**
 * Resolve the (targetId, listId, listName) for the given block.
 * @param {object} block - The ScratchBlocks block instance to inspect.
 * @returns {?{listId: string, listName: string, targetId: string}}
 *   Object with the resolved IDs/name, or null if the block isn't a list
 *   reporter or the variable cannot be located.
 */
const resolveListTarget = block => {
    if (!block || block.type !== 'data_listcontents') return null;
    const field = block.getField && block.getField('LIST');
    if (!field) return null;
    const listId = field.getValue();
    if (!listId) return null;
    const listName = (field.getText && field.getText()) || '';

    // Stage globals first, then the currently-edited sprite for local lists.
    let targetId = null;
    try {
        const stage = vm.runtime.getTargetForStage();
        if (stage && stage.variables && stage.variables[listId]) {
            targetId = stage.id;
        } else if (
            vm.editingTarget &&
            vm.editingTarget.variables &&
            vm.editingTarget.variables[listId]
        ) {
            targetId = vm.editingTarget.id;
        }
    } catch (e) {
        return null;
    }
    if (!targetId) return null;
    return {listId, listName, targetId};
};

const addEditListItem = (items, block) => {
    if (!block || !vm) return items;
    // We intentionally do NOT skip flyout blocks here: the LIST field on a
    // `data_listcontents` block in the flyout still references a real list
    // variable on the stage or editing target, so editing it from the
    // flyout produces the same result as editing it from the workspace.
    const resolved = resolveListTarget(block);
    if (!resolved) return items;
    items.push({
        enabled: true,
        text: intl.formatMessage({
            id: 'xcratch.listEditor.editList',
            defaultMessage: 'Edit list...',
            description: 'Context menu item to open the list editor on a list reporter block'
        }),
        callback: () => openListEditor({
            listId: resolved.listId,
            listName: resolved.listName,
            targetId: resolved.targetId
        }),
        separator: true
    });
    return items;
};

/**
 * Initialize the list editor context menu functionality.
 * Safe to call multiple times; the ContextMenu patch is applied once but
 * the callback references are refreshed on every call.
 * @param {object} scratchBlocks - The ScratchBlocks object
 * @param {function(object): string} formatMessage - The intl formatMessage function
 * @param {object} theVM - The scratch-vm instance
 * @param {function(object): void} openEditorCallback - Called with {listId, listName, targetId}
 */
export const initializeListEditor = (scratchBlocks, formatMessage, theVM, openEditorCallback) => {
    ScratchBlocks = scratchBlocks;
    intl = {formatMessage};
    vm = theVM;
    openListEditor = openEditorCallback;

    if (initialized) return;

    const originalShow = ScratchBlocks.ContextMenu.show;
    ScratchBlocks.ContextMenu.show = function (event, items, rtl) {
        items = addEditListItem(items, getRightClickedBlock());
        originalShow.call(this, event, items, rtl);
    };

    initialized = true;
};
