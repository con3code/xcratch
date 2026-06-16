import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './list-editor-modal.css';
import {listEditorMessages as messages} from './list-editor-modal-messages.js';

/**
 * Sub-view rendered inside the list editor modal when the user is editing a
 * single item. Hosts a large textarea (suitable for paragraphs of text) and
 * exposes a maximize toggle so the user can expand the modal to fill the
 * viewport via the `onToggleMaximize` callback.
 *
 * Commit semantics:
 *   - The toolbar "← back" button, the modal × button and clicks outside the
 *     modal (handled by the parent) commit the current edit by calling
 *     `onBack`. The text the user typed becomes the new list item.
 *   - The "Cancel" footer button discards the in-progress edit by calling
 *     `onCancel`. The list item reverts to its previous value.
 */
class ListItemEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleBack',
            'handleCancel',
            'handleChange',
            'handleTextareaRef',
            'handleToggleMaximize'
        ]);
    }
    componentDidMount () {
        if (this.textareaRef) {
            this.textareaRef.focus();
            const len = this.textareaRef.value.length;
            try {
                this.textareaRef.setSelectionRange(len, len);
            } catch (e) { /* noop */ }
        }
    }
    handleBack () {
        this.props.onBack();
    }
    handleCancel () {
        this.props.onCancel();
    }
    handleChange (e) {
        this.props.onChange(e.target.value);
    }
    handleTextareaRef (el) {
        this.textareaRef = el;
    }
    handleToggleMaximize () {
        this.props.onToggleMaximize();
    }
    render () {
        const {idx, intl, isMaximized, listName, value} = this.props;
        const title = intl.formatMessage(messages.editingTitle, {
            listName,
            index: idx + 1
        });
        const maximizeLabel = intl.formatMessage(
            isMaximized ? messages.restore : messages.maximize
        );
        return (
            <div
                className={classNames(styles.editorView, {
                    [styles.editorViewMaximized]: isMaximized
                })}
            >
                <div className={styles.editorToolbar}>
                    <button
                        aria-label={intl.formatMessage(messages.back)}
                        className={styles.toolbarButton}
                        title={intl.formatMessage(messages.back)}
                        type="button"
                        onClick={this.handleBack}
                    >{'←'}</button>
                    <div className={styles.editorTitle}>{title}</div>
                    <button
                        aria-label={maximizeLabel}
                        aria-pressed={isMaximized}
                        className={styles.toolbarButton}
                        title={maximizeLabel}
                        type="button"
                        onClick={this.handleToggleMaximize}
                    >{isMaximized ? '⇲' : '⛶'}</button>
                </div>
                <textarea
                    ref={this.handleTextareaRef}
                    className={styles.editorTextarea}
                    value={value}
                    onChange={this.handleChange}
                />
                <div className={styles.footer}>
                    <button
                        className={styles.actionsLeft}
                        type="button"
                        onClick={this.handleCancel}
                    >
                        {intl.formatMessage(messages.cancel)}
                    </button>
                </div>
            </div>
        );
    }
}

ListItemEditor.propTypes = {
    idx: PropTypes.number.isRequired,
    intl: PropTypes.shape({formatMessage: PropTypes.func.isRequired}).isRequired,
    isMaximized: PropTypes.bool,
    listName: PropTypes.string,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onToggleMaximize: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
};

ListItemEditor.defaultProps = {
    isMaximized: false,
    listName: ''
};

export default ListItemEditor;
