define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiItem/core/Container',
    'taoQtiItem/qtiCreator/helper/xmlRenderer',
    'taoQtiItem/qtiCreator/helper/simpleParser',
    'taoQtiItem/qtiCreator/helper/creatorRenderer',
    'taoQtiItem/qtiCreator/widgets/static/text/Widget'
], function(_, $, Loader, Container, xmlRenderer, simpleParser, creatorRenderer, TextWidget){

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
        var loader = new Loader();
        loader.loadRequiredClasses(data, function(){

            var container = new Container();
            this.loadContainer(container, data);

            //apply common renderer :
            creatorRenderer.load(['img', 'object', 'math', '_container'], function(){

                container.setRenderer(this);
                $container.html(container.render());
                container.postRender();

                TextWidget.build(container, $container, this.getOption('textOptionForm'), {});
            });

            $(document).on('containerBodyChange.qti-widget', _.throttle(function(e, data){
                var html = data.container.render(xmlRenderer.get());
                console.log('chage', html);
            }, 600));

        });

    }
    
    function destroy(){
        
    }
    
    return {
        create : create,
        destroy : destroy
    };
});