define([
    'lodash',
    'i18n',
    'jquery',
    'ckeditor',
    'ckConfigurator',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/widgets/helpers/content',
    'taoQtiItem/qtiCreator/widgets/helpers/deletingState'
], function(_, __, $, CKEditor, ckConfigurator, Element, contentHelper, deletingHelper) {

    //prevent auto inline editor creation:
    CKEditor.disableAutoInline = true;

    var _defaults = {
        placeholder: __('some text ...')
    };

    var _buildEditor = function($editable, $editableContainer, options) {

        var $trigger,
            toolbarType;

        options = _.defaults(options, _defaults);

        if (!$editable instanceof $ || !$editable.length) {
            throw 'invalid jquery element for $editable';
        }
        if (!$editableContainer instanceof $ || !$editableContainer.length) {
            throw 'invalid jquery element for $editableContainer';
        }

        $trigger = $editableContainer.find('[data-role="cke-launcher"]');
        $editable.attr('placeholder', options.placeholder);

        // build parameter for toolbar
        if ($editableContainer.hasClass('widget-blockInteraction') || $editableContainer.hasClass('widget-textBlock') || $editableContainer.hasClass('widget-rubricBlock')) {

            toolbarType = 'qtiBlock';

        } else if ($editableContainer.hasClass('qti-prompt-container') || $editableContainer.hasClass('widget-hottext')) {

            toolbarType = 'qtiInline';

        } else {

            toolbarType = 'qtiFlow';
        }

        var ckConfig = {
            autoParagraph: false,
            floatSpaceDockedOffsetY: 10,
            taoQtiItem: {
                insert: function() {
                    if (options.data && options.data.container && options.data.widget) {
                        contentHelper.createElements(options.data.container, $editable, this.getData(), function(createdWidget) {
                            _activateInnerWidget(options.data.widget, createdWidget);
                        });
                    }
                }
            },
            floatSpace: {
                debug: true,
                initialHide: true,
                centerElement: function() {
                    //cke initialize the config too early.. so need to provide a callback to initialize it...
                    return $editableContainer.find('[data-role="cke-launcher"]')[0];
                },
                on: {
                    ready: function(floatSpaceApi) {

                        // works around tiny bug in tao floating space
                        // nose must be in .cke_toolbox rather than .cke
                        // otherwise z-indexing will fail
                        var nose = $(this).find('.cke_nose'),
                            oldParent = nose.parent(),
                            newParent = $(this).find('.cke_toolbox');
                        if (oldParent.is('.cke')) {
                            newParent.append(nose);
                        }

                        floatSpaceApi.hide();
                        //@todo namespace this event: .editor.qti-widget or stuff...
                        $trigger.on('click', function() {
                            if ($trigger.hasClass('active')) {
                                $trigger.removeClass('active');
                                floatSpaceApi.hide();
                            } else {
                                $trigger.addClass('active');
                                floatSpaceApi.show();
                            }
                        });

                    },
                    changeMode: function(oldYMode, newYMode) {
                        var element = this,
                            $element = $(element),
                            $nose = $element.find('.cke_nose');

                        var xModeIsReady = function(domElem) {
                            var dfd = new $.Deferred(),
                                counter = 0,
                                check = setInterval(function() {
                                    var style = domElem.getAttribute('style');
                                    if (counter > 5 || style.indexOf('left') > -1 || style.indexOf('right') > -1) {
                                        dfd.resolve();
                                        clearInterval(check);
                                    }
                                    counter++;
                                }, 1000);
                            return dfd.promise();
                        };

                        if (oldYMode !== newYMode) {
                            $nose.removeClass('float-space-' + oldYMode).addClass('float-space-' + newYMode);
                        }

                        $.when(xModeIsReady(element)).done(function() {
                            if ( !! element.style.left && !element.style.right) {
                                $nose.removeClass('float-space-right').addClass('float-space-left');
                            } else {
                                $nose.removeClass('float-space-left').addClass('float-space-right');
                            }
                        });
                    }
                }
            },
            on: {
                instanceReady: function(e) {

                    var widgets = {};

                    //store it in editable elt data attr
                    $editable.data('editor', e.editor);

                    e.editor.on('change', function(e) {

                        _detectWidgetDeletion($editable, widgets, e.editor);

                        //callback:
                        if (_.isFunction(options.change)) {
                            var data = this.getData();
                            options.change.call(this, _htmlEncode(data));
                        }
                    });

                    if (options.data && options.data.container) {

                        //store in data-qti-container attribute the editor instance as soon as it is ready
                        $editable.data('qti-container', options.data.container);

                        //init editable
                        widgets = _rebuildWidgets(options.data.container, $editable);
                        _shieldInnerContent($editable, options.data.widget);
                    }

                    _focus(e.editor);

                    $editable.trigger('editorready', [e.editor]);
                    $('.qti-item').trigger('toolbarchange');
                },
                focus: function(e) {
                    //show trigger
                    $editableContainer.find('[data-role="cke-launcher"]').hide();
                    $trigger.show();

                    //callback:
                    if (_.isFunction(options.focus)) {
                        options.focus.call(this, this.getData());
                    }

                },
                blur: function(e) {

                },
                configLoaded: function(e) {
                    e.editor.config = ckConfigurator.getConfig(e.editor, toolbarType, ckConfig);
                }
            }
        };

        return CKEditor.inline($editable[0], ckConfig);
    };

    var _find = function($container, dataAttribute) {

        var $collection;

        if ($container.data(dataAttribute)) {
            $collection = $container;
        } else {
            $collection = $container.find('[data-' + dataAttribute + '=true]');
        }
        return $collection;
    };

    var _destroyWidgets = function(container) {

        _.each(_.values(container.elements), function(elt) {
            elt.data('widget').destroy();
        });

    };

    var _rebuildWidgets = function(container, $container) {

        var widgets = {};

        //re-init all widgets:
        _.each(_.values(container.elements), function(elt) {
            widgets[elt.serial] = elt.data('widget').rebuild({
                context: $container
            });
        });

        $container.trigger('widgetCreated', [widgets, container]);

        return widgets;
    };

    var _findWidgetContainer = function($container, serial) {
        return $container.find('.widget-box[data-serial=' + serial + ']');
    };

    var _detectWidgetDeletion = function($container, widgets, editor) {

        var deleted = [];

        _.each(widgets, function(w) {
            var $widget = _findWidgetContainer($container, w.serial);
            if (!$widget.length) {
                deleted.push(w);
            }
        });

        if (deleted.length) {

            var $messageBox = deletingHelper.createInfoBox(deleted);
            $messageBox.on('confirm.deleting', function() {

                _.each(deleted, function(w) {
                    w.element.remove();
                    w.destroy();
                });
            }).on('undo.deleting', function() {

                editor.undoManager.undo();
            });

        }
    };

    var _shieldInnerContent = function($container, containerWidget) {

        $container.find('.widget-box').each(function() {

            var $widget = $(this);
            var innerWidget = $widget.data('widget');
            var $shield = $('<button>', {
                'class': 'html-editable-shield'
            });

            $widget.attr('contenteditable', false);
            $widget.append($shield);
            $shield.on('click', function(e) {

                //click on shield: 
                //1. this.widget.changeState('sleep');
                //2. clicked widget.changeState('active');

                e.stopPropagation();

                _activateInnerWidget(containerWidget, innerWidget);

            });

        });

    };

    var _activateInnerWidget = function(containerWidget, innerWidget) {

        if (containerWidget && containerWidget.element && containerWidget.element.qtiClass) {

            containerWidget.$container.one('widgetCreated', function(e, widgets) {
                var targetWidget = widgets[innerWidget.serial];
                if (targetWidget) {
                    //@todo : fix this race condition
                    _.delay(function() {
                        
                        if(Element.isA(innerWidget.element, 'interaction')){
                            targetWidget.changeState('question');
                        }else{
                            targetWidget.changeState('active');
                        }
                        
                    }, 100);
                }
            });

            if (Element.isA(containerWidget.element, '_container')) {
                containerWidget.changeState('sleep');
            } else if (Element.isA(containerWidget.element, 'choice')) {
                containerWidget.changeState('question');
            }

        } else {
            innerWidget.changeState('active');

        }
    };

    /**
     * Special encoding of ouput html generated from ie8
     */
    var _htmlEncode = function(encodedStr) {

        var returnValue = '';

        if (encodedStr) {
            //<br...> are replaced by <br... />
            returnValue = encodedStr;
            returnValue = returnValue.replace(/<br([^>]*)?>/ig, '<br />');
            returnValue = returnValue.replace(/<hr([^>]*)?>/ig, '<hr />');

            //<img...> are replaced by <img... />
            returnValue = returnValue.replace(/(<img([^>]*)?\s?[^\/]>)+/ig,
                function($0, $1) {
                    return $0.replace('>', ' />');
                });
        }

        return returnValue;
    };

    var _focus = function(editor) {

        editor.focus();
        var range = editor.createRange();
        range.moveToElementEditablePosition(editor.editable(), true);
        editor.getSelection().selectRanges([range]);
    };

    var editorFactory = {
        /**
         * Check if all data-html-editable has an editor
         *
         * @param {type} $container
         * @returns {undefined}
         */
        hasEditor: function($container) {

            var hasEditor = false;

            _find($container, 'html-editable').each(function() {
                hasEditor = !! $(this).data('editor');
                return hasEditor; //continue if true, break if false
            });

            return hasEditor;
        },
        buildEditor: function($container, editorOptions) {

            _find($container, 'html-editable-container').each(function() {

                var editor,
                    $editableContainer = $(this),
                    $editable = $editableContainer.find('[data-html-editable]');

                //need to make the element html editable to enable ck inline editing:
                $editable.attr('contenteditable', true);

                //build it
                editor = _buildEditor($editable, $editableContainer, editorOptions);
            });

        },
        destroyEditor: function($container) {

            _find($container, 'html-editable-container').each(function() {

                var $editableContainer = $(this),
                    $editable = $editableContainer.find('[data-html-editable]');

                $editableContainer.find('[data-role="cke-launcher"]')
                    .off()
                    .removeClass('active')
                    .hide();

                $editable.removeAttr('contenteditable');
                if ($editable.data('editor')) {

                    var editor = $editable.data('editor');
                    editor.focusManager.blur();
                    editor.destroy();

                    $editable.removeData('editor');
                    if ($editable.data('qti-container')) {
                        _rebuildWidgets($editable.data('qti-container'), $editable);
                    }
                }
            });
        }
    };

    return editorFactory;
});