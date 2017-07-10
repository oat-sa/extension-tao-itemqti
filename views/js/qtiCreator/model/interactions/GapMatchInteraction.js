/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/model/mixin/editable',
    'taoQtiItem/qtiCreator/model/mixin/editableInteraction',
    'taoQtiItem/qtiItem/core/interactions/GapMatchInteraction',
    'taoQtiItem/qtiCreator/model/choices/GapText',
    'taoQtiItem/qtiCreator/model/helper/event',
    'taoQtiItem/qtiCreator/model/helper/response'
], function(_, Element, editable, editableInteraction, Interaction, Choice, event, responseHelper){
    "use strict";
    var methods = {};
    _.extend(methods, editable);
    _.extend(methods, editableInteraction);
    _.extend(methods, {
        getDefaultAttributes : function(){
            return {
                shuffle : false
            };
        },
        afterCreate : function(){
            this.body('<p>Lorem ipsum dolor sit amet, consectetur adipisicing ...</p>');
            this.createChoice();//gapMatchInteraction requires at least one gapMatch to be valid http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10307
            this.createResponse({
                baseType : 'directedPair',
                cardinality : 'multiple'
            });
        },
        getNextPlaceholder : function getNextPlaceholder() {
            var allChoices = this.getChoices(),
                existingChoicesLabels = _.map(allChoices, function(choice) {
                    var choiceBody = choice.getBody() || {};
                    return choiceBody.bdy;
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
        createChoice : function(text){

            var choice = new Choice();

            this.addChoice(choice);

            choice
                .body(text || this.getNextPlaceholder())
                .buildIdentifier('choice');

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }

            event.choiceCreated(choice, this);

            return choice;
        },
        createGap : function(attr, body){

            var choice = new Choice('', attr);

            this.addChoice(choice);
            choice.buildIdentifier('gap');
            choice.body(body);

            if(this.getRenderer()){
                choice.setRenderer(this.getRenderer());
            }

            event.choiceCreated(choice, this);

            return choice;
        },
        removeChoice : function(element){
            var serial = '', c;

            if(typeof(element) === 'string'){
                serial = element;
            }else if(Element.isA(element, 'gap')){
                serial = element.serial;
            }else if(Element.isA(element, 'gapText')){
                serial = element.serial;
            }

            if(c = this.getBody().getElement(serial)){
                //remove choice
                this.getBody().removeElement(c);

                //update the response
                responseHelper.removeChoice(this.getResponseDeclaration(), c);

                //trigger event
                event.deleted(c, this);
            }else if(c = this.getChoice(serial)){
                //remove choice
                delete this.choices[serial];

                //update the response
                responseHelper.removeChoice(this.getResponseDeclaration(), c);

                //trigger event
                event.deleted(c, this);
            }

            return this;
        }
    });
    return Interaction.extend(methods);
});


