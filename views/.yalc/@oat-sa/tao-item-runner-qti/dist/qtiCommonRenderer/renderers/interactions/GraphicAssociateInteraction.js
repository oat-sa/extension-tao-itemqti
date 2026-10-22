define(['jquery', 'lodash', 'i18n', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/Graphic', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/instructions/instructionManager'], function ($$1, _, __, Handlebars, Helpers0, graphic, pciResponse, containerHelper, instructionMgr) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
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
      buffer += " class=\"qti-interaction qti-blockInteraction qti-graphicInteraction qti-graphicAssociateInteraction clearfix";
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

    var basic = {
    	stroke: "#8D949E",
    	"stroke-width": 2,
    	"stroke-dasharray": "",
    	"stroke-linejoin": "round",
    	fill: "#cccccc",
    	"fill-opacity": 0.5,
    	cursor: "pointer"
    };
    var hover = {
    	stroke: "#3E7DA7",
    	fill: "#0E5D91",
    	"fill-opacity": 0.3
    };
    var selectable = {
    	"stroke-dasharray": "-",
    	stroke: "#3E7DA7",
    	fill: "#cccccc",
    	"fill-opacity": 0.5
    };
    var active = {
    	stroke: "#3E7DA7",
    	"stroke-dasharray": "",
    	fill: "#0E5D91",
    	"fill-opacity": 0.5
    };
    var error = {
    	stroke: "#C74155",
    	"stroke-dasharray": "",
    	"fill-opacity": 0.5,
    	fill: "#661728"
    };
    var success = {
    	stroke: "#C74155",
    	"stroke-dasharray": "",
    	fill: "#0E914B",
    	"fill-opacity": 0.5
    };
    var layer = {
    	fill: "#ffffff",
    	opacity: 0,
    	cursor: "pointer"
    };
    var creator = {
    	"fill-opacity": 0.5,
    	stroke: "#3E7DA7",
    	"stroke-dasharray": "",
    	fill: "#0E5D91",
    	cursor: "pointer"
    };
    var target = {
    	path: "m 18,8.4143672 -1.882582,0 C 15.801891,4.9747852 13.071059,2.2344961 9.63508,1.9026738 L 9.63508,0 8.2305176,0 l 0,1.9026387 C 4.7947148,2.2343027 2.0637246,4.9746621 1.7481973,8.4143672 l -1.7481973,0 0,1.4045625 1.754877,0 c 0.3460429,3.4066753 3.0632871,6.1119843 6.4756406,6.4413813 l 0,1.739689 1.4045624,0 0,-1.739725 c 3.412547,-0.329537 6.129633,-3.034793 6.475641,-6.4413453 l 1.889279,0 z m -8.36492,6.5188648 0,-4.064673 -1.4045624,0 0,4.063882 C 5.5511016,14.612555 3.4232695,12.494619 3.0864551,9.8189297 l 4.0449512,0 0,-1.4045625 -4.0546368,0 C 3.3788672,5.6984941 5.5228887,3.5393379 8.2305176,3.2161113 l 0,3.9153125 1.4045624,0 0,-3.9160859 c 2.711162,0.3203965 4.858576,2.4808887 5.160955,5.1990293 l -3.927441,0 0,1.4045625 3.917773,0 C 14.449289,12.496957 12.318363,14.616158 9.63508,14.933232 z",
    	fill: "#0E914B",
    	width: 1,
    	"stroke-width": 0,
    	cursor: "pointer"
    };
    var close = {
    	path: "M9.71875 8.20312L13.5938 12.0625C13.6875 12.1562 13.7344 12.2708 13.7344 12.4062C13.7344 12.5312 13.6875 12.6354 13.5938 12.7188L12.5625 13.75C12.4688 13.8438 12.3594 13.8906 12.2344 13.8906C12.1094 13.8906 12 13.8438 11.9062 13.75L8.03125 9.875L4.17188 13.75C4.07812 13.8438 3.96354 13.8906 3.82812 13.8906C3.70312 13.8906 3.59896 13.8438 3.51562 13.75L2.48438 12.7188C2.39062 12.6354 2.34375 12.5312 2.34375 12.4062C2.34375 12.2708 2.39062 12.1562 2.48438 12.0625L6.35938 8.20312L2.48438 4.32812C2.39062 4.23438 2.34375 4.125 2.34375 4C2.34375 3.86458 2.39062 3.75521 2.48438 3.67188L3.51562 2.64062C3.59896 2.54688 3.70312 2.5 3.82812 2.5C3.96354 2.5 4.07812 2.54688 4.17188 2.64062L8.03125 6.51562L11.9062 2.64062C12 2.54688 12.1094 2.5 12.2344 2.5C12.3594 2.5 12.4688 2.54688 12.5625 2.64062L13.5938 3.67188C13.6875 3.75521 13.7344 3.86458 13.7344 4C13.7344 4.125 13.6875 4.23438 13.5938 4.32812L9.71875 8.20312Z"
    };
    var gstyle = {
    	basic: basic,
    	hover: hover,
    	selectable: selectable,
    	active: active,
    	error: error,
    	success: success,
    	layer: layer,
    	creator: creator,
    	"imageset-rect-stroke": {
    	fill: "#ffffff",
    	stroke: "#666666",
    	"stroke-width": 1,
    	"stroke-linejoin": "round",
    	cursor: "pointer"
    },
    	"imageset-rect-no-stroke": {
    	fill: "#ffffff",
    	stroke: "#ffffff",
    	"stroke-width": 2,
    	"stroke-linejoin": "round",
    	cursor: "pointer"
    },
    	"imageset-img": {
    	cursor: "pointer"
    },
    	"order-text": {
    	fill: "#ffffff",
    	stroke: "#000000",
    	"stroke-width": 0.7,
    	"font-family": "sans-serif",
    	"font-weight": "bold",
    	"font-size": 22,
    	cursor: "pointer"
    },
    	"score-text-default": {
    	stroke: "#444444",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 20,
    	cursor: "pointer"
    },
    	"score-text": {
    	stroke: "#000000",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 20,
    	cursor: "pointer"
    },
    	"small-text": {
    	stroke: "#000000",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 16,
    	cursor: "pointer"
    },
    	"layer-pos-text": {
    	stroke: "#333",
    	"stroke-width": 0.5,
    	"font-family": "sans-serif",
    	"font-weight": "normal",
    	"font-size": 14
    },
    	target: target,
    	"target-hover": {
    	fill: "#3E7DA7",
    	"fill-opacity": 1
    },
    	"target-success": {
    	fill: "#0E914B",
    	"fill-opacity": 1
    },
    	close: close,
    	"touch-circle": {
    	fill: "none",
    	stroke: "#3E7DA7",
    	"stroke-width": 2
    }
    };

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

    const titles = {
        get hotspotBasic() {
            return __('Select this area to start an association');
        },
        get hotspotSelectable() {
            return __('Select this area to finish an association');
        },
        get line() {
            return __('Select line to remove');
        },
        get closeBtn() {
            return __('Click to remove');
        }
    };

    /**
     * Get the element that has the active state
     * @private
     * @param {Object} interaction
     * @returns {Raphael.Element} the active element
     */
    const _getActiveElement = function _getActiveElement(interaction) {
        let active;
        _.forEach(interaction.getChoices(), function (choice) {
            const element = interaction.paper.getById(choice.serial);
            if (element && element.active === true) {
                active = element;
                return false;
            }
        });
        return active;
    };

    const _getImage = function (interaction) {
        return interaction.paper.getById('bg-image-' + interaction.serial);
    };

    /**
     * @param {Raphael.Element} element
     */
    const _toggleHotspotAssociatedStyle = function (interaction, element) {
        let associated = false;
        const choiceId = element.data('choiceId');
        _.forEach(interaction.getChoices(), function (choice) {
            const otherEl = interaction.paper.getById(choice.serial);
            const assocs = otherEl.data('assocs');
            if (assocs && assocs.length && (otherEl === element || assocs.includes(choiceId))) {
                associated = true;
                return false;
            }
        });

        if (associated) {
            element.node.setAttribute('data-associated', 'true');
        } else {
            element.node.removeAttribute('data-associated');
        }
    };

    /**
     * Check if a shape can accept matches
     * @private
     * @param {Raphael.Element} element - the shape
     * @returns {Boolean} true if the element is matchable
     */
    const _isMatchable = function (element) {
        let matchable = false;
        if (element) {
            const matchMax = element.data('max') || 0;
            const matching = element.data('matching') || 0;
            matchable = matchMax === 0 || matchMax > matching;
        }
        return matchable;
    };
    /**
     * Makes the shapes selectable
     * @private
     * @param {Object} interaction
     * @param {Raphael.Element} active - the active shape
     */
    const _shapesSelectable = function _shapesSelectable(interaction, active) {
        const assocs = active.data('assocs') || [];
        const choices = interaction.getChoices();
        const activeChoice = choices[active.id];

        //update the shape state
        _.forEach(choices, function (choice) {
            const element = interaction.paper.getById(choice.serial);
            if (!assocs.includes(choice.id())) {
                const assocsElement = element.data('assocs') || [];
                if (!element.active && element.id !== active.id) {
                    if (_isMatchable(element) && !assocsElement.includes(activeChoice.id())) {
                        element.selectable = true;
                        graphic.updateElementState(element, 'selectable');
                        element.attr('title', titles.hotspotSelectable);
                    } else {
                        element.attr('title', '');
                    }
                }
            } else {
                element.attr('title', '');
            }
        });
    };

    /**
     * Makes all the shapes UNselectable
     * @private
     * @param {Object} interaction
     */
    const _shapesUnSelectable = function _shapesUnSelectable(interaction) {
        _.forEach(interaction.getChoices(), function (choice) {
            const element = interaction.paper.getById(choice.serial);
            if (element) {
                element.selectable = false;
                element.active = false;
                graphic.updateElementState(element, 'basic');
                if (_isMatchable(element)) {
                    element.attr('title', titles.hotspotBasic);
                    element.node.setAttribute('data-matchable', 'true');
                } else {
                    element.attr('title', '');
                    element.node.removeAttribute('data-matchable');
                }
            }
        });
    };

    /**
     * Create a path from a src element to a destination.
     * The path is selectable and can be removed by itself
     * @private
     * @param {Object} interaction
     * @param {Raphael.Element} srcElement - the path starts from this shape
     * @param {Raphael.Element} destElement - the path ends to this shape
     * @param {Function} onRemove - called back on path remove
     */
    const _createPath = function _createPath(interaction, srcElement, destElement, onRemove) {
        const $container = containerHelper.get(interaction);
        const paper = interaction.paper;

        //get the middle point of the source shape
        const src = srcElement.getBBox();
        const sx = src.x + src.width / 2;
        const sy = src.y + src.height / 2;

        //get the middle point of the source shape
        const dest = destElement.getBBox();
        const dx = dest.x + dest.width / 2;
        const dy = dest.y + dest.height / 2;

        const pathStr = 'M' + sx + ',' + sy + 'L' + dx + ',' + dy;
        const pathStartStr = 'M' + sx + ',' + sy + 'L' + sx + ',' + sy;

        const lineGroup = paper.group({ class: 'assoc-line' }).attr('title', titles.line).click(onLineClick);
        const lineShadow = paper.path(pathStartStr).animate({ path: pathStr }, 200).attr({ class: 'assoc-line-shadow' });
        const lineOuter = paper.path(pathStartStr).animate({ path: pathStr }, 200).attr({ class: 'assoc-line-outer' });
        const lineInner = paper.path(pathStartStr).animate({ path: pathStr }, 200).attr({ class: 'assoc-line-inner' });
        const lineHitbox = paper.path(pathStr).attr({ class: 'assoc-line-hitbox' });
        lineGroup.appendChild(lineShadow);
        lineGroup.appendChild(lineOuter);
        lineGroup.appendChild(lineInner);
        lineGroup.appendChild(lineHitbox);

        //get the middle of the path
        const midPath = lineHitbox.getPointAtLength(lineHitbox.getTotalLength() / 2);

        const closerRad = 14;
        const closerHitboxRad = 20;
        const closerPathHalfSize = 8;
        const closerPathScale = 0.8;

        const closerHitbox = paper.circle(midPath.x, midPath.y, closerHitboxRad).attr({ class: 'close-btn-hitbox' });
        const closerBg = paper.circle(midPath.x, midPath.y, closerRad).attr({ class: 'close-btn-bg' });
        const closerPath = paper
            .path(gstyle.close.path)
            .attr({ class: 'close-btn-path' })
            .transform(`t${midPath.x - closerPathHalfSize},${midPath.y - closerPathHalfSize}s${closerPathScale}`);
        const closerGroup = paper
            .group({ class: 'close-btn' })
            .attr('title', titles.closeBtn)
            .click(function () {
                removeLine(onRemove);
            });
        closerGroup.appendChild(closerHitbox);
        closerGroup.appendChild(closerBg);
        closerGroup.appendChild(closerPath);

        _toggleHotspotAssociatedStyle(interaction, srcElement);
        _toggleHotspotAssociatedStyle(interaction, destElement);

        $container.on(`unselect.graphicassociate.${lineGroup.id}`, unselectLine);
        $container.on(`resetresponse.graphicassociate.${lineGroup.id}`, removeLine);

        function onLineClick() {
            $container.trigger('unselect-active-hotspot.graphicassociate');
            if (lineGroup.node.classList.contains('selected')) {
                unselectLine();
            } else {
                selectLine();
            }
        }

        function createGlassLayer() {
            const glassLayer = paper
                .rect(0, 0, paper.w, paper.h)
                .attr('class', 'glass-layer')
                .click(function () {
                    _shapesUnSelectable(interaction);
                    $container.trigger('unselect.graphicassociate');
                });
            glassLayer.id = 'glassLayer';
        }

        function removeGlassLayer() {
            const glassLayer = paper.getById('glassLayer');
            if (glassLayer) {
                glassLayer.remove();
            }
        }

        function selectLine() {
            createGlassLayer();
            lineGroup.node.classList.add('selected');
            [srcElement, destElement].forEach(raphEl => {
                raphEl.node.setAttribute('data-for-selected-line', 'true');
            });
            lineGroup.data({ prevSibling: lineGroup.node.previousElementSibling });
            //not 'raphEl.toFront()' to not mess with el.prev/el.next/paper.top/paper.bottom'
            lineGroup.node.parentElement.insertBefore(lineGroup.node, null);
            lineGroup.node.after(closerGroup.node);
            lineGroup.attr('title', '');
        }
        function unselectLine() {
            lineGroup.node.classList.remove('selected');
            [srcElement, destElement].forEach(raphEl => {
                raphEl.node.removeAttribute('data-for-selected-line');
            });
            if (lineGroup.data('prevSibling')) {
                lineGroup.data('prevSibling').after(lineGroup.node);
                lineGroup.node.after(closerGroup.node);
            }
            lineGroup.removeData('prevSibling');
            lineGroup.attr('title', titles.line);
            removeGlassLayer();
        }

        function removeLine(removeCallback) {
            $container.off(`unselect.graphicassociate.${lineGroup.id}`);
            $container.off(`resetresponse.graphicassociate.${lineGroup.id}`);

            closerGroup.remove();
            lineGroup.remove();
            removeGlassLayer();

            if (typeof removeCallback === 'function') {
                removeCallback();
            }

            [srcElement, destElement].forEach(raphEl => {
                _toggleHotspotAssociatedStyle(interaction, raphEl);
                raphEl.node.removeAttribute('data-for-selected-line');
            });

            _shapesUnSelectable(interaction);
        }
    };

    /**
     * Get the response from the interaction
     * @private
     * @param {Object} interaction
     * @returns {Array} the response in raw format
     */
    const _getRawResponse = function _getRawResponse(interaction) {
        let responses = [];
        _.forEach(interaction.getChoices(), function (choice) {
            const element = interaction.paper.getById(choice.serial);
            const assocs = element ? element.data('assocs') : null;
            if (element && assocs) {
                responses = responses.concat(
                    _.map(assocs, function (id) {
                        return [choice.id(), id];
                    })
                );
            }
        });
        return responses;
    };
    /**
     * By clicking the paper image the shapes are restored to their default state
     * @private
     * @param {Object} interaction
     */
    const _paperUnSelect = function _paperUnSelect(interaction) {
        const $container = containerHelper.get(interaction);
        const image = _getImage(interaction);
        if (image) {
            image.click(function () {
                _shapesUnSelectable(interaction);
                $container.trigger('unselect.graphicassociate');
            });
        }
    };
    /**
     * Render a choice inside the paper.
     * Please note that the choice renderer isn't implemented separately because it relies on the Raphael paper instead of the DOM.
     * @param {Paper} paper - the raphael paper to add the choices to
     * @param {Object} interaction
     * @param {Object} choice - the hotspot choice to add to the interaction
     */
    const _renderChoice = function _renderChoice(interaction, choice) {
        const shape = choice.attr('shape');
        const coords = choice.attr('coords');
        const maxAssociations = interaction.attr('maxAssociations');

        graphic
            .createElement2(interaction.paper, shape, coords, {
                id: choice.serial
            })
            .data('choiceId', choice.id()) //same as used in 'assocs' data
            .data('max', choice.attr('matchMax'))
            .data('matching', 0)
            .removeData('assocs')
            .click(function () {
                //can't create more associations than the maxAssociations attr
                if (maxAssociations > 0 && _getRawResponse(interaction).length >= maxAssociations) {
                    _shapesUnSelectable(interaction);
                    instructionMgr.validateInstructions(interaction, { choice: choice, target: this });
                    return;
                }
                const active = _getActiveElement(interaction);
                if (this.selectable) {
                    if (active) {
                        //increment the matching counter
                        active.data('matching', active.data('matching') + 1);
                        this.data('matching', this.data('matching') + 1);

                        //attach the response to the active (not the dest)
                        const assocs = active.data('assocs') || [];
                        assocs.push(choice.id());
                        active.data('assocs', assocs);

                        //and create the path
                        _createPath(interaction, active, this, () => {
                            //decrement the matching counter
                            active.data('matching', active.data('matching') - 1);
                            this.data('matching', this.data('matching') - 1);

                            //detach the response from the active
                            active.data('assocs', _.pull(active.data('assocs') || [], choice.id()));

                            containerHelper.triggerResponseChangeEvent(interaction);
                            instructionMgr.validateInstructions(interaction, { choice: choice, target: this });
                        });
                    }
                    _shapesUnSelectable(interaction);
                } else if (this.active) {
                    _shapesUnSelectable(interaction);
                } else if (_isMatchable(this)) {
                    if (active) {
                        _shapesUnSelectable(interaction);
                    }
                    graphic.updateElementState(this, 'active');
                    this.attr('title', '');
                    this.active = true;
                    _shapesSelectable(interaction, this);
                }

                containerHelper.triggerResponseChangeEvent(interaction);
                instructionMgr.validateInstructions(interaction, { choice: choice, target: this });
            });
    };
    /**
     * Init rendering, called after template injected into the DOM
     * All options are listed in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     * @returns {Promise}
     */
    const render = function render(interaction) {
        const self = this;

        return new Promise(function (resolve) {
            const $container = containerHelper.get(interaction);
            const background = interaction.object.attributes;

            $container.off('resized.qti-widget.resolve').one('resized.qti-widget.resolve', resolve);

            interaction.paper = graphic.responsivePaper('graphic-paper-' + interaction.serial, interaction.serial, {
                width: background.width,
                height: background.height,
                img: self.resolveUrl(background.data),
                imgId: 'bg-image-' + interaction.serial,
                container: $container,
                responsive: $container.hasClass('responsive')
            });

            //call render choice for each interaction's choices
            _.forEach(interaction.getChoices(), _.partial(_renderChoice, interaction));
            _shapesUnSelectable(interaction);

            //make the paper clear the selection by clicking it
            _paperUnSelect(interaction);
            $container.on('unselect-active-hotspot.graphicassociate', function () {
                _shapesUnSelectable(interaction);
            });

            //set up the constraints instructions
            instructionMgr.minMaxChoiceInstructions(interaction, {
                min: interaction.attr('minAssociations'),
                max: interaction.attr('maxAssociations'),
                getResponse: _getRawResponse,
                onError: function (data) {
                    if (data && data.target) {
                        graphic.highlightError(data.target);
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
     * Special value: the empty object value {} resets the interaction responses
     *
     * @param {object} interaction
     * @param {object} response
     */
    const setResponse = function (interaction, response) {
        let responseValues;
        if (response && interaction.paper) {
            try {
                responseValues = pciResponse.unserialize(response, interaction);
                if (responseValues.length === 2 && !Array.isArray(responseValues[0]) && !Array.isArray(responseValues[1])) {
                    responseValues = [responseValues];
                }
            } catch (e) {
                console.error(e);
            }

            if (_.isArray(responseValues)) {
                //create an object with choiceId => shapeElement
                const map = _.transform(interaction.getChoices(), function (res, choice) {
                    res[choice.id()] = interaction.paper.getById(choice.serial);
                });
                _.forEach(responseValues, function (responseValue) {
                    if (_.isArray(responseValue) && responseValue.length === 2) {
                        const el1 = map[responseValue[0]];
                        const el2 = map[responseValue[1]];
                        if (el1 && el2) {
                            graphic.trigger(el1, 'click');
                            graphic.trigger(el2, 'click');
                        }
                    }
                });
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
     * @param {object} interaction
     * @param {object} response
     */
    const resetResponse = function resetResponse(interaction) {
        const toRemove = [];
        //reset response and state bound to shapes
        _.forEach(interaction.getChoices(), function (choice) {
            const element = interaction.paper.getById(choice.serial);
            if (element) {
                element.data({
                    max: choice.attr('matchMax'),
                    matching: 0,
                    assocs: []
                });
            }
        });

        if (interaction && interaction.paper) {
            const $container = containerHelper.get(interaction);
            $container.trigger('resetresponse.graphicassociate');
        }
        toRemove.forEach(el => el.remove());
    };

    /**
     * Return the response of the rendered interaction
     *
     * The response format follows the IMS PCI recommendation :
     * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
     *
     * Available base types are defined in the QTI v2.1 information model:
     * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10321
     *
     * @param {object} interaction
     * @returns {object}
     */
    const getResponse = function (interaction) {
        const raw = _getRawResponse(interaction);
        const response = pciResponse.serialize(raw, interaction);
        return response;
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

            $container.off('.graphicassociate');

            $$1('.main-image-box', $container).empty().removeAttr('style');
            $$1('.image-editor', $container).removeAttr('style');
            $$1('ul', $container).empty();
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
     * Expose the common renderer for the hotspot interaction
     * @exports qtiCommonRenderer/renderers/interactions/GraphicAssociateInteraction
     */
    var GraphicAssociateInteraction = {
        qtiClass: 'graphicAssociateInteraction',
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

    return GraphicAssociateInteraction;

});
