define([
    'jquery',
    'helpers',
    'taoQtiItem/qtiCreator/widgets/Widget',
    'taoQtiItem/qtiCreator/widgets/item/states/states',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/editor/creatorRenderer',
    'taoQtiItem/qtiCreator/helper/gridEditor/draggable',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/helper/devTools',
    'taoQtiItem/qtiCreator/editor/jquery.gridEditor'
], function($, helpers, Widget, states, Element, creatorRenderer, draggable, xmlRenderer, devTools) {

    var ItemWidget = Widget.clone();

    ItemWidget.initCreator = function(config) {
        
        Widget.initCreator.call(this);
        
        this.registerStates(states);
        
        if(!config || !config.uri){
            throw new Error('missing required config parameter uri in item widget initialization');
        }
        
        this.initUiComponents({
            uri: config.uri
        });

        this.initEditor();

        this.debug();
    };

    ItemWidget.buildContainer = function() {

        this.$container = this.$original;
    };

    ItemWidget.initUiComponents = function(config) {

        var item = this.element;

        //init title inline edition

        //init save button:
        $('#save-trigger').on('click', function() {
            $.ajax({
                url: helpers._url('saveItem', 'QtiCreator', 'taoQtiItem'),
                type: 'POST',
                dataType: 'json',
                data: {
                    uri: config.uri,
                    xml: xmlRenderer.render(item)
                }
            }).done(function(data) {

                if (data.success) {
                    alert('saved');
                } else {
                    alert('failed');
                }

            });
        });
    };

    ItemWidget.initEditor = function() {

        var item = this.element,
                $itemBody = this.$container.find('.qti-itemBody');

        $itemBody.gridEditor();
        $itemBody.gridEditor('addInsertables', $('.tool-list > [data-qti-class]'), {
//            helper: function() {
//                return $(this).children('img').clone().removeClass('viewport-hidden').css('z-index', 999);
//            }
        });
        $itemBody.gridEditor('resizable');

        $itemBody.on('dropped.gridEdit', function(e, qtiClass, $targetContainer, $placeholder) {

//            console.log(e, $targetContainer, $placeholder);
//            debugger;
            //a new qti element has been added: update the model + render
            $placeholder.removeAttr('id');//prevent it from being deleted

            if (qtiClass === 'rubricBlock') {
                //qti strange exception: a rubricBlock must be the first child of itemBody, nothing else...
                //so in this specific case, consider the whole row as the rubricBlock
                //by the way, in our grid system, rubricBlock can only have a width of col-12
                $placeholder = $placeholder.parent('.col-12').parent('.grid-row');
            }

            $placeholder.addClass('widget-box');//necessary?
            $placeholder.attr({
                'data-new': true,
                'data-qti-class': qtiClass
            });//add data attribute to get the dom ready to be replaced by rendering

            item.createElements($itemBody.gridEditor('getContent'), function(newElts) {

                creatorRenderer.get().load(function() {

                    for (var serial in newElts) {

                        var elt = newElts[serial],
                                $widget,
                                widget;

                        elt.setRenderer(this);
                        elt.render($placeholder);
                        widget = elt.postRender();

                        if (Element.isA(elt, 'blockInteraction')) {
                            $widget = widget.$container;
                        } else {
                            //leave the container in place
                            $widget = widget.$original;
                        }

                        //@todo : draggable not working with cke !!
//                        draggable.createMovable($widget, $targetContainer);
                    }
                }, this.getUsedClasses());
            });

        });

    };

    ItemWidget.debug = function() {

        devTools.listenStateChange();

        var $code = $('<code>', {'class': 'language-markup'}),
        $pre = $('<pre>', {'class': 'line-numbers'}).append($code);

        $('#item-editor-wrapper').append($pre);
        devTools.liveXmlPreview(this.element, $code);
    };

    return ItemWidget;
});