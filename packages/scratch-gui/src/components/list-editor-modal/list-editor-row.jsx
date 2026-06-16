import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './list-editor-modal.css';
import {listEditorMessages as messages} from './list-editor-modal-messages.js';

// Maximum characters shown in the row preview before truncation. Longer values
// are abbreviated with an ellipsis; the user opens the editor to see / edit
// the full content.
const PREVIEW_MAX_LENGTH = 80;

const buildPreview = item => {
    if (item === null || typeof item === 'undefined') return '';
    const str = String(item);
    // Collapse whitespace (including newlines) so the preview stays on one line.
    const collapsed = str.replace(/\s+/g, ' ').trim();
    if (collapsed.length <= PREVIEW_MAX_LENGTH) return collapsed;
    return `${collapsed.slice(0, PREVIEW_MAX_LENGTH)}…`;
};

class ListEditorRow extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleDragOver',
            'handleDragStart',
            'handleDrop',
            'handleEdit',
            'handleMoveUp',
            'handleMoveDown',
            'handleRemove'
        ]);
    }
    handleDragOver (e) {
        this.props.onDragOver(e, this.props.idx);
    }
    handleDragStart (e) {
        this.props.onDragStart(e, this.props.idx);
    }
    handleDrop (e) {
        this.props.onDrop(e, this.props.idx);
    }
    handleEdit () {
        this.props.onEdit(this.props.idx);
    }
    handleMoveUp () {
        this.props.onMove(this.props.idx, this.props.idx - 1);
    }
    handleMoveDown () {
        this.props.onMove(this.props.idx, this.props.idx + 1);
    }
    handleRemove () {
        this.props.onRemove(this.props.idx);
    }
    render () {
        const {idx, intl, isDragging, isDragOver, isFirst, isLast,
            item, onDragEnd, onDragLeave} = this.props;
        const preview = buildPreview(item);
        const isEmpty = preview.length === 0;
        return (
            <li
                className={classNames(styles.itemRow, {
                    [styles.dragging]: isDragging,
                    [styles.dragOver]: isDragOver
                })}
            >
                <span
                    aria-label={intl.formatMessage(messages.dragHandle)}
                    className={styles.dragHandle}
                    draggable
                    role="button"
                    title={intl.formatMessage(messages.dragHandle)}
                    onDragEnd={onDragEnd}
                    onDragLeave={onDragLeave}
                    onDragOver={this.handleDragOver}
                    onDragStart={this.handleDragStart}
                    onDrop={this.handleDrop}
                >{'☰'}</span>
                <span className={styles.indexLabel}>{idx + 1}</span>
                <button
                    aria-label={intl.formatMessage(messages.editItem)}
                    className={classNames(styles.itemPreview, {
                        [styles.itemPreviewEmpty]: isEmpty
                    })}
                    title={intl.formatMessage(messages.editItem)}
                    type="button"
                    onClick={this.handleEdit}
                >
                    {isEmpty ? intl.formatMessage(messages.emptyItemPlaceholder) : preview}
                </button>
                <button
                    aria-label={intl.formatMessage(messages.moveUp)}
                    className={styles.moveButton}
                    disabled={isFirst}
                    title={intl.formatMessage(messages.moveUp)}
                    type="button"
                    onClick={this.handleMoveUp}
                >{'↑'}</button>
                <button
                    aria-label={intl.formatMessage(messages.moveDown)}
                    className={styles.moveButton}
                    disabled={isLast}
                    title={intl.formatMessage(messages.moveDown)}
                    type="button"
                    onClick={this.handleMoveDown}
                >{'↓'}</button>
                <button
                    aria-label={intl.formatMessage(messages.removeItem)}
                    className={styles.removeButton}
                    title={intl.formatMessage(messages.removeItem)}
                    type="button"
                    onClick={this.handleRemove}
                >{'×'}</button>
            </li>
        );
    }
}

ListEditorRow.propTypes = {
    idx: PropTypes.number.isRequired,
    intl: PropTypes.shape({formatMessage: PropTypes.func.isRequired}).isRequired,
    isDragOver: PropTypes.bool,
    isDragging: PropTypes.bool,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
    item: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onDragEnd: PropTypes.func.isRequired,
    onDragLeave: PropTypes.func.isRequired,
    onDragOver: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export default ListEditorRow;
