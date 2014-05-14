define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/img',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline',
    'lodash',
    'nouislider'
], function(stateFactory, Active, formTpl, formElement, inlineHelper, _){
    
    
    
    var ImgStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    var _containClass = function(allClassStr, className){
        var regex = new RegExp('(?:^|\\s)' + className + '(?:\\s|$)', '');
        return allClassStr && regex.test(allClassStr);
    };

    /**
     * Greately throttled callback function
     * 
     * @param {jQuery} $img
     * @param {string} propertyName
     * @returns {function}
     */
    var _getImgSizeChangeCallback = function($img, propertyName){

        var _setAttr = _.debounce(function(img, value, name){
            img.attr(name, value);
        }, 1000);

        return _.throttle(function(img, value, name){
            $img[propertyName](value);
            _setAttr(img, value, name);
        }, 100);

    };

    ImgStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $img = _widget.$original,
            $form = _widget.$form,
            img = _widget.element,
            responsive = true;

        $form.html(formTpl({
            src : img.attr('src'),
            alt : img.attr('alt'),
            longdesc : img.attr('longdesc'),
            height : img.attr('height') || '',
            width : img.attr('width') || '',
            responsive : responsive
        }));

        //init slider and set align value before ...
        _initAdvanced(_widget);
        _initSlider(_widget);
        _initAlign(_widget);
        
        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.initDataBinding($form, img, {
            src : function(img, value){
                img.attr('src', value);
                $img.attr('src', value);
                inlineHelper.togglePlaceholder(_widget);
                _initSlider(_widget);
                _initAdvanced(_widget);
            },
            alt : formElement.getAttributeChangeCallback(),
            longdesc : formElement.getAttributeChangeCallback(),
            align : function(img, value){
                inlineHelper.positionFloat(_widget, value);
            },
            height : _getImgSizeChangeCallback($img, 'height'),
            width : _getImgSizeChangeCallback($img, 'width')
        });
    };

    var _initAlign = function(widget){

        var align = 'default';

        //init float positioning:
        if(widget.element.hasClass('rgt')){
            align = 'right';
        }else if(widget.element.hasClass('lft')){
            align = 'left';
        }

        inlineHelper.positionFloat(widget, align);
        widget.$form.find('select[name=align]').val(align);
    };

    var _initSlider = function(widget){

        var $container = widget.$container,
            $form = widget.$form,
            $slider = $form.find('.img-resizer-slider'),
            img = widget.element,
            $img = $container.find('img'),
            $height = $form.find('[name=height]'),
            $width = $form.find('[name=width]'),
            original = {
            h : img.attr('height') || $img.height(),
            w : img.attr('width') || $img.width()
        };

        $slider.noUiSlider({
            range : {
                min : 10,
                max : 200
            },
            start : 100
        }, $slider.hasClass('noUi-target'));

        $slider.off('slide').on('slide', _.throttle(function(e, value){

            var ratio = (value / 100),
                w = parseInt(ratio * original.w),
                h = parseInt(ratio * original.h);

            $width.val(w).change();
            $height.val(h).change();
        }, 100));
    };
    
    var _initAdvanced = function(widget){
        
        var $form = widget.$form,
            src = widget.element.attr('src');
        
        if(src){
            $form.find('[data-role=advanced]').show();
        }else{
            $form.find('[data-role=advanced]').hide();
        }
    };

    return ImgStateActive;
});