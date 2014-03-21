define([
    'taoQtiItemCreator/widgets/states/factory',
    'taoQtiItemCreator/widgets/states/Answer',
    'taoQtiItem/helper/response',
    'lodash',
    'tpl!taoQtiItemCreator/tpl/toolbars/simpleChoice.response',
    'ui/incrementer'
], function(stateFactory, Answer, responseHelper, _, responseToolbarTpl, incrementer){

    var InteractionStateAnswer = stateFactory.create(Answer, function(){

        //update breadcrumb

        //createResponseWidget, show response form
        this.createResponseWidget();

        //forward to one of the available sub state:
        var response = this.widget.element.getResponseDeclaration();
        if(responseHelper.isUsingTemplate(response, 'MATCH_CORRECT')){

            this.widget.changeState('correct');

        }else if(responseHelper.isUsingTemplate(response, 'MAP_RESPONSE') ||
            responseHelper.isUsingTemplate(response, 'MAP_RESPONSE_POINT')){

            this.widget.changeState('map');
        }

    }, function(){

        //update breadcrumb

        //destroy ResponseWidget, destroy response form
        this.removeResponseWidget();
    });

    InteractionStateAnswer.prototype.createResponseWidget = function(){
        this.createResponseToolbar();
    };

    InteractionStateAnswer.prototype.removeResponseWidget = function(){
        this.widget.$container.find('[data-edit=answer]').remove();
    };

    InteractionStateAnswer.prototype.createResponseToolbar = function(){
        var _widget = this.widget,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            correctResponse = _.values(response.getCorrect()),
            mapEntries = response.getMapEntries();

        var _isCorrect = function(identifier){
            return (_.indexOf(correctResponse, identifier) >= 0);
        };

        var _getScore = function(identifier){
            return (mapEntries[identifier] === undefined) ? undefined : parseFloat(response.mapEntries[identifier]);
        };

        var _saveCorrect = function(){
            var correct = [];
            var $checked = $('input[name="correct_' + _widget.serial + '[]"]:checked');
            $checked.each(function(){
                correct.push($(this).val());
            });
            response.setCorrect(correct);
        };

        var _setMapEntry = function(key, value){
            response.setMapEntry(key, value, true);
        };

        var $choices = _widget.$container.find('.qti-choice').each(function(){

            var $choice = $(this),
                choice = interaction.getChoice($choice.data('serial')),
                identifier = choice.id();

//            $choice.find('.pseudo-label-box').append(responseToolbarTpl({
            $choice.append(responseToolbarTpl({
                choiceSerial : choice.getSerial(),
                choiceIdentifier : identifier,
                interactionSerial : _widget.serial,
                correct : _isCorrect(identifier),
                score : _getScore(identifier)
            }));
        });
        incrementer($choices);

        $choices.find('input[data-role=correct]').on('change.qti-widget', function(){
            _saveCorrect();
        });//initialized as hidden

        $choices.find('input[data-role=score]').on('keyup.qti-widget', function(){
            var score = parseFloat($(this).val()),
                key = $(this).attr('name');

            _setMapEntry(key, score);
        });

        //initialized as hidden
        $choices.find('[data-edit=map], [data-edit=correct]').hide();
    };

    return InteractionStateAnswer;
});