define([
    'lodash',
    'taoQtiItem/qtiCreator/helper/commonRenderer',
    'taoQtiItem/qtiItem/helper/xincludeLoader'
], function(_, commonRenderer, xincludeLoader){

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
                commonRenderer.get().load(function(){

                    //set commonRenderer to the composing elements only (because xinclude is "read-only")
                    var composingElements = xinclude.getComposingElements();
                    _.each(composingElements, function(elt){
                        elt.setRenderer(commonRenderer.get());
                    });

                    xincludeWidget.refresh();

                }, loadedClasses);
            });
        }
    };
});