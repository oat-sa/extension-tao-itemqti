define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/img',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'nouislider'
], function(stateFactory, Active, formTpl, formElement){

    var ImgStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    ImgStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            $container = _widget.$container,
            img = _widget.element,
            responsive = true,
            align = 'default';
        
        //init float positioning:
        $form.html(formTpl({
            src : img.attr('view'),
            alt : img.attr('alt'),
            longdesc : img.attr('longdesc'),
            height : img.attr('height'),
            width : img.attr('width'),
            responsive : responsive,
            align : align
        }));

        formElement.initWidget($form, img);
        _initSlider($form, img);
        
        
        
        
        
        //init data change callbacks
        formElement.initDataBinding($form, img, {
            src : formElement.getAttributeChangeCallback(),
            alt : formElement.getAttributeChangeCallback(),
            align:function(img, value){
                $container.removeClass('rgt lft');
                switch(value){
                    case 'right':
                        $container.addClass('rgt');
                        break;
                    case 'left':
                        $container.addClass('lft');
                        break;
                }
            }
        });
    };

    var _initSlider = function($form, element){
        
        var $img = element.getContainer().find('img'),
            originalWidth = $img.width(),
            originalHeight = $img.height();
        
        var $slider = $form.find('.img-resizer-slider');
        $slider.noUiSlider({
            range : {
                min : 10,
                max : 200
            },
            start : 100
        });

        $slider.on('slide', function(e, value){
            
            var newRatio = (value / 100),
                newWidth = parseInt(newRatio * originalWidth),
                newHeight = parseInt(newRatio * originalHeight);
                
              $img.width(newWidth);
              $img.height(newHeight);
              
              console.log(newRatio, newWidth, newHeight);
        });
    };

    return ImgStateActive;
});