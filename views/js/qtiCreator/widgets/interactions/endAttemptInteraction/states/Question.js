define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/endAttempt'
], function(_, $, stateFactory, Question, formElement, formTpl){

    var EndAttemptInteractionStateQuestion = stateFactory.extend(Question, function(){
        
        var $mainOption = this.widget.$container.find('.main-option'),
            $original = this.widget.$original;
        
        //listener to children choice widget change and update the original interaction placehoder
        $(document).on('choiceTextChange.qti-widget.question', function(){
            $original.width($mainOption.width());
        });

    }, function(){
        
        $(document).off('.qti-widget.question');
    });

    EndAttemptInteractionStateQuestion.prototype.addNewChoiceButton = function(){};

    EndAttemptInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            $title = _widget.$container.find('.endAttemptInteraction-placeholder'),
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();
        
        var restrictedIdentifiers = _getRestrictedIdentifier(this.widget);
        
        $form.html(formTpl({
            hasRestrictedIdentifier : !!_.size(restrictedIdentifiers),
            restrictedIdentifiers : restrictedIdentifiers,
            responseSerial : response.serial,
            responseIdentifier : interaction.attr('responseIdentifier'),
            title : interaction.attr('title')
        }));

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, interaction, {
            title : function(interaction, title){
                interaction.attr('title', title);
                $title.html(title);
            },
            responseIdentifier : function(interaction, identifier){
                //directly save the validate response identifier (it went throught the validator so we know it is unique)
                response.id(identifier)
                //sync the response identifier in the interaction
                interaction.attr('responseIdentifier', identifier);
            },
            restrictedIdentifier : function(interaction, identifier){
                //generate a response from that identifier (because might not be unique
                response.buildIdentifier(identifier);
                //sync the response identifier in the interaction
                interaction.attr('responseIdentifier', identifier);
            }
        });
    };
    
    function _getRestrictedIdentifier(widget){
        
        var ret = {},
            interaction = widget.element,
            responseIdentifier = interaction.attr('responseIdentifier'),
            config = widget.options.config;
        
        if(config && config.responseIdentifiers){
            _.forIn(config.responseIdentifiers, function(title, identifier){
                ret[identifier] = {
                    identifier : identifier,
                    title : title,
                    selected : responseIdentifier.match(new RegExp('^('+identifier+')(_[0-9]*)?$'))
                };
                //if selected when match the pattern RESPONSE_STUFF === RESPONSE_STUFF_2 === RESPONSE_STUFF_3
            });
        }
        return ret;
    }
    
    return EndAttemptInteractionStateQuestion;
});
