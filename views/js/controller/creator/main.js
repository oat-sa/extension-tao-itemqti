define([
    'jquery',
    'lodash',
    'module',
    'async',
    'layout/loading-bar',
    'layout/section',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/helper/panel',
    'taoQtiItem/qtiCreator/helper/itemLoader',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/commonRenderer', //for the preview
    'taoQtiItem/qtiCreator/helper/qtiElements',
    // css editor related
    'taoQtiItem/qtiCreator/editor/editor',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'taoQtiItem/qtiCreator/editor/infoControlRegistry'
], function(
    $,
    _,
    module,
    async,
    loadingBar,
    section,
    event,
    panel,
    loader,
    creatorRenderer,
    commonRenderer,
    qtiElements,
    editor,
    interactionsToolbar,
    ciRegistry,
    icRegistry
    ){

    loadingBar.start();

    var _initializeInteractionsToolbar = function($toolbar, interactionModels){

        var toolbarInteractions = qtiElements.getAvailableAuthoringElements();

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
            //init config
            config = config || module.config();
            //reinitialize the renderer:
            creatorRenderer.get(true, config);


            var configProperties = config.properties;

            //pass reference to useful dom element
            var $doc = $(document),
                $editorScope = $('#item-editor-scope'),
                $itemContainer = $('#item-editor-scroll-inner'),
                $propertySidebar = $('#item-editor-item-widget-bar');

            configProperties.dom = {
                getEditorScope : function(){
                    return $editorScope;
                },
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
                    return $itemContainer;
                },
                getItemPropertyPanel : function(){
                    return $editorScope.find('#sidebar-right-item-properties');
                },
                getModalContainer : function(){
                    return $editorScope.find('#modal-container');
                }
            };

            //back button
            $('#authoringBack').on('click', function(e){
                e.preventDefault();

                //Capitalized History means polyfilled by History.js
                if(window.History){
                    window.History.back();
                }
            });

            //initialize hooks
            _initializeHooks(config.uiHooks, configProperties);

            async.parallel([
                //register custom interacitons
                function(callback){
                    ciRegistry.register(config.interactions);
                    ciRegistry.loadAll(function(hooks){
                        callback(null, hooks);
                    });
                },
                //register info controls
                function(callback){
                    icRegistry.register(config.infoControls);
                    icRegistry.loadAll(function(hooks){
                        callback(null, hooks);
                    });
                },
                //load item
                function(callback){
                    loader.loadItem({uri : configProperties.uri}, function(item){

                        //configure commonRenderer for the preview
                        commonRenderer.setOption('baseUrl', configProperties.baseUrl);
                        commonRenderer.setContext(configProperties.dom.getItemPanel());

                        //set reference to item object
                        $editorScope.data('item', item);

                        //fires event itemloaded
                        $doc.trigger('itemloaded.qticreator', [item]);

                        //set useful data :
                        item.data('uri', configProperties.uri);

                        callback(null, item);

                    });
                }
            ], function(err, res){

                //get results from parallelized ajax calls:
                var interactionHooks = res[0],
                    infoControlHooks = res[1],
                    item = res[2];

                //init interaction sidebar
                _initializeInteractionsToolbar(configProperties.dom.getInteractionToolbar(), interactionHooks);

                //load creator renderer
                creatorRenderer
                    .get()
                    .setOptions(configProperties)
                    .load(function(){

                        //set renderer
                        item.setRenderer(this);

                        //render item (body only) into the "drop-area"
                        configProperties.dom.getItemPanel().append(item.render());

                        //"post-render it" to initialize the widget
                        var widget = item.postRender(_.clone(configProperties));

                        editor.initGui(widget, configProperties);
                        panel.initSidebarAccordion($propertySidebar);
                        panel.initFormVisibilityListener();

                        //hide loading bar when completed
                        loadingBar.stop();

                        //destroy by leaving the section
                        section.on('hide', function(hiddenSection){
                            if(hiddenSection.id === 'authoring'){

                                //remove global events
                                $(window).off('.qti-widget');
                                $doc.off('.qti-widget').off('.qti-creator');
                            }
                        });

                        //set reference to item widget object
                        $editorScope.data('widget', item);

                        //fires event itemloaded
                        $doc.trigger('widgetloaded.qticreator', [widget]);

                        //init event listeners:
                        event.initElementToWidgetListeners();

                    }, item.getUsedClasses());

            });

        }
    };
});
