define(['jquery', 'lodash', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/Graphic', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager'], function ($$1, _, Handlebars, Helpers0, graphic, pciResponse, containerHelper, instructionMgr) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
    Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
    graphic = graphic && Object.prototype.hasOwnProperty.call(graphic, 'default') ? graphic['default'] : graphic;
    pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;
    containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
    instructionMgr = instructionMgr && Object.prototype.hasOwnProperty.call(instructionMgr, 'default') ? instructionMgr['default'] : instructionMgr;

    if (!Helpers0.__initialized) {
      Helpers0(Handlebars);
      Helpers0.__initialized = true;
    }
    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "", stack1;
      buffer += "id=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program3(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " "
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1));
      return buffer;
      }

    function program5(depth0,data) {
      
      var buffer = "", stack1;
      buffer += " lang=\""
        + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
        + "\"";
      return buffer;
      }

    function program7(depth0,data) {
      
      var stack1, helper;
      if (helper = helpers.prompt) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.prompt); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      }

      buffer += "<div ";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.id), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += " class=\"qti-interaction qti-blockInteraction qti-graphicInteraction qti-selectPointInteraction clearfix";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['class']), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\" data-serial=\"";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "\"";
      stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += ">\n    ";
      stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
      if(stack1 || stack1 === 0) { buffer += stack1; }
      buffer += "\n    <div class=\"instruction-container\"></div>\n    <div class=\"image-editor solid\">\n        <div id='graphic-paper-";
      if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
      else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
      buffer += escapeExpression(stack1)
        + "' class=\"main-image-box\"></div>\n    </div>\n</div>\n";
      return buffer;
      });
    function tpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    /*
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
     * Copyright (c) 2014-2023 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
     *
     */

    /**
     * Get the responses from the interaction
     * @param {Object} interaction
     * @returns {Array} of points
     */
    const getRawResponse = function getRawResponse(interaction) {
        if (interaction && interaction.paper && _.isArray(interaction.paper.points)) {
            return _.map(interaction.paper.points, function(point) {
                return [point.x, point.y];
            });
        }
        return [];
    };

    /**
     * Add a new point to the interaction
     * @param {Object} interaction
     * @param {Object} point - the x/y point
     */
    const addPoint = function addPoint(interaction, point) {
        const maxChoices = interaction.attr('maxChoices');

        const pointChange = function pointChange() {
            containerHelper.triggerResponseChangeEvent(interaction);
            instructionMgr.validateInstructions(interaction);
        };

        if (maxChoices > 0 && getRawResponse(interaction).length >= maxChoices) {
            instructionMgr.validateInstructions(interaction);
        } else {
            if (!_.isArray(interaction.paper.points)) {
                interaction.paper.points = [];
            }

            graphic.createTarget(interaction.paper, {
                point: point,
                create: function create(target) {
                    if (interaction.isTouch && target && target.getBBox) {
                        graphic.createTouchCircle(interaction.paper, target.getBBox());
                    }

                    interaction.paper.points.push(point);

                    pointChange();
                },
                remove: function remove() {
                    _.remove(interaction.paper.points, point);

                    pointChange();
                }
            });
        }
    };

    /**
     * Make the image clickable and place targets at the given position.
     * @param {Object} interaction
     */
    const enableSelection = function enableSelection(interaction) {
        const $container = containerHelper.get(interaction);
        const $imageBox = $container.find('.main-image-box');
        const isResponsive = $container.hasClass('responsive');
        const image = interaction.paper.getById('bg-image-' + interaction.serial);

        interaction.paper.isTouch = false;

        //used to see if we are in a touch context
        image.touchstart(function() {
            interaction.paper.isTouch = true;
            image.untouchstart();
        });

        //get the point on click
        image.click(function imageClicked(event) {
            addPoint(interaction, graphic.getPoint(event, interaction.paper, $imageBox, isResponsive));
        });
    };

    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {Object} interaction
     */
    const render = function render(interaction) {
        const self = this;

        return new Promise(function(resolve) {
            const $container = containerHelper.get(interaction);
            const background = interaction.object.attributes;

            $container.off('resized.qti-widget.resolve').one('resized.qti-widget.resolve', resolve);

            //create the paper
            interaction.paper = graphic.responsivePaper('graphic-paper-' + interaction.serial, interaction.serial, {
                width: background.width,
                height: background.height,
                img: self.resolveUrl(background.data),
                imgId: 'bg-image-' + interaction.serial,
                container: $container,
                responsive  : $container.hasClass('responsive')
            });

            //enable to select the paper to position a target
            enableSelection(interaction);

            //set up the constraints instructions
            instructionMgr.minMaxChoiceInstructions(interaction, {
                min: interaction.attr('minChoices'),
                max: interaction.attr('maxChoices'),
                choiceCount: false,
                getResponse: getRawResponse,
                onError: function(data) {
                    if (data) {
                        graphic.highlightError(data.target, 'success');
                    }
                }
            });
        });
    };

    /**
     * Set the response to the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {Object} interaction
     * @param {Object} response
     */
    const setResponse = function(interaction, response) {
        let responseValues;

        if (response && interaction.paper) {
            try {
                responseValues = pciResponse.unserialize(response, interaction);

                if (interaction.getResponseDeclaration().attr('cardinality') === 'single') {
                    responseValues = [responseValues];
                }
                _(responseValues)
                    .filter(function(point) {
                        return _.isArray(point) && point.length === 2;
                    })
                    .forEach(function(point) {
                        addPoint(interaction, {
                            x: point[0],
                            y: point[1]
                        });
                    });
            } catch (err) {
                return;
            }
        }
    };

    /**
     * Reset the current responses of the rendered interaction.
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * Special value: the empty object value {} resets the interaction responses
     *
     * @param {Object} interaction
     */
    const resetResponse = function resetResponse(interaction) {
        if (interaction && interaction.paper) {
            interaction.paper.points = [];

            interaction.paper.forEach(function(element) {
                const point = element.data('point');
                if (typeof point === 'object') {

                    if(!element.events) {
                        // fix for error on empty raphael triggers
                        element.events = [];
                    }

                    graphic.trigger(element, 'click');
                }
            });
        }
    };

    /**
         i* Return the response of the rendered interaction
         *
         * The response format follows the IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * Available base types are defined in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
         *
         * @param {Object} interaction
         * @returns {Object} the response
         */
    const getResponse = function(interaction) {
        return pciResponse.serialize(getRawResponse(interaction), interaction);
    };

    /**
     * Clean interaction destroy
     * @param {Object} interaction
     */
    const destroy = function destroy(interaction) {
        if (interaction.paper) {
            const $container = containerHelper.get(interaction);

            $$1(window).off('resize.qti-widget.' + interaction.serial);
            $container.off('resize.qti-widget.' + interaction.serial);

            interaction.paper.clear();
            instructionMgr.removeInstructions(interaction);

            $$1('.main-image-box', $container)
                .empty()
                .removeAttr('style');
            $$1('.image-editor', $container).removeAttr('style');
        }

        //remove all references to a cache container
        containerHelper.reset(interaction);
    };

    /**
     * Set the interaction state. It could be done anytime with any state.
     *
     * @param {Object} interaction - the interaction instance
     * @param {Object} state - the interaction state
     */
    const setState = function setState(interaction, state) {
        if (_.isObject(state)) {
            if (state.response) {
                interaction.resetResponse();
                interaction.setResponse(state.response);
            }
        }
    };

    /**
     * Get the interaction state.
     *
     * @param {Object} interaction - the interaction instance
     * @returns {Object} the interaction current state
     */
    const getState = function getState(interaction) {
        const state = {};
        const response = interaction.getResponse();

        if (response) {
            state.response = response;
        }
        return state;
    };

    /**
     * Expose the common renderer for the interaction
     * @exports qtiCommonRenderer/renderers/interactions/SelectPointInteraction
     */
    var SelectPointInteraction = {
        qtiClass: 'selectPointInteraction',
        template: tpl,
        render: render,
        getContainer: containerHelper.get,
        setResponse: setResponse,
        getResponse: getResponse,
        resetResponse: resetResponse,
        destroy: destroy,
        setState: setState,
        getState: getState
    };

    return SelectPointInteraction;

});
