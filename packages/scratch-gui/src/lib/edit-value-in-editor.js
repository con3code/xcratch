/**
 * Edit Value in Editor - Add a context menu item to variable / item-of-list
 * blocks that opens a multi-line text editor for the value.
 */

let initialized = false;
let ScratchBlocks = null;
let intl = null;
let vm = null;
let openValueEditor = null;

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
 * Statically resolve the INDEX input of a data_itemoflist block.
 * @param {object} block - the data_itemoflist block
 * @returns {?number} the 1-based index, or null if not statically determinable
 */
const resolveListIndex = block => {
    const input = block.getInput('INDEX');
    const indexBlock = input?.connection?.targetBlock();
    if (!indexBlock || !indexBlock.isShadow()) return null;
    const index = Number(indexBlock.getFieldValue('NUM'));
    if (!Number.isInteger(index) || index < 1) return null;
    return index;
};

const addEditValueItem = (items, block) => {
    if (!block || !vm?.editingTarget) return items;
    if (block.type !== 'data_variable' && block.type !== 'data_itemoflist') return items;
    const isList = block.type === 'data_itemoflist';
    const field = block.getField(isList ? 'LIST' : 'VARIABLE');
    if (!field) return items;
    const variableId = field.getValue();
    const variableName = field.getText();
    const variable = vm.editingTarget.lookupVariableById(variableId);
    let enabled = !!variable;
    let index = null;
    if (isList) {
        index = resolveListIndex(block);
        enabled = enabled && index !== null &&
            Array.isArray(variable?.value) && index <= variable.value.length;
    }
    items.push({
        enabled,
        text: intl.formatMessage({
            id: 'xcratch.valueEditor.editValue',
            defaultMessage: 'Edit value in editor',
            description: 'Context menu item to edit a variable or list item value in a text editor'
        }),
        callback: () => openValueEditor({variableId, variableName, isList, index}),
        separator: true
    });
    return items;
};

/**
 * Initialize the edit-value-in-editor context menu functionality.
 * Safe to call multiple times; the ContextMenu patch is applied once but
 * the callback references are refreshed on every call.
 * @param {object} scratchBlocks - The ScratchBlocks object
 * @param {function(object): string} formatMessage - The intl formatMessage function
 * @param {object} theVM - The scratch-vm instance
 * @param {function(object): void} openEditorCallback - Called with {variableId, variableName, isList, index}
 */
export const initializeEditValueInEditor = (scratchBlocks, formatMessage, theVM, openEditorCallback) => {
    ScratchBlocks = scratchBlocks;
    intl = {formatMessage};
    vm = theVM;
    openValueEditor = openEditorCallback;

    if (initialized) return;

    const originalShow = ScratchBlocks.ContextMenu.show;
    ScratchBlocks.ContextMenu.show = function (event, items, rtl) {
        items = addEditValueItem(items, getRightClickedBlock());
        originalShow.call(this, event, items, rtl);
    };

    initialized = true;
};
