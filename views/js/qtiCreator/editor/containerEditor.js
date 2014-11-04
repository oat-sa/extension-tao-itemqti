define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Container',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/helper/simpleParser',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger'
], function(_, $, Loader, Container, Item, event, qtiClasses, xmlRenderer, simpleParser, creatorRenderer, content, htmlEditor, toolbarTpl){

    var _ns = 'containereditor';

    var _defaults = {
        change : _.noop,
        markup : '',
        markupSelector : ''
    };

    function parser($container){

        //detect math ns :
        var mathNs = 'm';//for 'http://www.w3.org/1998/Math/MathML'

        //parse qti xml content to build a data object
        var data = simpleParser.parse($container.clone(), {
            ns : {
                math : mathNs
            }
        });

        if(data.body){
            return data.body;
        }else{
            throw 'invalid content for qti container';
        }
    }

    function create($container, options){

        options = _.defaults(options || {}, _defaults);
        
        //assign proper markup
        if(options.markup){
            var html = options.markup;
            if(options.markupSelector){
                var htmls = extractHtmlFromMarkup(html, options.markupSelector);
                html = htmls[0] || '';
            }
            $container.html(html);
        }
        
        var data = parser($container);
        var loader = new Loader().setClassesLocation(qtiClasses);
        loader.loadRequiredClasses(data, function(){

            //create a new container object
            var container = new Container();
            
            $container.data('container', container);

            //need to attach a container to the item to enable innserElement.remove()
            //@todo fix this
            var item = new Item().setElement(container);
            container.setRelatedItem(item);

            //associate it to the interaction?
            if(options.related){
                options.related.data('container-editor', container);
            }

            this.loadContainer(container, data);

            //apply common renderer :
            creatorRenderer.load(['img', 'object', 'math', '_container'], function(){
                
                container.setRenderer(this);
                $container.html(container.render());
                container.postRender();

                buildContainer($container);
                createToolbar($container);
                buildEditor($container, container);

                $container.off('.' + _ns).on(event.getList(_ns + event.getNs() + event.getNsModel()).join(' '), _.throttle(function(e, data){
                    var html = container.render(xmlRenderer.get());
                    $container.trigger('containerchange.' + _ns, [html]);
                    if(_.isFunction(options.change)){
                        options.change(html);
                    }
                }, 600));
                
                $container.trigger('editorready.containereditor');
            });

        });

    }

    function buildContainer($container){

        $container.wrapInner($('<div>', {'class' : 'container-editor', 'data-html-editable' : true}));
    }

    function createToolbar($container){

        var $tlb = $(toolbarTpl({
            serial : 'serial123456',
            state : 'active'
        }));

        $container.append($tlb);
        $tlb.show();

        return this;
    }

    function cleanup($container){

        //remove the text toolbar
        $container.find('.mini-tlb').remove();

        var container = $container.data('container');
        if(container){
            $(document).off('.' + container.serial);
            $container.html(container.render());
        }

        $container.removeData('container');

    }
    
    /**
     * create a fase widget that is required in html editor
     * 
     * @param {JQuery} $editableContainer
     * @param {Object} container
     * @returns {Object} The fake widget object
     */
    function createFakeWidget($editableContainer, container){
        
        var widget = {
            $container : $editableContainer,
            element : container,
            changeState : _.noop
        };
        //associate the widget to the container
        container.data('widget', widget);
        
        return widget;
    }

    function buildEditor($editableContainer, container){

        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                shieldInnerContent : false,
                passthroughInnerContent : false,
                change : content.getChangeCallback(container),
                data : {
                    widget : createFakeWidget($editableContainer, container),
                    container : container
                }
            });
        }
    }

    function destroyEditor($editableContainer){
        htmlEditor.destroyEditor($editableContainer);
        $editableContainer.removeAttr('data-html-editable-container');
    }

    function destroy($container){
        destroyEditor($container);
        cleanup($container)
    }
    
    function extractHtmlFromMarkup(markupStr, selector){
        var $found = $('<div>').html(markupStr).find(selector);
        var ret = [];
        $found.each(function(){
            ret.push($(this).html());
        });
        return ret;
    }
    
    return {
        create : create,
        destroy : destroy
    };
});