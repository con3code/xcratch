import {defineMessages, FormattedMessage, useIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';

import styles from './value-editor-prompt.css';


const messages = defineMessages({
    variableTitle: {
        defaultMessage: 'Value of "{name}"',
        description: 'Title of the value editor modal for a variable',
        id: 'xcratch.valueEditor.variableTitle'
    },
    listItemTitle: {
        defaultMessage: 'Item {index} of "{name}"',
        description: 'Title of the value editor modal for a list item',
        id: 'xcratch.valueEditor.listItemTitle'
    }
});

const ValueEditorPromptComponent = props => {
    const intl = useIntl();
    const [value, setValue] = React.useState(props.defaultValue);
    const {onOk} = props;
    const handleChange = React.useCallback(e => setValue(e.target.value), []);
    const handleOk = React.useCallback(() => onOk(value), [onOk, value]);
    const title = props.isList ?
        intl.formatMessage(messages.listItemTitle, {name: props.variableName, index: props.index}) :
        intl.formatMessage(messages.variableTitle, {name: props.variableName});
    return (
        <Modal
            className={styles.modalContent}
            contentLabel={title}
            id="valueEditorPrompt"
            onRequestClose={props.onCancel}
        >
            <Box className={styles.body}>
                <Box>
                    <textarea
                        autoFocus
                        className={styles.valueTextarea}
                        name={title}
                        value={value}
                        onChange={handleChange}
                    />
                </Box>
                <Box className={styles.buttonRow}>
                    <button
                        className={styles.cancelButton}
                        onClick={props.onCancel}
                    >
                        <FormattedMessage
                            defaultMessage="Cancel"
                            description="Button in prompt for cancelling the dialog"
                            id="gui.prompt.cancel"
                        />
                    </button>
                    <button
                        className={styles.okButton}
                        onClick={handleOk}
                    >
                        <FormattedMessage
                            defaultMessage="OK"
                            description="Button in prompt for confirming the dialog"
                            id="gui.prompt.ok"
                        />
                    </button>
                </Box>
            </Box>
        </Modal>
    );
};

ValueEditorPromptComponent.propTypes = {
    defaultValue: PropTypes.string.isRequired,
    index: PropTypes.number,
    isList: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    variableName: PropTypes.string.isRequired
};

export default ValueEditorPromptComponent;
