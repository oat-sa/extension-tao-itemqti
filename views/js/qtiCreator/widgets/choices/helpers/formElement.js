define(['lodash'], function(_){

    var _updateChoiceIdentifierInResponse = function(response, oldId, newId){

        var escapedOldId = oldId.replace(/([.-])/g, '\\$1'),
            regex = new RegExp('\\b(' + escapedOldId + ')\\b');//@todo: to be tested in presence of special chars

        for(var i in response.correctResponse){
            response.correctResponse[i] = response.correctResponse[i].replace(regex, newId);
        }

        var mapEntries = {};
        _.forIn(response.mapEntries, function(value, mapKey){
            mapKey = mapKey.replace(regex, newId);
            mapEntries[mapKey] = value;
        });
        response.mapEntries = mapEntries;
    };

    var _updateChoiceIdentifier = _.throttle(function(choice, newId, response){

        var oldId = choice.id();

        if(oldId !== newId){
            //need to update correct response and mapping values too !
            _updateChoiceIdentifierInResponse(response, oldId, newId);

            //finally, set the new identifier to the choice
            choice.id(newId);
        }
    }, 200);

    var formElementHelper = {
        initIdentifier : function(widget){

            var $form = widget.$form,
                choice = widget.element,
                response = choice.getInteraction().getResponseDeclaration();

            //listen to keyup (not keydown) to have the input value updated before passing to callback
            $form.find('[data-role=identifier]').on('keyup', function(){
                _updateChoiceIdentifier(choice, $(this).val(), response);
            });
        },
        initShufflePinToggle : function(widget){

            var $container = widget.$container,
                choice = widget.element;
            
            $container.find('[data-role="shuffle-pin"]').on('mousedown', function(e){
                e.stopPropagation();
                var $icon = $(this).children();
                if($icon.length === 0){
                    $icon = $(this);
                }
                if($icon.hasClass('icon-shuffle')){
                    $icon.removeClass('icon-shuffle').addClass('icon-pin');
                    choice.attr('fixed', true);
                }else{
                    $icon.removeClass('icon-pin').addClass('icon-shuffle');
                    choice.attr('fixed', false);
                }
            });
        },
        initDelete : function(widget){

            var $container = widget.$container;

            $container.find('.mini-tlb [data-role="delete"]').on('mousedown', function(e){
                e.stopPropagation();
                widget.changeState('deleting');
            });
        }
    };

    return formElementHelper;
});