define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/img',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function(stateFactory, Active, formTpl, formElement){

    var ImgStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    ImgStateActive.prototype.initForm = function(){
        
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            responsive = true,
            align = 'default';
        
        $form.html(formTpl({
            src : interaction.attr('view'),
            alt : interaction.attr('use'),
            longdesc : interaction.attr('use'),
            height : interaction.attr('use'),
            width : interaction.attr('use'),
            responsive : responsive,
            align : align
        }));

        formElement.initWidget($form);

        //init data change callbacks
        formElement.initDataBinding($form, interaction, {
            view : formElement.getAttributeChangeCallback(),
            use : formElement.getAttributeChangeCallback()
        });

    };

    return ImgStateActive;
});