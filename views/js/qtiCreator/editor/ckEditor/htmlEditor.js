/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
define([
    'lodash',
    'i18n',
    'jquery',
    'ckeditor',
    'core/promise',
    'services/features',
    'taoQtiItem/qtiCreator/helper/ckConfigurator',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/deletingState',
    'taoQtiItem/qtiCreator/editor/ckEditor/featureFlag',
    'taoQtiItem/qtiCreator/helper/languages',
    'taoQtiItem/qtiCreator/helper/elementSupport',
], function (
    _,
    __,
    $,
    CKEditor,
    Promise,
    features,
    ckConfigurator,
    Element,
    contentHelper,
    deletingHelper,
    featureFlag,
    languages,
    elementSupportHelper
) {
    'use strict';

    const _defaults = {
        placeholder: __('some text ...'),
        shieldInnerContent: true,
        passthroughInnerContent: false,
        autofocus: true
    };

    const placeholderClass = 'cke-placeholder';
    const languagePluginEnabled = features.isVisible('taoQtiItem/creator/editor/ckEditor/languagePlugin', false);

    let editorFactory;

    //prevent auto inline editor creation:
    CKEditor.disableAutoInline = true;

    /**
     * @param {JQuery} $editable - the element to be transformed into an editor
     * @param {JQuery} $editableContainer - the container of the editor
     * @param {Object} [options]
     * @param {String} [options.placeholder] - the place holder text
     * @param {Boolean} [options.shieldInnerContent] - define if the inner widget content should be protected or not
     * @param {Boolean} [options.passthroughInnerContent] - define if the inner widget content should be accessible directly or not
     * @param {String} [options.removePlugins] - a coma-separated list of plugins that should not be loaded: 'plugin1,plugin2,plugin3'
     * @param {Boolean} [options.autofocus] - automatically focus
     * @param {Boolean?} [options.flushDeletingWidgetsOnDestroy] - before editor destroy, remove widgets which are waiting for delete confirmation
     * @returns {Object} CKEditor
     */
    function _buildEditor($editable, $editableContainer, options) {
        const widget = (options.data || {}).widget,
            areaBroker = widget && widget.getAreaBroker && widget.getAreaBroker(),
            $toolbarArea = areaBroker && areaBroker.getToolbarArea && areaBroker.getToolbarArea();

        options = _.defaults(options, _defaults);

        const isHiddenPlugin = pluginName => !features.isVisible(`taoQtiItem/creator/content/plugin/${pluginName}`);

        const registeredPluginNames = CKEditor.plugins.registered && Object.keys(CKEditor.plugins.registered);
        const removePlugins = [];
        registeredPluginNames.forEach(pluginName => {
            if (isHiddenPlugin(pluginName)) {
                removePlugins.push(pluginName);
            }
        });

        if (options.removePlugins) {
            options.removePlugins.split(',').forEach(removePluginName => {
                removePlugins.push(removePluginName.trim());
            });
        }

        if (!languagePluginEnabled) {
            removePlugins.push('taolanguage');
        }

        if (!($editable instanceof $) || !$editable.length) {
            throw new Error('invalid jquery element for $editable');
        }
        if (!($editableContainer instanceof $) || !$editableContainer.length) {
            throw new Error('invalid jquery element for $editableContainer');
        }

        if (options.placeholder && options.placeholder !== '') {
            if ($editable.is('input')) {
                $editable.attr('placeholder', options.placeholder);
            } else {
                $editable.attr('data-placeholder', options.placeholder);
            }
        }

        const ckConfig = {
            dtdMode: 'qti',
            autoParagraph: false,
            removePlugins: removePlugins.join(','),
            enterMode: options.enterMode || CKEditor.ENTER_P,
            floatSpaceDockedOffsetY: 10,
            language_list: options.language_list,
            sharedSpaces: {
                top: ($toolbarArea && $toolbarArea.attr('id')) || 'toolbar-top'
            },
            taoQtiItem: {
                /**
                 * @param {DOM} tempWidget - this contains the DOM nodes created by a ckEditor plugin,
                 *                           wrapped in a temporary widget container (= a widget container with a [data-new="true"] attribute)
                 */
                insert: function (tempWidget) {
                    const $newContent = $(tempWidget).clone(); // we keep the original content for later use
                    if (options.data && options.data.container && options.data.widget) {
                        const $newImgPlaceholder = $editable.find('[data-new="true"][data-qti-class="img"]');
                        if (
                            $newImgPlaceholder.length &&
                            elementSupportHelper.isFigureSupportedInParent($newImgPlaceholder)
                        ) {
                            // instead img will add figure element
                            $newImgPlaceholder.attr('data-qti-class', 'figure');
                            // span after for new line
                            $('<span>&nbsp;</span>').insertAfter($newImgPlaceholder);
                        }
                        contentHelper.createElements(
                            options.data.container,
                            $editable,
                            _htmlEncode(this.getData()),
                            function (createdWidget) {
                                const createdElement = createdWidget.element;

                                if (_.isFunction(createdElement.initContainer)) {
                                    createdElement.body($newContent.html());
                                    createdWidget.rebuild();
                                    createdWidget = createdElement.data('widget');
                                }
                                _activateInnerWidget(options.data.widget, createdWidget);
                            }
                        );
                        // hide toolbar to prevent double click
                        const editor = $editable.data('editor');
                        editor.focusManager.blur(true);
                    }
                }
            },
            on: {
                instanceReady: function (e) {
                    let widgets = {};
                    const editor = e.editor;

                    //store it in editable elt data attr
                    $editable.data('editor', editor);
                    $editable.data('editor-options', options);

                    //need to debounce the callback to prevent the changes made by undo to trigger the event change twice
                    editor.on(
                        'change',
                        _.debounce(
                            function markupChanged() {
                                _detectWidgetDeletion($editable, widgets, editor);
                                if (_.isFunction(options.change)) {
                                    options.change.call(editor, _htmlEncode(editor.getData()));
                                }
                            },
                            100,
                            {
                                leading: true
                            }
                        )
                    );

                    managePlaceholder($editable, editor);

                    if (options.data && options.data.container) {
                        //store in data-qti-container attribute the editor instance as soon as it is ready
                        $editable.data('qti-container', options.data.container);

                        //init editable
                        widgets = _rebuildWidgets(options.data.container, $editable, {
                            restoreState: true
                        });
                        if (options.shieldInnerContent) {
                            _shieldInnerContent($editable, options.data.widget);
                        }
                    }

                    if (options.autofocus) {
                        _focus(editor);
                    }

                    $editable.trigger('editorready', [editor]);

                    $('.qti-item').trigger('toolbarchange');
                },
                blur: function () {
                    if ($toolbarArea) {
                        $toolbarArea.hide();
                    }
                },
                focus: function () {
                    if ($toolbarArea) {
                        $toolbarArea.show();
                    }

                    //callback:
                    if (_.isFunction(options.focus)) {
                        options.focus.call(this, _htmlEncode(this.getData()));
                    }

                    $editable.trigger('editorfocus');

                    $('.qti-item').trigger('toolbarchange');
                },
                configLoaded: function (e) {
                    //@todo : do we really have to wait here to initialize the config?
                    let toolbarType = options.toolbarType || '';
                    if (options.toolbar && _.isArray(options.toolbar)) {
                        ckConfig.toolbar = options.toolbar;
                    } else {
                        toolbarType = getTooltypeFromContainer($editableContainer);
                    }

                    if (typeof options.qtiMedia !== 'undefined') {
                        ckConfig.qtiMedia = options.qtiMedia;
                    }
                    if (typeof options.qtiImage !== 'undefined') {
                        ckConfig.qtiImage = options.qtiImage;
                    }
                    if (typeof options.qtiInclude !== 'undefined') {
                        ckConfig.qtiInclude = options.qtiInclude;
                    }
                    if (typeof options.highlight !== 'undefined') {
                        ckConfig.highlight = options.highlight;
                    }
                    if (typeof options.mathJax !== 'undefined') {
                        ckConfig.mathJax = options.mathJax;
                    }

                    e.editor.config = ckConfigurator.getConfig(e.editor, toolbarType, ckConfig);
                },
                afterPaste: function () {
                    //@todo : we may add some processing on the editor after paste
                }
            }
        };

        return CKEditor.inline($editable[0], ckConfig);
    }

    /**
     * Handle the placeholder for non-input elements.
     * To avoid CK nasty side-effects of using the placeholder attribute on non-input elements,
     * we handle the placeholder with css.
     * @param {JQuery} $editable
     * @param {Object} editor
     */
    function managePlaceholder($editable, editor) {
        if (!$editable.is('input')) {
            togglePlaceholder($editable);

            editor.on('change', function () {
                togglePlaceholder($editable);
            });
        }
    }

    /**
     * Toggle the placeholder class on the editable depending on its content
     * @param {JQuery} $editable
     */
    function togglePlaceholder($editable) {
        const nonEmptyContent = ['img', 'table', 'math', 'object', 'printedVariable', '.tooltip-target', 'figure'];

        if ($editable.text().trim() === '' && !$editable.find(nonEmptyContent.join(',')).length) {
            $editable.addClass(placeholderClass);
        } else {
            removePlaceholder($editable);
        }
    }

    function removePlaceholder($editable) {
        $editable.removeClass(placeholderClass);
    }

    /**
     * Assess
     * @param {type} $editableContainer
     * @returns {String}
     */
    function getTooltypeFromContainer($editableContainer) {
        let toolbarType = 'qtiFlow';
        // build parameter for toolbar
        if (
            $editableContainer.hasClass('widget-blockInteraction') ||
            $editableContainer.hasClass('widget-textBlock') ||
            $editableContainer.hasClass('widget-rubricBlock')
        ) {
            toolbarType = 'qtiBlock';
        } else if (
            $editableContainer.hasClass('qti-prompt-container') ||
            $editableContainer.hasClass('widget-hottext')
        ) {
            toolbarType = 'qtiInline';
        } else if ($editableContainer.hasClass('widget-table') && !featureFlag.disableCellAlignment) {
            toolbarType = 'qtiTable';
        }
        return toolbarType;
    }

    /**
     * Find an inner element by its data attribute name
     * @param {JQuery} $container
     * @param {String} dataAttribute
     * @returns {JQuery} collection
     */
    function _find($container, dataAttribute) {
        let $collection;

        if ($container.data(dataAttribute)) {
            $collection = $container;
        } else {
            $collection = $container.find(`[data-${dataAttribute}=true]`);
        }
        return $collection;
    }

    /**
     * Rebuild all innerwidgets located inside a container
     *
     * @param {Object} container
     * @param {JQuery} $container
     * @param {Object} options
     * @returns {Object} widgets
     */
    function _rebuildWidgets(container, $container, options) {
        const widgets = {};
        options = options || {};

        //re-init all widgets:
        _.forEach(_.values(container.elements), function (elt) {
            const widget = elt.data('widget');
            const currentState = widget.getCurrentState().name;

            widgets[elt.serial] = widget.rebuild({
                context: $container,
                ready: function (widgetInner) {
                    if (options.restoreState) {
                        //restore current state
                        widgetInner.changeState(currentState);
                    }
                }
            });
        });

        $container.trigger('widgetCreated', [widgets, container]);

        return widgets;
    }

    /**
     * Before destroying editor, remove widgets in "deleting" state.
     * @param {*} container
     * @param {*} $container
     * @param {*} options
     * @returns
     */
    function _flushDeletingWidgets(container) {
        _.forEach(_.values(container.elements), function (elt) {
            const widget = elt.data('widget');
            const currentState = widget.getCurrentState().name;

            //"exit" from "deleting" state will do actual deletion
            if (currentState === 'deleting') {
                widget.changeState('sleep');
            }
        });
    }

    /**
     * Find the widget container by its serial
     *
     * @param {JQuery} $container
     * @param {String} serial
     * @returns {JQuery} $widget
     */
    function _findWidgetContainer($container, serial) {
        // re-query widget container to apply changes in case of deletion
        return $($container.selector).find(`.widget-box[data-serial=${serial}]`);
    }

    /**
     * Detect if an inner widget has been removed
     *
     * @param {JQuery} $container
     * @param {Array} widgets
     * @param {Object} editor
     * @returns {undefined}
     */
    function _detectWidgetDeletion($container, widgets, editor) {
        const deleted = [];
        const container = $container.data('qti-container');

        _.forEach(widgets, function (w) {
            if (!w.element.data('removed')) {
                const $widget = _findWidgetContainer($container, w.serial);
                if (!$widget.length) {
                    deleted.push(w);
                }
            }
        });

        if (deleted.length) {
            const undoCmd = editor.getCommand('undo');
            const $messageBox = deletingHelper.createInfoBox(deleted);

            $messageBox
                .on('confirm.deleting', function () {
                    _.forEach(deleted, function (w) {
                        w.element.remove();
                        w.destroy();
                    });

                    editor.resetUndo();
                })
                .on('undo.deleting', function () {
                    editor.undoManager.undo();

                    //need to rebuild the inner widgets in case the undo restored some qti elements
                    _rebuildWidgets(container, $container, {
                        restoreState: true
                    });

                    _shieldInnerContent($container, container.data('widget'));
                });

            if (undoCmd) {
                //catch ckeditor's undo event to trigger the same behaviour as the undo action dialog
                undoCmd.on('afterUndo', function () {
                    $messageBox.find('a.undo').click();
                });
            }
        }
    }

    /**
     * @param {JQuery} $widget - the widget to be protected
     * @returns {JQuery} The added layer (shield)
     */
    function addShield($widget) {
        const $shield = $('<button>', {
            class: 'html-editable-shield'
        });

        $widget.attr('contenteditable', false);
        $widget.append($shield);
        return $shield;
    }

    /**
     * Protect the inner widgets of a container
     *
     * @param {JQuery} $container
     * @param {Object} containerWidget
     * @returns {undefined}
     */
    function _shieldInnerContent($container, containerWidget) {
        $container.find('.widget-box').each(function () {
            const $widget = $(this);

            addShield($widget).on('click', function (e) {
                //click on shield:
                //1. this.widget.changeState('sleep');
                //2. clicked widget.changeState('active');

                e.stopPropagation();

                const innerWidget = $widget.data('widget');
                _activateInnerWidget(containerWidget, innerWidget);
            });
        });
    }

    /**
     * Activate the inner widget
     *
     * @param {Object} containerWidget
     * @param {Object} innerWidget
     * @returns {undefined}
     */
    function _activateInnerWidget(containerWidget, innerWidget) {
        let listenToWidgetCreation;
        const event = `widgetCreated.${innerWidget.serial}`;

        if (containerWidget && containerWidget.element && containerWidget.element.qtiClass) {
            listenToWidgetCreation = function () {
                containerWidget.$container.on(event, function (e, widgets) {
                    const targetWidget = widgets[innerWidget.serial];
                    if (targetWidget) {
                        containerWidget.$container.off(event);
                        //FIXME potential race condition ? (debounce the enclosing event handler ?)
                        _.delay(function () {
                            if (Element.isA(targetWidget.element, 'interaction')) {
                                targetWidget.changeState('question');
                            } else {
                                targetWidget.changeState('active');
                            }
                        }, 100);
                    }
                });
            };

            if (Element.isA(containerWidget.element, '_container') && !containerWidget.element.data('stateless')) {
                //only _container that are NOT stateless need to change its state to sleep before activating the new one.
                listenToWidgetCreation();
                containerWidget.changeState('sleep');
            } else if (Element.isA(containerWidget.element, 'interaction')) {
                listenToWidgetCreation();
                containerWidget.changeState('sleep');
            } else if (Element.isA(containerWidget.element, 'choice')) {
                listenToWidgetCreation();
                containerWidget.changeState('question');
            } else if (Element.isA(containerWidget.element, 'table')) {
                listenToWidgetCreation();
                containerWidget.changeState('sleep');
            } else if (Element.isA(innerWidget.element, 'choice')) {
                innerWidget.changeState('choice');
            } else {
                innerWidget.changeState('active');
            }
        } else {
            innerWidget.changeState('active');
        }
    }

    /**
     * Special encoding of ouput html generated from ie8 : moved to xmlRenderer
     * @param {String} encodedStr
     * @returns {String} encodedStr
     */
    function _htmlEncode(encodedStr) {
        return encodedStr;
    }

    /**
     * Focus the editor and set the cursor to the end
     *
     * @param {Object} editor - the ckeditor instance
     * @returns {undefined}
     */
    function _focus(editor) {
        if (editor.editable() && editor.editable().$.parentNode) {
            editor.focus();
            const range = editor.createRange();
            range.moveToElementEditablePosition(editor.editable(), true);
            editor.getSelection().selectRanges([range]);
        }
    }

    editorFactory = {
        /**
         * Check if all data-html-editable has an editor
         *
         * @param {type} $container
         * @returns {undefined}
         */
        hasEditor: function ($container) {
            let hasEditor = false;

            _find($container, 'html-editable').each(function () {
                hasEditor = !!$(this).data('editor');
                return hasEditor; //continue if true, break if false
            });

            return hasEditor;
        },
        /**
         * Instanciate the editor
         *
         * @param {JQuery} $container
         * @param {Object} [editorOptions]
         * @param {String} [editorOptions.placeholder] - the place holder text
         * @param {Boolean} [editorOptions.shieldInnerContent] - define if the inner widget content should be protected or not
         * @param {Boolean} [editorOptions.passthroughInnerContent] - define if the inner widget content should be accessible directly or not
         * @param {Boolean} [editorOptions.enterMode] - what is the behavior of the "Enter" key (see ENTER_MODE_xxx in ckEditor configuration)
         * @param {String} [editorOptions.removePlugins] - comma-separated list of plugins to disable
         * @returns {undefined}
         */
        buildEditor: function ($container, editorOptions) {
            return languages
                .getList()
                .then(languages.useCKEFormatting)
                .then(languagesData => {
                    const buildTasks = [];

                    editorOptions.language_list = languagesData;

                    _find($container, 'html-editable-container').each(function () {
                        const $editableContainer = $(this),
                            $editable = $editableContainer.find('[data-html-editable]');

                        buildTasks.push(
                            new Promise(function (resolve) {
                                //need to make the element html editable to enable ck inline editing:
                                $editable.attr('contenteditable', true);

                                //build it
                                _buildEditor($editable, $editableContainer, editorOptions);

                                $editable.on('editorready', resolve);
                            })
                        );
                    });

                    return Promise.all(buildTasks);
                });
        },
        /**
         * Destroy the editor
         *
         * @param {JQuery} $container
         * @returns {undefined}
         */
        destroyEditor: function ($container) {
            const destructTasks = [];
            _find($container, 'html-editable-container').each(function () {
                const $editableContainer = $(this);
                const $editable = $editableContainer.find('[data-html-editable]');

                $editable.removeAttr('contenteditable');
                if ($editable.data('editor')) {
                    destructTasks.push(
                        new Promise(function (resolve) {
                            const editor = $editable.data('editor');
                            const options = $editable.data('editor-options');

                            if (options.flushDeletingWidgetsOnDestroy && $editable.data('qti-container')) {
                                _flushDeletingWidgets($editable.data('qti-container'));
                            }

                            //before destroying, ensure that data is stored
                            if (_.isFunction(options.change)) {
                                options.change.call(editor, _htmlEncode(editor.getData()));
                            }

                            removePlaceholder($editable);

                            editor.on('destroy', function () {
                                $editable.removeData('editor').removeData('editor-options');
                                if ($editable.data('qti-container')) {
                                    _rebuildWidgets($editable.data('qti-container'), $editable);
                                }

                                $editable.trigger('editordestroyed');
                                resolve();
                            });

                            editor.focusManager.blur(true);
                            editor.destroy();
                        })
                    );
                }
            });
            return Promise.all(destructTasks);
        },
        /**
         * Get the editor content
         *
         * @param {JQuery} $editable
         * @returns {String}
         */
        getData: function ($editable) {
            const editor = $editable.data('editor');
            if (editor) {
                return _htmlEncode(editor.getData());
            } else {
                throw new Error('no editor attached to the DOM element');
            }
        },
        /**
         * Allow to set the editor content. Works only with plain text for now.
         *
         * @param {JQuery} $editable
         * @param {String} data
         */
        setData: function ($editable, data) {
            const editor = $editable.data('editor');
            if (editor) {
                if (_.isString(data)) {
                    editor.setData(_.escape(data));
                }
            } else {
                throw new Error('no editor attached to the DOM element');
            }
        },
        /**
         * Focus all the editors found in the given container
         *
         * @param {JQuery} $editable
         * @returns {undefined}
         */
        focus: function ($editable) {
            _find($editable, 'html-editable').each(function () {
                const editor = $(this).data('editor');
                if (editor) {
                    _focus(editor);
                }
            });
        }
    };

    return editorFactory;
});
