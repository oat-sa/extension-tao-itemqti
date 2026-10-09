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
    'taoQtiItem/qtiCreator/model/choices/GapText',
    'taoQtiItem/qtiCreator/model/choices/AssociableHotspot',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiItem/helper/rendererConfig',
    'i18n'
], function($, _, editable, editableInteraction, Interaction, GapImg, GapText, AssociableHotspot, Element, rendererConfig, __){
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

            if(!this.gapTexts){
                this.gapTexts = {};
            }
            this.addClass('qti-choices-bottom');

            if(isResponsive === true){
                this.addClass('responsive');
            }

            this.createResponse({
                baseType : 'directedPair',
                cardinality : 'multiple'
            });
        },

        addGapText : function(gapText){
            if(!this.gapTexts){
                this.gapTexts = {};
            }
            if(Element.isA(gapText, 'gapText')){
                gapText.setRootElement(this.getRootElement() || null);
                this.gapTexts[gapText.getSerial()] = gapText;
            }
            return this;
        },

        removeGapText : function(gapText){
            var serial = '';
            if(!this.gapTexts){
                this.gapTexts = {};
            }
            if(typeof gapText === 'string'){
                serial = gapText;
            }else if(Element.isA(gapText, 'gapText')){
                serial = gapText.getSerial();
            }
            delete this.gapTexts[serial];
            return this;
        },

        getGapTexts : function(){
            if(!this.gapTexts){
                this.gapTexts = {};
            }
            return _.clone(this.gapTexts);
        },

        getGapText : function(serial){
            if(!this.gapTexts){
                this.gapTexts = {};
            }
            return this.gapTexts[serial];
        },

        getChoiceByIdentifier : function(identifier){
            var choice = Interaction.prototype.getChoiceByIdentifier.call(this, identifier);
            if(!choice){
                choice = _.find(this.gapTexts, function(elt){
                    return elt && elt.id() === identifier;
                });
            }
            return choice;
        },

        getComposingElements : function(){
            var serial,
                elts = Interaction.prototype.getComposingElements.call(this);

            if(!this.gapTexts){
                this.gapTexts = {};
            }
            for (serial in this.gapTexts) {
                elts[serial] = this.gapTexts[serial];
                elts = _.extend(elts, this.gapTexts[serial].getComposingElements());
            }
            return elts;
        },

        find : function(serial){
            var found = Interaction.prototype.find.call(this, serial);

            if (!found && this.gapTexts && this.gapTexts[serial]) {
                found = { parent: this, element: this.gapTexts[serial] };
            }
            return found;
        },

        render : function(){
            var serial,
                args = rendererConfig.getOptionsFromArguments(arguments),
                renderer = args.renderer || this.getRenderer(),
                extraData = {
                    gapTexts: []
                };

            var gapTexts = this.getGapTexts();
            for (serial in gapTexts) {
                if (Element.isA(gapTexts[serial], 'choice')) {
                    extraData.gapTexts.push(gapTexts[serial].render({}, null, '', renderer));
                }
            }

            return Interaction.prototype.render.call(
                this,
                _.merge(extraData, args.data || {}),
                args.placeholder,
                args.subclass,
                renderer
            );
        },

        toArray : function(){
            var serial,
                arr = Interaction.prototype.toArray.call(this);

            if(!this.gapTexts){
                this.gapTexts = {};
            }
            arr.gapTexts = {};
            _.forEach(this.gapTexts, function(gapText, gapTextSerial){
                arr.gapTexts[gapTextSerial] = gapText.toArray();
            });
            return arr;
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

        /**
         * Create a new gap text choice
         * @param {String} [text] - label content
         * @returns {Object} the created gapText
         */
        createGapText : function(text){
            var gapText = new GapText();

            this.addGapText(gapText);
            gapText
                .body(text || __('New label'))
                .buildIdentifier('gaptext');

            if(this.getRenderer()){
                gapText.setRenderer(this.getRenderer());
            }

            $(document).trigger('choiceCreated.qti-widget', {'choice' : gapText, 'interaction' : this});

            return gapText;
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

