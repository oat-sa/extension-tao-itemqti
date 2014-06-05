define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/containerInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/hottext',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext-create'
], function(stateFactory, Question, formElement, formTpl, hottextTpl){

    var HottextInteractionStateQuestion = stateFactory.extend(Question, function(){

    }, function(){

    });

    HottextInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            matchMin : interaction.attr('matchMin'),
            matchMax : interaction.attr('matchMax')
        }));

        formElement.initWidget($form);

        var callbacks = formElement.getMinMaxAttributeCallbacks($form, 'matchMin', 'matchMax', true);
        formElement.initDataBinding($form, interaction, callbacks);

    };

    HottextInteractionStateQuestion.prototype.getGapModel = function(){

        return {
            toolbarTpl : hottextTpl,
            qtiClass : 'hottext',
            afterCreate : function(interactionWidget, newHottextWidget, text){
            
                newHottextWidget.element.body(text);
                newHottextWidget.$container.find('.hottext-content').html(text);//add this manually the first time
                newHottextWidget.changeState('active');
            }
        };
    };

    return HottextInteractionStateQuestion;
});