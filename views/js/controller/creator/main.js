define([
    'jquery',
    'lodash',
    'module',
    'layout/loading-bar',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/commonRenderer', //for the preview
    'taoQtiItem/qtiCreator/helper/qtiElements',
    // css editor related
    'taoQtiItem/qtiCreator/editor/editor',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry'
], function(
    $,
    _,
    module,
    loadingBar,
    panel,
    loader,
    creatorRenderer,
    commonRenderer,
    qtiElements,
    editor,
    interactionsToolbar,
    ciRegistry
    ){

    loadingBar.start();

    var _initializeInteractionsToolbar = function($toolbar, customInteractionHooks){

        var toolbarInteractions = qtiElements.getAvailableAuthoringElements();

        ciRegistry.register(customInteractionHooks);

        ciRegistry.loadAll(function(interactionModels){

            _.each(interactionModels, function(interactionModel){
                var data = ciRegistry.getAuthoringData(interactionModel.getTypeIdentifier());
                if(data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()){
                    toolbarInteractions[data.qtiClass] = data;
                }else{
                    throw 'invalid authoring data for custom interaction';
                }
            });

            //create toolbar:
            interactionsToolbar.create($toolbar, toolbarInteractions);

            //init accordions:
            panel.initSidebarAccordion($toolbar);
            panel.closeSections($toolbar.find('section'));
            panel.openSections($toolbar.find('#sidebar-left-section-common-interactions'), false);

            //init special subgroup
            panel.toggleInlineInteractionGroup();
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

            //first all, start loading bar
            loadingBar.start();

            config = config || module.config();

            var $tabs = $('#tabs'),
                $tabNav = $('ul.ui-tabs-nav > li', $tabs),
                currentTab = $tabs.tabs('option', 'selected'),
                configProperties = config.properties;

            //pass reference to useful dom element
            var $editorScope = $('#item-editor-scope');
            configProperties.dom = {
                getMenuLeft : function(){
                    return $editorScope.find('.item-editor-menu.lft');
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

            //load item from REST service
            loader.loadItem({uri : configProperties.uri}, function(item){

                var $itemContainer = $('#item-editor-scroll-inner');

                //configure commonRenderer for the preview
                commonRenderer.setOption('baseUrl', configProperties.baseUrl);
                commonRenderer.setContext($itemContainer);

                //load creator renderer
                creatorRenderer.setOptions(configProperties);
                creatorRenderer.get().load(function(){

                    var widget,
                        $propertySidebar = $('#item-editor-item-widget-bar');

                    item.setRenderer(this);

                    //render item (body only) into the "drop-area"
                    $itemContainer.append(item.render());

                    //"post-render it" to initialize the widget
                    widget = item.postRender(_.clone(configProperties));

                    editor.initGui(widget, configProperties);
                    panel.initSidebarAccordion($propertySidebar);
                    panel.initFormVisibilityListener();

                    //hide loading bar when completed
                    loadingBar.stop();

                    //TODO destroy isn't called anymore

                    //leaving the tab, we try to let the place as clean as possible.
                    $tabs.off('tabsselect.qti-creator').on('tabsselect.qti-creator', function(e, ui){
                        var index = $tabNav.index($(this).parents('li'));
                        if(index !== currentTab){
                            //remove global events
                            $(window).off('.qti-widget');
                            $(document).off('.qti-widget').off('.qti-creator');
                            $tabs.off('tabsselect.qti-creator');
                        }
                    });

                }, item.getUsedClasses());

            });

        }
    };
});
