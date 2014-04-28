define([
    'lodash',
    'jquery',
    'ckeditor',
    'i18n',
    'taoQtiItem/qtiCreator/editor/ckEditor/ckProtector',
    'ckConfigurator'
],
    function(_, $, CKEditor, __, ckProtector, ckConfigurator){


        //prevent auto inline editor creation:
        CKEditor.disableAutoInline = true;

        //CKEDITOR.dtd.$editable.span = 1;//buggy!

        var _defaults = {
            placeholder : __('some text ...')
        };

        var _buildEditor = function($editable, $editableContainer, options){

            var $trigger,
                widgetClass,
                toolbarType;

            options = _.defaults(options, _defaults);

            if(!$editable instanceof $ || !$editable.length){
                throw 'invalid jquery element for $editable';
            }
            if(!$editableContainer instanceof $ || !$editableContainer.length){
                throw 'invalid jquery element for $editableContainer';
            }

            $trigger = $editableContainer.find('[data-role="cke-launcher"]');
            $editable.attr('placeholder', options.placeholder);

//            ckProtector.protect($editable);

            // build parameter for toolbar
            // @todo sam coreect class names
            widgetClass = $editable.parent().attr('class');
            switch(true){
                case widgetClass.indexOf('qti-blockInteraction') > -1:
                    toolbarType = 'qtiBlock';
                    break;

                case widgetClass.indexOf('widget-box widget-textBlock edit-sleep') > -1:
                    toolbarType = 'qtiInline';
                    break;

                default:
                    toolbarType = 'qtiFlow';
            }

            var ckConfig = {
                floatSpace : {
                    debug : true,
                    initialHide : true,
                    centerElement : function(){
                        //cke initialize the config too early.. so need to provide a callback to initialize it...
                        return $editableContainer.find('[data-role="cke-launcher"]')[0];
                    },
                    on : {
                        ready : function(floatSpaceApi){

                            floatSpaceApi.hide();
                            //@todo namespace this event: .editor.qti-widget or stuff...
                            $trigger.on('click', function(){
                                if($trigger.hasClass('active')){
                                    $trigger.removeClass('active');
                                    floatSpaceApi.hide();
                                }else{
                                    $trigger.addClass('active');
                                    floatSpaceApi.show();
                                }
                            });

                        },
                        changeMode : function(oldMode, newMode){
                            if(oldMode !== newMode){
                                $(this).find('.cke_nose').removeClass('float-space-' + oldMode).addClass('float-space-' + newMode);
                            }
                        }
                    }
                },
                on : {
                    instanceReady : function(e){
                        e.editor.on('change', function(e){
                            //callback:
                            if(_.isFunction(options.change)){
                                options.change.call(this, this.getData());
                            }
                        });

                        if(options.data && options.data.element){
                            _rebuildWidgets(options.data.element, $editable);
                            $editable.data('qti-element', options.data.element);
                            _shieldInnerContent($editable, options.data.widget);
                        }
                    },
                    focus : function(e){

                        //show trigger
                        $editableContainer.find('[data-role="cke-launcher"]').hide();
                        $trigger.show();

                        //callback:
                        if(_.isFunction(options.focus)){
                            options.focus.call(this, this.getData());
                        }

                        //shield inner widgets:
//                        _shieldInnerContent($editable, options.data.widget);

                    },
                    blur : function(e){

                        // unshield inner widgets:
                        //@todo

                        $trigger.hide();
                    },
                    configLoaded : function(e){
                        e.editor.config = ckConfigurator.getConfig(e.editor, toolbarType);
                    }
                }
            };

            return CKEditor.inline($editable[0], ckConfig);
        };

        var _find = function($container, dataAttribute){

            var $collection;

            if($container.data(dataAttribute)){
                $collection = $container;
            }else{
                $collection = $container.find('[data-' + dataAttribute + '=true]');
            }
            return $collection;
        };

        var _rebuildWidgets = function(container, $container){

            var widgets = {};
            //reinit all widgets:
            _.each(_.values(container.elements), function(elt){
                var $widget = $container.find('.widget-box[data-serial=' + elt.serial + ']');
                elt.render($widget);
                var widget = elt.postRender();
                widgets[widget.serial] = widget;
            });
            $container.trigger('widgetCreated', [widgets, container]);
        };

        var _shieldInnerContent = function($container, containerWidget){

            $container.find('.widget-box').each(function(){

                var $widget = $(this);
                var targetWidgetSerial = $widget.data('widget').serial;
                var $shield = $('<button>', {}).css({
                    position : 'absolute',
                    top : 0,
                    left : 0,
                    width : '100%',
                    height : '100%',
                    zIndex : 999,
                    opacity : 0.1
                });

                $widget.append($shield);
                $shield.on('click', function(e){

                    //click on shield: 
                    //1. this.widget.changeState('sleep');
                    //2. clicked widget.changeState('active');

                    e.stopPropagation();

                    $container.one('widgetCreated', function(e, widgets){
                        var targetWidget = widgets[targetWidgetSerial];
                        if(targetWidget){
                            targetWidget.changeState('active');
                        }
                    });

                    containerWidget.changeState('sleep');

                });

            });

        }

        var editorFactory = {
            /**
             * Check if all data-html-editable has an editor
             *
             * @param {type} $container
             * @returns {undefined}
             */
            hasEditor : function($container){

                var hasEditor = false;

                _find($container, 'html-editable').each(function(){
                    hasEditor = !!$(this).data('editor');
                    return hasEditor;//continue if true, break if false
                });

                return hasEditor;
            },
            buildEditor : function($container, editorOptions){

                _find($container, 'html-editable-container').each(function(){

                    var editor,
                        $editableContainer = $(this),
                        $editable = $editableContainer.find('[data-html-editable]');

                    //need to make the element html editable to enable ck inline editing:
                    $editable.attr('contenteditable', true);


                    //build it
                    editor = _buildEditor($editable, $editableContainer, editorOptions);

                    //store it in editable elt data attr
                    $editable.data('editor', editor);
                });

            },
            destroyEditor : function($container){

                _find($container, 'html-editable-container').each(function(){

                    var $editableContainer = $(this),
                        $editable = $editableContainer.find('[data-html-editable]');

                    $editableContainer.find('[data-role="cke-launcher"]')
                        .off()
                        .removeClass('active')
                        .hide();

                    $editable.removeAttr('contenteditable');
                    if($editable.data('editor')){
                        $editable.data('editor').destroy();
                        $editable.removeData('editor');

                        if($editable.data('qti-element')){
                            _rebuildWidgets($editable.data('qti-element'), $editable);
                        }
                    }
                });

//                ckProtector.unprotect();
            }
        };

        return editorFactory;
    });
