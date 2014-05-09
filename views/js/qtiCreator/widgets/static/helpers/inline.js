define(['lodash', 'taoQtiItem/qtiCreator/helper/dummyElement'], function(_, dummyElement){

    var _qtiClassToDummies = {
        math : 'maths',
        img : 'image',
        object : 'media'
    };
    
    //only valid for a state
    return {
        togglePlaceholder : function(widget, opts){

            var options = _.defaults(opts || {}, {
                container : widget.$original,
                type : widget.element.qtiClass
            });
            
            var $container = options.container;
            var $placeholder = $container.siblings('.dummy-element');
            
            if(widget.element.isEmpty()){
                
                $container.hide();
                
                var type = _qtiClassToDummies[options.type] || options.type;
                if(!$placeholder.length){
                    $placeholder = dummyElement.get(type);
                    $container.after($placeholder);
                }
                $placeholder.show();
                
            }else{
                
                $container.show();
                $placeholder.hide();
            }

        }
    };

});

