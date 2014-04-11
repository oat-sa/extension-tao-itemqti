define(['lodash', 'tpl!taoQtiItem/qtiCreator/tpl/toolbars/simpleChoice.response', 'ui/groupvalidator'], function(_, responseToolbarTpl){
    
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

        var $correct = $choices.find('input[data-role=correct]').on('change.qti-widget', function(){
            _saveCorrect();
        });//initialized as hidden
        
        //prevent propagation to prevent click and re-click because of the click event handler place on the .qti-choice
        $('.mini-tlb', widget.$container).on('click', function(e){
            e.stopPropagation();
        });
        
        $choices.find('input[data-role=score]').on('keyup.qti-widget', function(){
            
            var value = $(this).val(), 
                score = parseFloat(value),
                key = $(this).attr('name');
             
             if(value === ''){
                 //leave empty, pplaceholder
             }else if(!isNaN(score)){
                 //is a correct number
                 _setMapEntry(key, score);
             }else{
                 //invalid input!
                 console.log('show error tooltip here');
             }
        });
        
//        widget.$container.groupValidator({});
//        
//        $choices.on('validated.single', 'input[data-role=score]', function(e, valid){
//            if (e.namespace === 'single') {
//                if(valid){
//                    var score = parseFloat($(this).val()),
//                        key = $(this).attr('name');
//                        
//                    _setMapEntry(key, score);
//                }
//            }
//        });
        
        //initialized as hidden
        $choices.find('[data-edit=map], [data-edit=correct]').hide();
    };
    
    

    return ResponseWidget;
});
