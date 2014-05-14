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

        },
        positionFloat : function(widget, position){
        
            var $container = widget.$container,
                elt = widget.element;

            //remove class
            $container.removeClass('rgt lft');

            elt.removeClass('rgt');
            elt.removeClass('lft');
            switch(position){
                case 'right':
                    $container.addClass('rgt');
                    elt.addClass('rgt');
                    break;
                case 'left':
                    $container.addClass('lft');
                    elt.addClass('lft');
                    break;
            }
        }
    };

});

