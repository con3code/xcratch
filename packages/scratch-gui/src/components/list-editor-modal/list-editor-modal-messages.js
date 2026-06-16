import {defineMessages} from 'react-intl';

const listEditorMessages = defineMessages({
    title: {
        id: 'xcratch.listEditor.title',
        defaultMessage: 'Edit list: {listName}',
        description: 'Title shown in the list editor modal header'
    },
    editingTitle: {
        id: 'xcratch.listEditor.editingTitle',
        defaultMessage: 'Editing item {index} of "{listName}"',
        description: 'Title shown while editing a single item'
    },
    addItem: {
        id: 'xcratch.listEditor.addItem',
        defaultMessage: 'Add item',
        description: 'Button to append a new empty item at the end of the list'
    },
    save: {
        id: 'xcratch.listEditor.save',
        defaultMessage: 'Save',
        description: 'Button to save the edited list and close the modal'
    },
    cancel: {
        id: 'xcratch.listEditor.cancel',
        defaultMessage: 'Cancel',
        description: 'Button to close the list editor without saving'
    },
    ok: {
        id: 'xcratch.listEditor.ok',
        defaultMessage: 'OK',
        description: 'Confirm-edit button shown in the single-item editor view'
    },
    back: {
        id: 'xcratch.listEditor.back',
        defaultMessage: 'Back to list',
        description: 'Button to return from the single-item editor view to the list view'
    },
    maximize: {
        id: 'xcratch.listEditor.maximize',
        defaultMessage: 'Maximize',
        description: 'Toggle button label for expanding the modal to full screen'
    },
    restore: {
        id: 'xcratch.listEditor.restore',
        defaultMessage: 'Restore',
        description: 'Toggle button label for shrinking the modal back from full screen'
    },
    editItem: {
        id: 'xcratch.listEditor.editItem',
        defaultMessage: 'Edit item',
        description: 'Aria label for the row preview button which opens the single-item editor'
    },
    removeItem: {
        id: 'xcratch.listEditor.removeItem',
        defaultMessage: 'Remove item',
        description: 'Aria label for the remove (×) button on an item row'
    },
    moveUp: {
        id: 'xcratch.listEditor.moveUp',
        defaultMessage: 'Move up',
        description: 'Aria label for the move-up button on an item row'
    },
    moveDown: {
        id: 'xcratch.listEditor.moveDown',
        defaultMessage: 'Move down',
        description: 'Aria label for the move-down button on an item row'
    },
    dragHandle: {
        id: 'xcratch.listEditor.dragHandle',
        defaultMessage: 'Drag to reorder',
        description: 'Tooltip / aria label for the drag handle on an item row'
    },
    emptyHint: {
        id: 'xcratch.listEditor.emptyHint',
        defaultMessage: 'List is empty. Click + Add item to start.',
        description: 'Placeholder shown when the edited list has no items'
    },
    emptyItemPlaceholder: {
        id: 'xcratch.listEditor.emptyItemPlaceholder',
        defaultMessage: '(empty)',
        description: 'Placeholder shown in the preview when an item value is empty'
    },
    itemCount: {
        id: 'xcratch.listEditor.itemCount',
        defaultMessage: '{count, plural, one {# item} other {# items}}',
        description: 'Item-count summary shown in the footer'
    },
    revert: {
        id: 'xcratch.listEditor.revert',
        defaultMessage: 'Revert',
        description: 'Footer button to discard the entire edit session and close the modal'
    }
});

export {listEditorMessages};
export default listEditorMessages;
