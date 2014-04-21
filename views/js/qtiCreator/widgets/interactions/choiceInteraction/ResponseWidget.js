define([
    'lodash', 
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
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
            var $checked = widget.$container.find('input[name="correct_' + widget.serial + '[]"]:checked');
            $checked.each(function(){
                correct.push($(this).val());
            });
            response.setCorrect(correct);
        };

        var $choices = widget.$container.find('.qti-choice').each(function(){

            var $choice = $(this),
                choice = interaction.getChoice($choice.data('serial')),
                identifier = choice.id(),
                $responseTpl = $(responseToolbarTpl({
                    choiceSerial : choice.getSerial(),
                    choiceIdentifier : identifier,
                    interactionSerial : widget.serial,
                    correct : _isCorrect(identifier),
                    score : _getScore(identifier)
                }));
            
            $choice.append($responseTpl);
            $responseTpl.show();
        });

        $choices.find('input[data-role=correct]').on('change.qti-widget', function(){
            _saveCorrect();
        });//initialized as hidden

        //prevent propagation to prevent click and re-click because of the click event handler place on the .qti-choice
        $('.mini-tlb', widget.$container).on('click', function(e){
            e.stopPropagation();
        });

        var $scores = $choices.find('input[name=score]');
        
        formElement.initDataBinding(widget.$container, response, {
            score:function(response, value){
                
                var key = $(this).data('for');
                
                if(value === ''){
                    response.removeMapEntry(key);
                }else{
                    response.setMapEntry(key, value, true);
                }
                
            }
        });
        
        //add placeholder text to show the default value
        $scores.attr('placeholder', response.getMappingAttribute('defaultValue'));
        widget.on('mappingAttributeChange', function(data){
            if(data.key === 'defaultValue'){
                $scores.attr('placeholder', data.value);
            }
        });
        
    };

    return ResponseWidget;
});
