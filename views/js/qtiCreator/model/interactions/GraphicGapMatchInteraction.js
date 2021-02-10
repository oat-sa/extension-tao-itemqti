/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/GraphicGapMatchInteraction',
    'taoQtiItem/qtiCreator/model/choices/GapImg',
    'taoQtiItem/qtiCreator/model/choices/AssociableHotspot',
    'taoQtiItem/qtiCreator/model/choices/GapText',
], function($, _, editable, editableInteraction, Interaction, GapImg, AssociableHotspot,  GapText){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {


        /**
         * Once the interaction model is created,
         * we set the responsivness and create a default response
         */
        afterCreate : function(){
            var relatedItem = this.getRootElement();
            var isResponsive = relatedItem.data('responsive');

            if(isResponsive === true){
                this.addClass('responsive');
            }

            this.createResponse({
                baseType : 'directedPair',
                cardinality : 'multiple'
            });
        },

        /**
         * Create a new gap image
         * @param {Object} object - the qti object
         * @param {String} object.data - the image url
         * @param {String|Number} object.width - the image width
         * @param {String|Number} object.height - the image height
         * @param {String} object.type - the image mime type
         * @param {String} [label] - the object label (ie. alt)
         */
        createGapImg : function(object, label){
            var gapImg = new GapImg();
            gapImg.object.attributes = object;
            if(label){
                gapImg.attr('objectLabel', label);
            }
            if(!this.gapImgs){
                this.gapImgs = [];
            }
            this.addGapImg(gapImg);
            gapImg.buildIdentifier('gapimg');

            if(this.getRenderer()){
                gapImg.setRenderer(this.getRenderer());
            }

            $(document).trigger('choiceCreated.qti-widget', {'choice' : gapImg, 'interaction' : this});

            return gapImg;
        },

        getNextPlaceholder : function getNextPlaceholder() {
            var allChoices = this.getChoices(),
                existingChoicesLabels = _.map(allChoices, function(choice) {                  
                    if (typeof choice.getBody === 'function') {
                        return choice.getBody().bdy
                    }
                }),
                placeHolderIndex = 1,
                placeHolderPrefix = 'choice #',
                placeHolder = placeHolderPrefix + placeHolderIndex;

            while (existingChoicesLabels.indexOf(placeHolder) !== -1) {
                placeHolderIndex++;
                placeHolder = placeHolderPrefix + placeHolderIndex;
            }
            return placeHolder;
        },

        createGapText : function(value = ''){
            var choice = new GapText();
            if(!this.gapTexts){
                this.gapTexts = [];
            }
            this.addGapText(choice);

            choice
                .body(value || this.getNextPlaceholder())
                .buildIdentifier('gaptext');

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }
    
            $(document).trigger('choiceCreated.qti-widget', {'choice' : choice, 'interaction' : this});
                return choice;
        },

        /**
         * Create a choice for the interaction
         * @param {Object} attr - the choice attributes
         * @returns {Object} the created choice
         */
        createChoice : function(attr){
            var choice = new AssociableHotspot('', attr);

            this.addChoice(choice);
            choice.buildIdentifier('associablehotspot');

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }

            $(document).trigger('choiceCreated.qti-widget', {'choice' : choice, 'interaction' : this});

            return choice;
        }
    });
    return Interaction.extend(methods);
});


