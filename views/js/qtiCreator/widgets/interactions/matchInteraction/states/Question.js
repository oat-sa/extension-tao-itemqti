define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/associateInteraction/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/matchInteraction.adder',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/matchInteraction.row',
    'tpl!taoQtiItem/qtiCreator/tpl/interactions/matchInteraction.cell',
    'lodash'
], function(stateFactory, Question, AssociateInteractionQuestionState, adderTpl, rowTpl, cellTpl, _){

    var MatchInteractionStateQuestion = stateFactory.extend(Question);

    MatchInteractionStateQuestion.prototype.initForm = AssociateInteractionQuestionState.prototype.initForm;

    MatchInteractionStateQuestion.prototype.addNewChoiceButton = function(){

        var interaction = this.widget.element,
            $matchArea = this.widget.$container.find('.match-interaction-area'),
            qtiChoiceClassName = 'simpleAssociableChoice.matchInteraction';

        var postRender = function(choice){
            
            choice.postRender({
                ready : function(widget){
                    //transition state directly back to "question"
                    widget.changeState('question');
                }
            }, qtiChoiceClassName);
        };

        if(!$matchArea.find('.add-option').length){
            
            $matchArea.append(adderTpl());

            $matchArea.find('.add-option[data-role=add-col]').on('click', function(){
                
                //match set 0
                var choice = interaction.createChoice(0);
                
                $matchArea.find('thead > tr').append(choice.render(qtiChoiceClassName));
                $matchArea.find('tbody > tr').append(cellTpl({}));
                
                postRender({
                    ready : function(widget){
                        //transition state directly back to "question"
                        widget.changeState('choice');
                    }
                }, choice);
                
            }).show();

            $matchArea.find('.add-option[data-role=add-row]').on('click', function(){
                
                //match set 1
                var choice = interaction.createChoice(1);
                
                $matchArea.find('tbody').append(rowTpl({
                    choice : choice.render(qtiChoiceClassName),
                    otherMatchSetCount : _.size(interaction.choices[0])
                }));
                
                postRender({
                    ready : function(widget){
                        //transition state directly back to "question"
                        widget.changeState('choice');
                    }
                }, choice);
                
            }).show();
        }

    };

    return MatchInteractionStateQuestion;
});