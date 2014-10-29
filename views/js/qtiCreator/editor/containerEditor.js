define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Container',
    'taoQtiItem/qtiCreator/model/Item',
    'taoQtiItem/qtiCreator/model/qtiClasses',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/helper/simpleParser',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/editor/ckEditor/htmlEditor',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/htmlEditorTrigger'
], function(_, $, Loader, Container, Item, qtiClasses, xmlRenderer, simpleParser, creatorRenderer, htmlEditor, toolbarTpl){

    var _defaults = {
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

        var data = parser($container);
        var loader = new Loader().setClassesLocation(qtiClasses);
        loader.loadRequiredClasses(data, function(){
            
            //create a new container object
            var container = new Container();
            
            //need to attach a container to the item to enable innserElement.remove()
            var item = new Item().setElement(container);
            container.setRelatedItem(item);
            
            this.loadContainer(container, data);
            
            //apply common renderer :
            creatorRenderer.load(['img', 'object', 'math', '_container'], function(){

                container.setRenderer(this);
                $container.html(container.render());
                container.postRender();
                
                buildContainer($container);
                createToolbar($container);
                buildEditor($container, container);
            });

            $(document).on('containerBodyChange.qti-widget', _.throttle(function(e, data){
                var html = data.container.render(xmlRenderer.get());
                $container.trigger('containerchange.container-editor.qti-widget', [html]);
            }, 600));

        });

    }
    
    function buildContainer($container){
        
        var $wrap = $('<div>', {'class' : ''})
            .append($('<div>', {'data-html-editable' : true}));

        $container.wrapInner($wrap);

        $container.children('.widget-box');
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
    
    function buildEditor($editableContainer, container){
        
        var widget = {
            $container : $editableContainer,
            element : container,
            changeState : function(state){
                if(state === 'sleep'){
//                    htmlEditor.destroyEditor($editableContainer);
                }
            }
        };
        
        $editableContainer.attr('data-html-editable-container', true);

        if(!htmlEditor.hasEditor($editableContainer)){

            htmlEditor.buildEditor($editableContainer, {
                shieldInnerContent : false,
                passthroughInnerContent : true,
                change : function(){
                    console.log('change', arguments);
                },
                blur : function(){
                    
                },
                data : {
                    widget : widget,
                    container : container
                }
            });
        }
    }
    
    function destroyEditor(){
        
    }
    
    function destroy(){
        
    }
    
    return {
        create : create,
        destroy : destroy
    };
});