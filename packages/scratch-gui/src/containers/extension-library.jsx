import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from '@scratch/scratch-vm';
import {defineMessages, injectIntl} from 'react-intl';
import intlShape from '../lib/intlShape.js';
import log from '../lib/log.js';

import extensionLibraryContent from '../lib/libraries/extensions/index.jsx';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

import {prompt, confirm, alert} from '../lib/async-modal.jsx';

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    },
    extensionUrl: {
        defaultMessage: 'Enter the URL of the extension',
        description: 'Prompt for unofficial extension url',
        id: 'gui.extensionLibrary.extensionUrl'
    },
    confirmReplacing: {
        defaultMessage: 'Do you want to replace extension\n\nextension name: {name}\nload from: {url}',
        description: 'Confirm for replacing of the extension',
        id: 'xcratch.extensionLibrary.confirmReplacingExtension'
    },
    couldNotLoadExtension: {
        defaultMessage: 'Could not load extension from: ',
        description: 'Error message when extension could not be loaded',
        id: 'xcratch.extensionLibrary.couldNotLoadExtension'
    }
});

/**
 * Holds the preloaded extensions
 * @type {Array<{entry: Object, blockClass: Object}>?}
 */
let preloadedExtensions = [];
let preloaded = false;

/**
 * Load preloaded extensions
 * @returns {Promise<Array<{entry: object, blockClass: object}>>} - Preloaded extensions
 */
const loadModules = async () => {
    if (preloaded) {
        return preloadedExtensions;
    }

    // Set flag immediately to prevent concurrent calls
    preloaded = true;

    try {
        let extensions = [];
        try {
            // Check if preload.json exists at compile time and load it.
            const preloadContext = import.meta.webpackContext(
                '../../preload',
                {regExp: /^\.\/preload\.json$/, mode: 'lazy'}
            );
            if (preloadContext.keys().includes('./preload.json')) {
                const preloadJson = await preloadContext('./preload.json');
                extensions = preloadJson.default || preloadJson;
            }
        } catch (e) {
            // This can happen if the preload directory does not exist.
            extensions = [];
        }
        
        if (!Array.isArray(extensions)) {
            log.warn('Invalid preload.json format');
            return preloadedExtensions;
        }

        // Create webpack context for preload directory
        let preloadContext = null;
        try {
            preloadContext = import.meta.webpackContext('/preload', {
                recursive: true,
                regExp: /extension\.mjs$/
            });
        } catch (contextError) {
            return preloadedExtensions;
        }

        // Skip if no extensions to load
        if (extensions.length === 0) {
            return preloadedExtensions;
        }

        // Load each extension module using webpack context
        const modules = await Promise.all(
            extensions.map(async ext => {
                try {
                    // Convert file path to webpack context key
                    const contextKey = `./${ext.path}`;
                    const module = await preloadContext(contextKey);
                    return {
                        entry: module.entry,
                        blockClass: module.blockClass,
                        url: ext.url
                    };
                } catch (error) {
                    log.warn(`Failed to load extension ${ext.url}:`, error);
                    return null;
                }
            })
        );

        // Filter out failed loads
        preloadedExtensions = modules.filter(module => module && module.entry && module.blockClass);

        // Sort by name
        preloadedExtensions.sort((a, b) => {
            const nameA = a.entry.name.defaultMessage ?
                a.entry.name.defaultMessage :
                a.entry.name;
            const nameB = b.entry.name.defaultMessage ?
                b.entry.name.defaultMessage :
                b.entry.name;
            return nameA.localeCompare(nameB);
        });

        // Register all preloaded extensions
        preloadedExtensions.forEach(({entry, url}) => {
            entry.category = 'preloaded';
            entry.extensionURL = url;
            // Check if extension is already in the library to prevent duplicates
            const existingIndex = extensionLibraryContent.findIndex(
                item => item.extensionId === entry.extensionId ||
                        (item.extensionURL && item.extensionURL === url)
            );
            if (existingIndex === -1) {
                extensionLibraryContent.push(entry);
            }
        });

        return preloadedExtensions;
    } catch (error) {
        log.info('Error loading preloaded extensions:', error);
        return preloadedExtensions;
    }
};

