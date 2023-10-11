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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/choices/states/Question',
    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/hottext'
], function($, stateFactory, QuestionState, gapTpl){
    'use strict';

    var HottextStateQuestion = stateFactory.extend(QuestionState);

    HottextStateQuestion.prototype.createToolbar = function(){

        var _widget = this.widget,
            $container = _widget.$container,
            hottext = _widget.element,
            $toolbar = $container.find('.mini-tlb').not('[data-html-editable] *');

        if(!$toolbar.length){

            //add mini toolbars
            $toolbar = $(gapTpl({
                serial : hottext.getSerial(),
                state : 'question'
            }));

            $container.append($toolbar);

            //init delete:
            $toolbar.find('[data-role=restore]').on('mousedown.question', function(){

                var inlineStaticElements = hottext.getElements(),
                    parent = hottext.parent(),
                    newBody = parent.body().replace(hottext.placeholder(), hottext.body());

                //prepare the replacement of the hottext html rendering by prerendering inner element
                var hottextHtmlReplacement = inlineStaticElements.reduce((hottextBody, elt) => {
                    //move all inner element of the hottext to its parent
                    parent.setElement(elt);
                    hottext.removeElement(elt);

                    //prerender inner element to html
                    return hottextBody.replace(elt.placeholder(), elt.render());
                }, hottext.body());

                //properly destroy the old hottext and its widget
                _widget.destroy();
                hottext.remove();

                //set the new body into the model of the parent
                parent.body(newBody);

                //render static elements
                $container.replaceWith(hottextHtmlReplacement);
                inlineStaticElements.forEach(elt => {
                    elt.postRender();
                });
            });
        }

        return $toolbar;
    };

    return HottextStateQuestion;
});
