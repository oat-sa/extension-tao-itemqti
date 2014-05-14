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
                img = widget.element;

            //remove class
            $container.removeClass('rgt lft');

            img.removeClass('rgt');
            img.removeClass('lft');
            switch(position){
                case 'right':
                    $container.addClass('rgt');
                    img.addClass('rgt');
                    break;
                case 'left':
                    $container.addClass('lft');
                    img.addClass('lft');
                    break;
            }
        }
    };

});

