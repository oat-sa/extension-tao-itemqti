define(['taoQtiItem/core/Element', 'jquery', 'lodash'], function(Element, $, _){

    var _getChoiceClass = function _getChoiceClass(interaction){

        var interactionClass = '';
        if(Element.isA(interaction, 'interaction')){
            interactionClass = interaction.qtiClass;
        }else if(typeof(interaction) === 'string'){
            interactionClass = interaction;
        }

        var choiceClass = '';
        switch(interactionClass){
            case 'choiceInteraction':
            case 'orderInteraction':
                choiceClass = 'simpleChoice';
                break;
            case 'associateInteraction':
            case 'matchInteraction':
                choiceClass = 'simpleAssociableChoice';
                break;
            case 'inlineChoiceInteraction':
                choiceClass = 'inlineChoice';
                break;
            case 'gapMatchInteraction':
                choiceClass = 'gapText';
                break;
            case 'hotspotInteraction':
            case 'graphicOrderInteraction':
                choiceClass = 'hotspotChoice';
                break;
            case 'graphicAssociateInteraction':
                choiceClass = 'associableHotspot';
                break;
            case 'graphicGapMatchInteraction':
                choiceClass = 'gapImg';
                break;
            default:
                throw 'invalid interaction type ' + interactionClass;
        }

        return choiceClass;
    };

    var _setDefaultChoiceAttributes = function _setDefaultChoiceAttributes(choice, options){
        var rank = options && options.rank ? options.rank : 1;
        var attr = options && options.attr ? options.attr : {};

        if(Element.isA(choice, 'choice')){
            switch(choice.qtiClass){
                case 'simpleChoice':
                case 'simpleAssociableChoice':
                    choice
                        .body('choice ' + rank)
                        .buildIdentifier()
                        .attr(attr)
                        .attr({
                        'fixed' : false,
                        'showHide' : 'show'
                    });
                    break;
                default:
                    throw 'invalid choice type ' + choice.qtiClass;
            }
        }
    };

    var QtiEditorApi = {
        remove : function(element){
            var ret = false, item = element.getRelatedItem();
            if(item){
                var found = item.find(element.getSerial());
                if(found){
                    var parent = found.parent;

                    if(Element.isA(parent, 'interaction') && Element.isA(element, 'choice')){
                        parent.removeChoice(element);
                        ret = true;
                    }else if(typeof parent.initContainer === 'function' && found.location === 'body'){
                        parent.getBody().removeElement(element);
                        ret = true;
                    }

                    if(ret){
                        $(document).trigger('deleted.qti-widget', {'element' : element});
                    }
                }
            }
        },
        attr : function(element, key, value){
            if(key !== undefined && value !== undefined){
                $(document).trigger('attributeModified.qti-widget', {'element' : element, 'key' : key, 'value' : value});
            }
            return element.attr(key, value);
        },
        createChoice : function(interaction, options){

            var matchSet = (options && options.matchSet) ? options.matchSet : 0;
            var attrs = (options && options.attr) ? options.attr : {};

            var choiceClass = _getChoiceClass(interaction);
            require(['taoQtiItem/core/choices/' + choiceClass], function(Choice){

                var choice = new Choice();
                _setDefaultChoiceAttributes(choice, {
                    'rank' : _.size(interaction.getChoices()) + 1,
                    'matchSet' : matchSet,
                    'attr' : attrs
                });
                interaction.addChoice(choice);

                $(document).trigger('choiceCreated.qti-widget', {'choice' : choice, 'interaction' : interaction});
            });
        },
        deleteChoice : function(interaction, choice){
            if(!Element.isA(interaction, 'interaction')){
                throw 'wrong qti element type in argument';
            }else if(!Element.isA(choice, 'choice')){
                throw 'wrong qti element type in argument';
            }
            interaction.removeChoice(choice);

            $(document).trigger('choiceDeleted.qti-widget', {'choice' : choice, 'interaction' : interaction});
        },
        /**
         * Add one or more new element to the body by identifing the placeholder
         * Example: <div><h1>Hello Man</h1><p>What time is it? {{inlineChoiceInteraction:new}}</p>{{choiceInteraction:choiceInteraciton_sseekkl345klf89uhfoc}}</div>
         * @param {type} container
         * @param {type} body
         */
        createContainerElements : function(container, body){
            var regex = /{{([a-z0-9]*):new}}/i;
            body = body.replace(regex,
                function(original, qtiClass){
                    var returnValue = original;

                    //create new element
                    
                    return returnValue;
                });

        },
        editContainerBody : function(){

        },
        all : function(element, fn){
            var args = Array.prototype.slice.call(arguments, 2);
            element[fn](args);
        }
    };

    return QtiEditorApi;
});