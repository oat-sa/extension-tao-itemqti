define([
    'lodash',
    'jquery',
    'helpers',
    'taoQtiItem/qtiCreator/widgets/Widget',
    'taoQtiItem/qtiCreator/widgets/item/states/states',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/model/helper/container',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/editor/gridEditor/draggable',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/helper/devTools',
    'taoQtiItem/qtiCreator/widgets/static/text/Widget',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/jquery.gridEditor'
], function(_, $, helpers, Widget, states, Element, creatorRenderer, containerHelper, contentHelper, draggable, xmlRenderer, devTools, TextWidget, formElement){

    var ItemWidget = Widget.clone();

    ItemWidget.initCreator = function(config){

        Widget.initCreator.call(this);

        this.registerStates(states);

        if(!config || !config.uri){
            throw new Error('missing required config parameter uri in item widget initialization');
        }
        this.itemUri = config.uri;
        
        this.initUiComponents();

//        this.initTextWidgets();

        this.initGridEditor();

        this.debug();
    };

    ItemWidget.buildContainer = function(){

        this.$container = this.$original;
    };

    ItemWidget.save = function(){
        $.ajax({
            url : helpers._url('saveItem', 'QtiCreator', 'taoQtiItem'),
            type : 'POST',
            dataType : 'json',
            data : {
                uri : this.itemUri,
                xml : xmlRenderer.render(this.element)
            }
        }).done(function(data){

            if(data.success){
                alert('saved');
            }else{
                alert('failed');
            }
        });
    };

    ItemWidget.initUiComponents = function(){

        var _widget = this;

        //init title inline edition
        formElement.initTitle(this.$container.find('.qti-title'), this.element);
        
        //init save button:
        $('#save-trigger').on('click', function(){
            _widget.save();
        });
    };

    ItemWidget.initGridEditor = function(){

        var item = this.element,
            $itemBody = this.$container.find('.qti-itemBody');

        $itemBody.gridEditor();
        $itemBody.gridEditor('addInsertables', $('.tool-list > [data-qti-class]'), {
//            helper: function() {
//                return $(this).children('img').clone().removeClass('viewport-hidden').css('z-index', 999);
//            }
        });
        $itemBody.gridEditor('resizable');

        $itemBody.on('dropped.gridEdit', function(e, qtiClass, $targetContainer, $placeholder){

            //a new qti element has been added: update the model + render
            $placeholder.removeAttr('id');//prevent it from being deleted

            if(qtiClass === 'rubricBlock'){
                //qti strange exception: a rubricBlock must be the first child of itemBody, nothing else...
                //so in this specific case, consider the whole row as the rubricBlock
                //by the way, in our grid system, rubricBlock can only have a width of col-12
                $placeholder = $placeholder.parent('.col-12').parent('.grid-row');
            }

            $placeholder.addClass('widget-box');//necessary?
            $placeholder.attr({
                'data-new' : true,
                'data-qti-class' : qtiClass
            });//add data attribute to get the dom ready to be replaced by rendering

            item.createElements($itemBody.gridEditor('getContent'), function(newElts){

                creatorRenderer.get().load(function(){

                    for(var serial in newElts){

                        var elt = newElts[serial],
                            $widget,
                            widget,
                            $colParent = $placeholder.parent();

                        elt.setRenderer(this);
                        elt.render($placeholder);

                        if(Element.isA(elt, '_container')){
                            widget = _initTextWidget(elt, $colParent);
                            $widget = widget.$container;
                        }else{
                            widget = elt.postRender();
                            if(Element.isA(elt, 'blockInteraction')){
                                $widget = widget.$container;
                            }else{
                                //leave the container in place
                                $widget = widget.$original;
                            }
                        }
                        
                        //inform height modification
                        $widget.trigger('contentChange.gridEdit');
                        
                        //@todo : draggable not working with cke !!
//                        draggable.createMovable($widget, $targetContainer);
                    }
                }, this.getUsedClasses());
            });

        });

    };

    //initTextWidgets == initSubContainerEditor

    ItemWidget.initTextWidgets = function(){

        var item = this.element,
            $originalContainer = this.$container,
            i = 1,
            subContainers = [];


        //temporarily tag col that need to be transformed into 
        $originalContainer.find('.qti-itemBody > .grid-row').each(function(){

            var $row = $(this);
            if(!$row.hasClass('widget-box')){//not a rubricBlock
                $row.children().each(function(){
                    var $col = $(this);
                    var $widget = $col.children();
                    if($widget.length > 1 || !$widget.data('qti-class')){//not an immediate qti element
                        $col.attr('data-text-block-id', 'text-block-' + i);
                        i++;
                    }
                });
            }
        });

        //clone the container to create the new container model:
        var $clonedContainer = $originalContainer.clone();
        $clonedContainer.find('.qti-itemBody > .grid-row > [data-text-block-id]').each(function(){
            
            var $col = $(this),
                textBlockId = $col.data('text-block-id'),
                $subContainer = $col.clone(),
                subContainerElements = contentHelper.serializeElements($subContainer),
                subContainerBody = $subContainer.html();//get serialized body
                
            $col.html('{{_container:new}}');

            subContainers.push({
                body : subContainerBody,
                elements : subContainerElements,
                $original : $originalContainer.find('[data-text-block-id="' + textBlockId + '"]').removeAttr('data-text-block-id')
            });
        });

        //create new container model with the created sub containers
        contentHelper.serializeElements($clonedContainer);
        var serializedItemBody = $clonedContainer.find('.qti-itemBody').html(),
            itemBody = item.getBody();

        containerHelper.createElements(itemBody, serializedItemBody, function(newElts){

            if(_.size(newElts) !== subContainers.length){
                throw 'numbers of subcontainers mismatch';
            }else{
                _.each(newElts, function(container){

                    var containerData = subContainers.shift();//get data in order
                    var containerElements = _detachElements(itemBody, containerData.elements);

                    container.setElements(containerElements, containerData.body);

                    _initTextWidget(container, containerData.$original);
                });
            }
        });
    };

    var _detachElements = function(container, elements){

        var containerElements = {};
        _.each(elements, function(elementSerial){
            containerElements[elementSerial] = container.elements[elementSerial];
            delete container.elements[elementSerial];
        });
        return containerElements;
    };

    var _initTextWidget = function(container, $col){

        return TextWidget.build(container, $col, null, {});
    };

    ItemWidget.debug = function(){
        
        devTools.listenStateChange();

        var $code = $('<code>', {'class' : 'language-markup'}),
        $pre = $('<pre>', {'class' : 'line-numbers'}).append($code);

        $('#item-editor-wrapper').append($pre);
        devTools.liveXmlPreview(this.element, $code);
    };
    
    return ItemWidget;
});