// Load preloaded extensions
loadModules().then(extensions => {
    log.info('Extensions preloaded:', extensions.map(({entry}) => entry.extensionId));
});

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        extensionLibraryContent.forEach(extension => {
            if (extension.setFormatMessage) {
                extension.setFormatMessage(this.props.intl.formatMessage);
            }
            if (extension.translationMap) {
                Object.assign(
                    this.props.intl.messages,
                    extension.translationMap[this.props.intl.locale]
                );
            }
        });
        bindAll(this, [
            'handleItemSelect'
        ]);

        if (!preloaded) {
        // Set preloaded extensions into VM for fallback when loading extension class from URL.
            preloadedExtensions.forEach(({entry, blockClass}) => {
                this.props.vm.extensionManager
                    .registerExtensionBlock(entry, blockClass, true); // true: preloaded
            });
            // Clear preloadedExtensions to avoid duplicate registration.
            preloaded = true;
        }
        // Load extension class from the URL.
        // Workaround to avoid official translation process.
        Object.assign(
            this.props.intl.messages,
            translations[this.props.intl.locale]
        );
    }
    handleItemSelect (item) {
        let id = item.extensionId;
        const url = item.extensionURL ? item.extensionURL : id;
        if (!item.disabled && !id) {
            let inputUrl = url;
            return prompt(
                {
                    message: this.props.intl.formatMessage(messages.extensionUrl),
                    valueType: 'url',
                    initialValue: 'https://xcratch.github.io/xcx-example/dist/xcratchExample.mjs'
                })
                .then(userInput => {
                    inputUrl = userInput;
                    return this.props.vm.extensionManager.fetchExtension(userInput);
                })
                .then(({entry, blockClass}) => {
                    id = entry.extensionId;
                    const existingEntry = extensionLibraryContent.find(libEntry => libEntry.extensionId === id);
                    if (existingEntry) {
                        return confirm(
                            {
                                message: this.props.intl.formatMessage(
                                    messages.confirmReplacing,
                                    {
                                        name: existingEntry.name.props ?
                                            this.props.intl.formatMessage(existingEntry.name.props) :
                                            existingEntry.name,
                                        url: blockClass.extensionURL
                                    }
                                )
                            })
                            .then(doReplace => {
                                if (doReplace) {
                                    this.props.vm.extensionManager.registerExtensionBlock(entry, blockClass);
                                    this.props.onCategorySelected(id);
                                }
                            });
                    }
                    this.props.vm.extensionManager.registerExtensionBlock(entry, blockClass);
                    this.props.onCategorySelected(id);
                })
                .catch(error => {
                    log.info(`Could not load extension class from ${inputUrl}:\n${error.stack}\n`);
                    alert({
                        message: this.props.intl.formatMessage(
                            messages.couldNotLoadExtension,
                            {url: inputUrl}
                        )
                    });
                    return;
                });
        }
        if (id && !item.disabled) {
            if (this.props.vm.extensionManager.isExtensionLoaded(id)) {
                this.props.onCategorySelected(id);
                return Promise.resolve();
            }
            return this.props.vm.extensionManager.loadExtensionURL(url)
                .then(() => {
                    this.props.onCategorySelected(id);
                });
        }
    }
    render () {
        const extensionLibraryThumbnailData = extensionLibraryContent.map(extension => ({
            rawURL: extension.iconURL || extensionIcon,
            ...extension
        }));
        return (
            <LibraryComponent
                data={extensionLibraryThumbnailData}
                filterable={false}
                id="extensionLibrary"
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
                showNewFeatureCallouts={this.props.showNewFeatureCallouts}
                username={this.props.username}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired,
    username: PropTypes.string,
    showNewFeatureCallouts: PropTypes.bool
};

export default injectIntl(ExtensionLibrary);
