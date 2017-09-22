define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/static/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/static/printedVariable',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/static/helpers/inline'
], function($, _, __, stateFactory, Active, formTpl, formElement, inlineHelper){
    'use strict';

    var PrintedVariableStateActive = stateFactory.extend(Active, function(){

        this.initForm();

    }, function(){

        this.widget.$form.empty();
    });

    PrintedVariableStateActive.prototype.initForm = function(){

        var _widget = this.widget,
            $printedVariable = _widget.$original,
            $form = _widget.$form,
            img = _widget.element,
            variable = $printedVariable.html();

        $form.html(formTpl({
            variable : variable || ''
        }));

        //... init standard ui widget
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, img, {
            variable : _.throttle(function(name, value) {
                $printedVariable.html(value);

                inlineHelper.togglePlaceholder(_widget);
            }, 300)
        });

    };

    return PrintedVariableStateActive;
});
