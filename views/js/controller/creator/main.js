define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/editor/preview',
    'taoQtiItem/qtiCreator/editor/preparePrint',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/commonRenderer', //for the preview
    'taoQtiItem/qtiCreator/helper/qtiElements',
    // css editor related
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/colorSelector',
    'taoQtiItem/qtiCreator/editor/styleEditor/fontSizeChanger',
    'taoQtiItem/qtiCreator/editor/styleEditor/itemResizer',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleEditor',
    'taoQtiItem/qtiCreator/editor/styleEditor/styleSheetToggler',
    'taoQtiItem/qtiCreator/editor/editor',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry'
], function(
    $,
    _,
    preview,
    preparePrint,
    panel,
    loader,
    creatorRenderer,
    commonRenderer,
    qtiElements,
    fontSelector,
    colorSelector,
    fontSizeChanger,
    itemResizer,
    styleEditor,
    styleSheetToggler,
    editor,
    interactionsToolbar,
    ciRegistry
    ){

    var _initializeUiComponents = function(item, widget, config){

        styleEditor.init(widget.element, config);

        styleSheetToggler.init(config);

        // CSS widgets
        fontSelector();
        colorSelector();
        fontSizeChanger();
        itemResizer(widget.element);
        preview.init($('.preview-trigger'), item, widget);

        preparePrint();

        editor.initGui({
            $itemContainer : widget.$container,
        });

    };
    
    //@todo make it executable more than once?
    var _initializeInteractionsToolbar = function($toolbar, customInteractionHooks){

        var toolbarInteractions = qtiElements.getAvailableAuthoringElements();
        
        ciRegistry.register(customInteractionHooks);
        
        ciRegistry.loadAll(function(interactionModels){
            
            _.each(interactionModels, function(interactionModel){
                var data = interactionModel.getAuthoringData();
                if(data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()){
                    toolbarInteractions[data.qtiClass] = data;
                }else{
                    throw 'invalid authoring data for custom interaction';
                }
            });

            interactionsToolbar.create($toolbar, toolbarInteractions);
        });

    };

    var _initializeHooks = function(uiHooks, configProperties){

        require(_.values(uiHooks), function(){

            _.each(arguments, function(hook){
                hook.init(configProperties);
            });
        });
    };

    return {
        /**
         * 
         * @param {object} config (baseUrl, uri, lang)
         */
        start : function(config){

            var $tabs = $('#tabs'),
                $tabNav = $('ul.ui-tabs-nav > li', $tabs),
                currentTab = $tabs.tabs('option', 'selected'),
                configProperties = config.properties,
                // workaround to get ajax loader out of the way
                // item editor has its own loader with the correct background color
                $loader = $('#ajax-loading'),
                loaderLeft = $loader.css('left');

            //pass reference to useful dom element
            var $editorScope = $('#item-editor-scope');
            configProperties.dom = {
                getMenuLeft : function(){
                    return $editorScope.find('.item-editor-menu.lft')
                },
                getMenuRight : function(){
                    return $editorScope.find('.item-editor-menu.rgt');
                },
                getInteractionToolbar : function(){
                    return $editorScope.find('#item-editor-interaction-bar');
                },
                getItemPanel : function(){
                    return $editorScope.find('#item-editor-panel');
                },
                getModalContainer : function(){
                    return $editorScope.find('#modal-container');
                }
            };

            //initialize hooks:
            _initializeHooks(config.uiHooks, configProperties);

            //create interactions toolbar:
            _initializeInteractionsToolbar($('#item-editor-interaction-bar'), config.interactions);

            //hide loader:
            $loader.css('left', '-10000px');

            //load item from REST service
            loader.loadItem({uri : configProperties.uri}, function(item){

                var $itemContainer = $('#item-editor-scroll-inner');

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', configProperties.baseUrl);
                commonRenderer.setContext($itemContainer);

                //load creator renderer
                creatorRenderer.setOptions(configProperties);
                creatorRenderer.get().load(function(){

                    var widget;

                    item.setRenderer(this);

                    //render item (body only) into the "drop-area"
                    $itemContainer.append(item.render());

                    //"post-render it" to initialize the widget
                    widget = item.postRender(_.clone(configProperties));

                    _initializeUiComponents(item, widget, configProperties);
                    panel.initFormVisibilityListener();
                    panel.toggleInlineInteractionGroup();

                    //leaving the tab, we try to let the place as clean as possible.
                    $tabs.off('tabsselect.qti-creator').on('tabsselect.qti-creator', function(e, ui){

                        var index = $tabNav.index($(this).parents('li'));
                        if(index !== currentTab){
                            //remove global events
                            $(window).off('.qti-widget');
                            $(document).off('.qti-widget');
                            $(document).off('.qti-creator');
                            $tabs.off('tabsselect.qti-creator');

                            $loader.css('left', loaderLeft);
                        }
                    });

                }, item.getUsedClasses());

            });

        }
    };
});
