define([
    'lodash', 
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/formElement',
    'polyfill/placeholders'
], function(_, responseToolbarTpl, formElement){

    var ResponseWidget = {
        create : function(widget){
            _createResponseToolbar(widget);
        },
        destroy : function(widget){
            widget.$container.find('[data-edit=answer]').remove();
        },
        createResponseToolbar : _createResponseToolbar
    };

    var _createResponseToolbar = function(widget){

        var interaction = widget.element,
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
            var $checked = $('input[name="correct_' + widget.serial + '[]"]:checked');
            $checked.each(function(){
                correct.push($(this).val());
            });
            response.setCorrect(correct);
        };

        var _setMapEntry = function(key, value){
            response.setMapEntry(key, value, true);
        };

        var _removeMapEntry = function(key){
            response.removeMapEntry(key);
        };

        var $choices = widget.$container.find('.qti-choice').each(function(){

            var $choice = $(this),
                choice = interaction.getChoice($choice.data('serial')),
                identifier = choice.id();

            $choice.append(responseToolbarTpl({
                choiceSerial : choice.getSerial(),
                choiceIdentifier : identifier,
                interactionSerial : widget.serial,
                correct : _isCorrect(identifier),
                score : _getScore(identifier)
            }));
        });

        $choices.find('input[data-role=correct]').on('change.qti-widget', function(){
            _saveCorrect();
        });//initialized as hidden

        //prevent propagation to prevent click and re-click because of the click event handler place on the .qti-choice
        $('.mini-tlb', widget.$container).on('click', function(e){
            e.stopPropagation();
        });

        var $scores = $choices.find('input[data-role=score]').on('keyup.qti-widget', function(){
            
            formElement.setScore($(this), {
                required : false,
                empty:function(key){
                    _removeMapEntry(key);
                },
                set : function(key, value){
                    _setMapEntry(key, value);
                }
            });
            
        });

        $scores.attr('placeholder', response.getMappingAttribute('defaultValue'));
        widget.on('mappingAttributeChange', function(data){
            if(data.key === 'defaultValue'){
                $scores.attr('placeholder', data.value);
            }
        });
        
        //initialized as hidden
        $choices.find('[data-edit=map], [data-edit=correct]').hide();
    };



    return ResponseWidget;
});
