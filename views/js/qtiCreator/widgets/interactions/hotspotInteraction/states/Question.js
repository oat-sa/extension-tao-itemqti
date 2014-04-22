define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeFactory',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/shapeSideBar',
    'taoQtiItem/qtiCreator/widgets/interactions/choiceInteraction/states/Question'
], function($, stateFactory, Question, shapeFactory, shapeSideBar, ChoiceInteractionQuestionState){

    var initQuestionState = function initQuestionState(){

        var interaction = this.widget.element;
        var $container = this.widget.$container;
        var image = interaction.paper.getById('bg-image-' + interaction.serial);

        var $sideBar = shapeSideBar.create($container); 
        $sideBar.on('shapeactive.qti-widget', function(e, $form, type){

            var shaper = shapeFactory({
                    paper : interaction.paper, 
                    background : image, 
                    $container : $container.find('.main-image-box'), 
                    isResponsive : $container.hasClass('responsive'),
                    type : type
            });

            shaper.on('enterhandling.qti-widget', function(){
                $sideBar
                    .trigger('enablebin.qti-widget')
                    .on('bin.qti-widget', function(){
                        shaper.removeShape();
                    });
            });
            shaper.on('quithandling.qti-widget', function(){
                $sideBar
                    .trigger('disablebin.qti-widget')
                    .off('click');
            });

            if( type === 'path'){
                shaper.startDrawingPath();
            } else {    
                shaper.startWithMouse();
            }
        });
    };

    var exitQuestionState = function initQuestionState(){
        var $container = this.widget.$container;
        shapeSideBar.remove($container); 
    };
    
    var HotspotInteractionStateQuestion = stateFactory.extend(Question, initQuestionState, exitQuestionState);

    HotspotInteractionStateQuestion.prototype.initForm = ChoiceInteractionQuestionState.prototype.initForm;
    
    return HotspotInteractionStateQuestion;
});
