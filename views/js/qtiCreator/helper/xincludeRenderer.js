define([
    'lodash',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'taoQtiItem/qtiItem/helper/xincludeLoader',
    'taoQtiItem/qtiItem/helper/simpleParser',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCreator/model/Container',
    'taoQtiItem/qtiCreator/model/qtiClasses'
], function(_, commonRenderer, xincludeLoader, simpleParser, Loader, Container, qtiClasses){

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
    
    function load(xinclude, baseUrl, callback){
        
        xincludeLoader.load(xinclude, baseUrl, function(xi, data, loadedClasses){
                if(data){
                    //loading success :
                    commonRenderer.get().load(function(){

                        //set commonRenderer to the composing elements only (because xinclude is "read-only")
                        _.each(xinclude.getComposingElements(), function(elt){
                            elt.setRenderer(commonRenderer.get());
                        });
                        
                        if(_.isFunction(callback)){
                            callback();
                        }

                    }, loadedClasses);
                }else{
                    //loading failure :
                    xinclude.removeAttr('href');
                }
            });
            
    }
    
    return {
        /**
         * Render (or re-render) the xinclude widget based on the current href and givenBaseUrl
         * 
         * @param {Object} xincludeWidget
         * @param {String} baseUrl
         * @returns {undefined}
         */
        render : function render(xincludeWidget, baseUrl, newHref){

            var xinclude = xincludeWidget.element;
            if(newHref){
                xinclude.attr('href', newHref);
            }

            xincludeLoader.load(xinclude, baseUrl, function(xi, data, loadedClasses){
                if(data){
                    //loading success :
                    commonRenderer.get().load(function(){

                        //set commonRenderer to the composing elements only (because xinclude is "read-only")
                        _.each(xinclude.getComposingElements(), function(elt){
                            elt.setRenderer(commonRenderer.get());
                        });

                        //reload the wiget to rfresh the rendering with the new href
                        xincludeWidget.refresh();

                    }, loadedClasses);
                }else{
                    //loading failure :
                    xinclude.removeAttr('href');
                }
            });
        },
        renderInPci : function($container, baseUrl){

            //get xinclude
            var data = parser($container);
            var loader = new Loader().setClassesLocation(qtiClasses);
            loader.loadRequiredClasses(data, function(){
                //create a new container object
                var container = new Container();
                this.loadContainer(container, data);
                console.log(container);
                _.each(container.getComposingElements(), function(element){
                    if(element.qtiClass === 'include'){
                        load(element, baseUrl, function(){
                            element.render();
                        });
                    }
                });
            });
        }
    };
});