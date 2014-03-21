define([
    'lodash',
    'i18n',
    'tpl!taoQtiItemCreator/tpl/choiceInteraction/addChoice'
], function(_, __, addChoiceTpl){

    var _updateChoiceIdentifierInResponse = function(response, oldId, newId){

        if(oldId !== newId){

            var escapedOldId = oldId.replace(/([.-])/g, '\\$1'),
                regex = new RegExp('\\b(' + escapedOldId + ')\\b');
            
            for(var i in response.correctResponse){
                response.correctResponse[i] = response.correctResponse[i].replace(regex, newId);
            }

            var mapEntries = {};
            _.forIn(response.mapEntries, function(value, mapKey){
                mapKey = mapKey.replace(regex, newId);
                mapEntries[mapKey] = value;
            });
            response.mapEntries = mapEntries;
        }
    };

    var formElementHelper = {
        initChoiceIdentifier : function(widget){
            
            var $form = widget.$form,
                choice = widget.element,
                response = choice.getInteraction().getResponseDeclaration();

            //listen to keyup (not keydown) to have the input value updated before passing to callback
            $form.find('[data-role=identifier]').on('keyup', function(){

                //if valid:
                var oldId = choice.id(),
                    newId = $(this).val();

                //need to update correct response and mapping values too !
                _updateChoiceIdentifierInResponse(response, oldId, newId);

                //finally, set the new identifier to the choice
                choice.id(newId);
            });
        },
        initShufflePinToggle : function(widget){

            var $container = widget.$container,
                choice = widget.element;

            $container.find('.mini-tlb [data-role="shuffle-pin"]').on('mousedown', function(e){
                e.stopPropagation();
                var $icon = $(this).children();
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
        },
        appendChoiceAdditionButton : function(widget){

            var $choiceArea = widget.$container.find('.choice-area'),
                interaction = widget.element;

            //init add choice button if needed
            if(!$choiceArea.children('.add-option').length){

                $choiceArea.append(addChoiceTpl({
                    serial : this.serial,
                    text : __('Add choice')
                }));

                $choiceArea.children('.add-option').on('click.qti-widget', function(e){

                    e.stopPropagation();

                    //add a new choice
                    var choice = interaction.createChoice(),
                        $newChoicePlaceholder = $('<li>'),
                        qtiChoiceClassName = choice.qtiClass + '.' + interaction.qtiClass,
                        tplData = {
                            interaction : {
                                attributes : interaction.attributes
                            }
                        };

                    //append placeholder
                    $(this).before($newChoicePlaceholder);

                    //render the new choice
                    choice.render(tplData, $newChoicePlaceholder, qtiChoiceClassName);
                    choice.postRender({
                        ready : function(widget){
                            //transition state directly back to "question"
                            widget.changeState('question');
                        }
                    }, qtiChoiceClassName);
                });

            }
        }
    };

    return formElementHelper;
});