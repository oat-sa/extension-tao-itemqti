define([
    'lodash',
    'taoQtiItem/qtiCreator/helper/dummyElement',
    'ui/validator/validators'
], function(_, dummyElement, validators){

    var _qtiClassToDummies = {
        math : 'maths',
        img : 'image',
        object : 'media'
    };

    //only valid for a state
    var inlineHelper = {
        checkFileExists : function(widget, fileSrcAttrName, baseUrl){

            var element = widget.element;

            validators.validators.fileExists.validate(
                element.attr(fileSrcAttrName),
                function(fileExists){
                    if(!fileExists){
                        //clear value:
                        element.attr(fileSrcAttrName, '');
                        inlineHelper.togglePlaceholder(widget);
                    }
                },
                {
                    baseUrl : baseUrl || ''
                });

        },
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

            widget.$container.trigger('contentChange.qti-widget');
        },
        positionFloat : function(widget, position){

            var $container = widget.$container,
                elt = widget.element;

            switch(position){
                case 'right':
                    $container.removeClass('lft txt-lft');
                    elt.removeClass('lft txt-lft');
                    $container.addClass('rgt');
                    $container.addClass('txt-rgt');
                    elt.addClass('rgt');
                    elt.addClass('txt-rgt');
                    break;
                case 'left':
                    $container.removeClass('rgt txt-rgt');
                    elt.removeClass('rgt txt-rgt');
                    $container.addClass('lft');
                    $container.addClass('txt-lft');
                    elt.addClass('lft');
                    elt.addClass('txt-lft');
                    break;
            }
        }
    };

    return inlineHelper;
});

