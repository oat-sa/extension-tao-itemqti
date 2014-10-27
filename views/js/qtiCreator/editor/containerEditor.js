define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/core/Container',
    'taoQtiItem/qtiXmlRenderer/renderers/Renderer',
    'taoQtiItem/qtiCreator/helper/simpleParser',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'i18n'
], function(_, $, Loader, Container, XmlRenderer, simpleParser, creatorRenderer, __){

    var _defaults = {
        placeholder : __('type some text ...')
    };

    function parser($container){
        
        //detect math ns :
        var mathNs = 'm';//for 'http://www.w3.org/1998/Math/MathML'

        //parse qti xml content to build a data object
        var data =  simpleParser.parse($container.clone(), {
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
        
        var loader = new Loader();
        loader.loadRequiredClasses(data, function(){

            var container = new Container();
            this.loadContainer(container, data);
            
            //apply common renderer :
            creatorRenderer.load(['img', 'object', 'math', '_container'], function(){
                console.log(container, 'data-html-editable');
                container.render(creatorRenderer.get(), $container);
                container.postRender({}, '', creatorRenderer.get());
            });
            
            return;
           
            var xmlRenderer = new XmlRenderer({shuffleChoices : false});
            xmlRenderer.load(function(){
                var xml = container.render(this);
            });
        });

    }

    return {
        create : create
    };
});