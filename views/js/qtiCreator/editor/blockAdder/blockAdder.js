define([
    'jquery',
    'lodash',
    'tpl!taoQtiItem/qtiCreator/editor/blockAdder/tpl/addColumnRow',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/model/helper/container',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/editor/elementSelector/selector'
], function($, _, adderTpl, Element, creatorRenderer, containerHelper, contentHelper, elementSelector){

    var _ns = '.block-adder';
    var _wrap = '<div class="colrow"></div>';
    var _placeholder = '<div class="placeholder">';

    function create(options){

        var selector, widget;
        var item = options.item;
        var $editorPanel = options.$editorPanel;
        var interactions = options.interactions;
        
        function _getItemBody(){
            return $editorPanel.find('.qti-itemBody');
        }
        
        /**
         * Init insertion relative to a widget container
         * 
         * @param {JQuery} $widget
         */
        function _initInsertion($widget){
            
            var $wrap = $(_wrap);
            var $colRow = $widget.parent('.colrow');
            
            if(!$colRow.length){
                $widget.wrap(_wrap);
                $colRow = $widget.parent('.colrow');
            }
            $colRow.after($wrap);

            selector = elementSelector.init({
                attachTo : $wrap,
                container : $editorPanel,
                interactions : interactions
            });

            $editorPanel.off('.element-selector').on('selected.element-selector', function(e, qtiClass, $trigger){

                var $placeholder = $(_placeholder);

                //remove old widget if applicable:
                if(widget){
                    //from model
                    widget.element.remove();
                    //from dom
                    $wrap.find('.widget-box').remove();
                }

                $wrap.addClass('tmp').prepend($placeholder);
                insertElement(qtiClass, $placeholder);
                selector.reposition();

            }).on('done.element-selector', function(){
                _done($wrap);
            }).on('cancel.element-selector', function(){
                _cancel($wrap);
            });
            
            //when clicking outside of the selector popup, consider it done
            $('#item-editor-panel').on('click' + _ns + ', mousedown' + _ns, function(e){
                var popup = selector.getPopup()[0];
                if(popup !== e.target && !$.contains(popup, e.target)){
                    _done($wrap);
                }
            });

            //select a default element type
            selector.activateElement('choiceInteraction');
            selector.activatePanel('Common Interactions');
            
            //set into the inserting state
            _getItemBody().addClass('edit-inserting');
        }
        
        function _endInsertion(){
            
            //destroy selector
            selector.destroy();
            selector = null;
            $editorPanel.off('.element-selector');
            _getItemBody().removeClass('edit-inserting');
            
            //need to update item body
            item.body(contentHelper.getContent(_getItemBody()));
            
            //unbind events
            $('#item-editor-panel').off(_ns);
        }
        
        function _done($wrap){

            //remove tmp class
            $wrap.removeClass('tmp');

            //append button
            _appendButton(widget.$container);

            //activate the new widget:
            _.defer(function(){

                if(widget.element.is('interaction')){
                    widget.changeState('question');
                }else{
                    widget.changeState('active');
                }
            });
            
            _endInsertion();
        }

        function _cancel($wrap){

            //destroy interaction + colRow
            widget.element.remove();
            $wrap.remove();
            
            _endInsertion();
        }

        $editorPanel.find('.widget-block, .widget-blockInteraction').each(function(){
            _appendButton($(this));
        });

        //bind add event
        $editorPanel.on('mousedown', '.add-block-element .circle', function(e){

            e.preventDefault();
            e.stopPropagation();
            
            var $widget = $(this).parents('.widget-box');
            _initInsertion($widget);
            
        }).on('ready.qti-widget', function(e, _widget){

            var qtiElement = _widget.element;
            if(qtiElement.is('blockInteraction') || qtiElement.is('_container')){

                _appendButton(_widget.$container);

                //after update when we are in the selecting mode:
                if(selector){
                    selector.reposition();
                    if(_widget.$container.parent('.colrow.tmp').length){
                        //store the reference to the newly created widget
                        widget = _widget;
                    }
                }
            }

        });

    }

    function _appendButton($widget){

        //only append button to no-tmp widget and only add it once:
        if(!$widget.children('.add-block-element').length &&
            !$widget.parent('.colrow.tmp').length){

            var $adder = $(adderTpl());
            $widget.append($adder);
            $adder.on('click mouseenter mouseleave', function(e){
                e.stopPropagation();
            });
        }
    }

    function insertElement(qtiClass, $placeholder, callback){

        //a new qti element has been added: update the model + render
        $placeholder.removeAttr('id');//prevent it from being deleted

        if(qtiClass === 'rubricBlock'){
            //qti strange exception: a rubricBlock must be the first child of itemBody, nothing else...
            //so in this specific case, consider the whole row as the rubricBlock
            //by the way, in our grid system, rubricBlock can only have a width of col-12
            $placeholder = $placeholder.parent('.col-12').parent('.grid-row');
        }

        $placeholder.addClass('widget-box');//required for it to be considered as a widget during container serialization
        $placeholder.attr({
            'data-new' : true,
            'data-qti-class' : qtiClass
        });//add data attribute to get the dom ready to be replaced by rendering

        var $widget = $placeholder.parent().closest('.widget-box, .qti-item');
        var $editable = $placeholder.closest('[data-html-editable], .qti-itemBody');
        var widget = $widget.data('widget');
        var element = widget.element;
        var container = Element.isA(element, '_container') ? element : element.getBody();

        if(!element || !$editable.length){
            throw new Error('cannot create new element');
        }

        containerHelper.createElements(container, contentHelper.getContent($editable), function(newElts){

            creatorRenderer.get().load(function(){

                for(var serial in newElts){

                    var elt = newElts[serial],
                        $widget,
                        widget,
                        $colParent = $placeholder.parent();

                    elt.setRenderer(this);

                    if(Element.isA(elt, '_container')){
                        $colParent.empty();//clear the col content, and leave an empty text field
                        $colParent.html(elt.render());
                        widget = _this.initTextWidget(elt, $colParent);
                        $widget = widget.$container;
                    }else{
                        elt.render($placeholder);
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
                    $widget.trigger('resize.gridEdit');

                    return;
                    //active it right away:


                }
            }, this.getUsedClasses());
        });
    }

    return {
        create : create
    };
});