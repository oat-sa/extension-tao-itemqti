define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/rubricBlock',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function(stateFactory, Active, formTpl, formElement){

    var RubricBlockStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    RubricBlockStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            view : interaction.attr('view'),
            use : interaction.attr('use')
        }));

        formElement.initWidget($form);

        //init data change callbacks
        formElement.initDataBinding($form, interaction, {
            view : formElement.getAttributeChangeCallback(),
            use : formElement.getAttributeChangeCallback()
        });

    };

    return RubricBlockStateActive;
});