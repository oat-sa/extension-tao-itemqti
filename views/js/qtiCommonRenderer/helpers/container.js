
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiItem/core/Element'
], function(_, $, Element){

    
    //containers are cached, so do not forget to remove them.
    var _containers = {};
    var _$containerContext = $();

    /**
     * Build the selector for your element (from the element serial)
     * @private
     * @param {QtiElement} element
     * @returns {String} the selector
     */
    var _getSelector = function(element){

        var serial = element.getSerial(),
            selector = '[data-serial=' + serial + ']';

        if(Element.isA(element, 'choice')){
            selector = '.qti-choice' + selector;
        }else if(Element.isA(element, 'interaction')){
            selector = '.qti-interaction' + selector;
        }

        return selector;
    };

    /**
     * Helps you to retrieve the DOM element (as a jquery element) 
     * @exports taoQtiItem/qtiCommonRenderer/helpers/containerHelper 
     */
    var containerHelper =  {
        
        /**
         * Set a global scope to look for element container
         * @param {jQueryElement} [$scope] - if you want to retrieve the element in a particular scope or context
         */
        setContext : function($scope){
            _$containerContext = $scope;
        },

        /**
         * Get the container of the given element
         * @param {QtiElement} element - the QTI Element to find the container for
         * @param {jQueryElement} [$scope] - if you want to retrieve the element in a particular scope or context
         * @returns {jQueryElement} the container
         */
        getContainer : function(element, $scope){
            
            var serial = element.getSerial();
            if($scope instanceof $ && $scope.length){
                
                //find in the given context
                return $scope.find(_getSelector(element));
                
            }else if(_$containerContext instanceof $ && _$containerContext.length){
                
                //find in the globally set context
                return _$containerContext.find(_getSelector(element));
                
            }else if(!_containers[serial] || _containers[serial].length){
                
                //find in the global context
                _containers[serial] = $(_getSelector(element));
            }

            return _containers[serial];
        },

        /**
         * getContainer use a cache to store elements. This methods helps you to purge it.
         * @param {Element} element - find the container of this element 
         */ 
        resetContainer : function(element){
            if(element instanceof Element && _containers[element.getSerial()]){
                _containers = _.omit(_containers, element.getSerial());
            }
        }
    };


    return containerHelper;
});
