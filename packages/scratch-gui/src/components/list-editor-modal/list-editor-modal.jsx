import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import ListEditorRow from './list-editor-row.jsx';
import ListItemEditor from './list-item-editor.jsx';
import {listEditorMessages as messages} from './list-editor-modal-messages.js';

import styles from './list-editor-modal.css';

/**
 * ListEditorModal is a (mostly) controlled component:
 *   - The list-view operations (add / remove / move) commit immediately by
 *     calling `props.onChange(newValue)`. The list itself is read from
 *     `props.value` on every render.
 *   - The single-item editor is the only buffered area: typing into the
 *     textarea updates internal `editingValue` state, and the change is
 *     committed to `props.onChange` only when the user presses OK. Cancel
 *     discards the buffered edit.
 *
 * The modal close button (×) and clicks outside the modal invoke
 * `props.onClose`. There is no separate Save / Cancel for the list view.
 */
class ListEditorModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleAdd',
            'handleDragEnd',
            'handleDragLeave',
            'handleDragOver',
            'handleDragStart',
            'handleDrop',
            'handleEditCancel',
            'handleEditCommit',
            'handleEditOpen',
            'handleEditingChange',
            'handleMove',
            'handleRemove',
            'handleRequestClose',
            'handleToggleMaximize'
        ]);
        this.state = {
            draggingIndex: null,
            dragOverIndex: null,
            // null when showing the list view; an index while editing one item.
            editingIndex: null,
            editingValue: '',
            isMaximized: false
        };
    }
    // ---- list-view operations (immediate commit) ------------------------
    handleAdd () {
        const value = this._normalizedValue();
        const next = value.concat(['']);
        this.props.onChange(next);
        // Move directly into the editor on the new (empty) item.
        this.setState({
            editingIndex: next.length - 1,
            editingValue: '',
            isMaximized: false
        });
    }
    handleRemove (idx) {
        const next = this._normalizedValue();
        next.splice(idx, 1);
        this.props.onChange(next);
    }
    handleMove (from, to) {
        if (from === to) return;
        const value = this._normalizedValue();
        if (to < 0 || to >= value.length) return;
        const next = value.slice();
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        this.props.onChange(next);
    }
    handleDragStart (e, idx) {
        e.dataTransfer.effectAllowed = 'move';
        try {
            e.dataTransfer.setData('text/plain', String(idx));
        } catch (err) { /* noop */ }
        this.setState({draggingIndex: idx});
    }
    handleDragOver (e, idx) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (this.state.dragOverIndex !== idx) {
            this.setState({dragOverIndex: idx});
        }
    }
    handleDragLeave () {
        if (this.state.dragOverIndex !== null) {
            this.setState({dragOverIndex: null});
        }
    }
    handleDrop (e, idx) {
        e.preventDefault();
        let from = this.state.draggingIndex;
        if (from === null) {
            const raw = e.dataTransfer.getData('text/plain');
            const parsed = parseInt(raw, 10);
            if (!isNaN(parsed)) from = parsed;
        }
        this.setState({draggingIndex: null, dragOverIndex: null});
        if (from === null) return;
        this.handleMove(from, idx);
    }
    handleDragEnd () {
        if (this.state.draggingIndex !== null || this.state.dragOverIndex !== null) {
            this.setState({draggingIndex: null, dragOverIndex: null});
        }
    }
    // ---- single-item editor (buffered until OK) ------------------------
    handleEditOpen (idx) {
        const value = this._normalizedValue();
        const current = value[idx];
        this.setState({
            editingIndex: idx,
            editingValue: current === null || typeof current === 'undefined' ? '' : String(current),
            isMaximized: false
        });
    }
    handleEditingChange (newValue) {
        this.setState({editingValue: newValue});
    }
    handleEditCancel () {
        // Explicit Cancel: drop the in-progress edit, return to the list view.
        this.setState({editingIndex: null, editingValue: '', isMaximized: false});
    }
    handleEditCommit () {
        // Back arrow, × button, off-modal click: commit the in-progress edit
        // to the list before returning to the list view (or closing).
        const {editingIndex, editingValue} = this.state;
        if (editingIndex === null) return;
        const value = this._normalizedValue();
        if (editingIndex >= 0 && editingIndex < value.length) {
            const next = value.slice();
            next[editingIndex] = editingValue;
            this.props.onChange(next);
        }
        this.setState({editingIndex: null, editingValue: '', isMaximized: false});
    }
    handleToggleMaximize () {
        this.setState(prev => ({isMaximized: !prev.isMaximized}));
    }
    // ---- modal-level actions --------------------------------------------
    handleRequestClose () {
        // The Modal × button and clicks outside the modal commit any
        // in-progress single-item edit before stepping back. On the list view
        // this just closes the whole modal.
        if (this.state.editingIndex === null) {
            this.props.onClose();
        } else {
            this.handleEditCommit();
        }
    }
    _normalizedValue () {
        const raw = this.props.value || [];
        return raw.map(item => {
            if (item === null || typeof item === 'undefined') return '';
            return String(item);
        });
    }
    render () {
        const {intl, listName} = this.props;
        const {draggingIndex, dragOverIndex, editingIndex, editingValue, isMaximized} = this.state;
        const value = this._normalizedValue();
        const isEditing = editingIndex !== null;
        const contentLabel = isEditing ?
            intl.formatMessage(messages.editingTitle, {
                listName,
                index: editingIndex + 1
            }) : intl.formatMessage(messages.title, {listName});
        const isFullScreen = isEditing && isMaximized;
        return (
            <Modal
                className={classNames(styles.modalContent, {
                    [styles.modalContentMaximized]: isFullScreen
                })}
                contentLabel={contentLabel}
                fullScreen={isFullScreen}
                onRequestClose={this.handleRequestClose}
            >
                {isEditing ? (
                    <ListItemEditor
                        idx={editingIndex}
                        intl={intl}
                        isMaximized={isMaximized}
                        listName={listName}
                        value={editingValue}
                        onBack={this.handleEditCommit}
                        onCancel={this.handleEditCancel}
                        onChange={this.handleEditingChange}
                        onToggleMaximize={this.handleToggleMaximize}
                    />
                ) : (
                    <Box
                        direction="column"
                        grow={1}
                    >
                        <div className={styles.body}>
                            {value.length === 0 ? (
                                <div className={styles.emptyHint}>
                                    {intl.formatMessage(messages.emptyHint)}
                                </div>
                            ) : (
                                <ul className={styles.itemList}>
                                    {value.map((item, idx) => (
                                        <ListEditorRow
                                            key={idx}
                                            idx={idx}
                                            intl={intl}
                                            isDragOver={dragOverIndex === idx && draggingIndex !== idx}
                                            isDragging={draggingIndex === idx}
                                            isFirst={idx === 0}
                                            isLast={idx === value.length - 1}
                                            item={item}
                                            onDragEnd={this.handleDragEnd}
                                            onDragLeave={this.handleDragLeave}
                                            onDragOver={this.handleDragOver}
                                            onDragStart={this.handleDragStart}
                                            onDrop={this.handleDrop}
                                            onEdit={this.handleEditOpen}
                                            onMove={this.handleMove}
                                            onRemove={this.handleRemove}
                                        />
                                    ))}
                                </ul>
                            )}
                            <div className={styles.itemCount}>
                                <FormattedMessage
                                    {...messages.itemCount}
                                    values={{count: value.length}}
                                />
                            </div>
                        </div>
                        <div className={styles.footer}>
                            <button
                                className={styles.addItemButton}
                                type="button"
                                onClick={this.handleAdd}
                            >
                                {`+ ${intl.formatMessage(messages.addItem)}`}
                            </button>
                            <button
                                className={styles.revertButton}
                                type="button"
                                onClick={this.props.onRevert}
                            >
                                {intl.formatMessage(messages.revert)}
                            </button>
                        </div>
                    </Box>
                )}
            </Modal>
        );
    }
}

ListEditorModal.propTypes = {
    intl: PropTypes.shape({formatMessage: PropTypes.func.isRequired}).isRequired,
    listName: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onRevert: PropTypes.func.isRequired,
    value: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    )
};

ListEditorModal.defaultProps = {
    listName: '',
    value: []
};

export default ListEditorModal;
