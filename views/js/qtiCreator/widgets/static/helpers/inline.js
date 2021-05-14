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

            const $container = widget.$container;

            switch(position){
                case 'right':
                    $container.removeClass('lft txt-lft wrap-inline wrap-left');
                    $container.addClass('rgt txt-rgt wrap-right');
                    break;
                case 'left':
                    $container.removeClass('rgt txt-rgt wrap-inline wrap-right');
                    $container.addClass('lft txt-lft wrap-left');
                    break;
                case 'default':
                    $container.removeClass('rgt txt-rgt lft txt-lft wrap-right wrap-left');
                    $container.addClass('wrap-inline');
            }
        }
    };

    return inlineHelper;
});

