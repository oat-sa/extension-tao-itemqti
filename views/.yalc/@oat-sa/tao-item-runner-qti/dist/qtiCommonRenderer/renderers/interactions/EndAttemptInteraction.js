define(['lodash', 'handlebars', 'lib/handlebars/helpers', 'taoQtiItem/qtiCommonRenderer/helpers/container', 'taoQtiItem/qtiCommonRenderer/helpers/PciResponse', 'i18n'], function (_, Handlebars, Helpers0, containerHelper, pciResponse, __) { 'use strict';

        _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
        Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
        Helpers0 = Helpers0 && Object.prototype.hasOwnProperty.call(Helpers0, 'default') ? Helpers0['default'] : Helpers0;
        containerHelper = containerHelper && Object.prototype.hasOwnProperty.call(containerHelper, 'default') ? containerHelper['default'] : containerHelper;
        pciResponse = pciResponse && Object.prototype.hasOwnProperty.call(pciResponse, 'default') ? pciResponse['default'] : pciResponse;
        __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;

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
          buffer += " lang=\""
            + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang'])),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\"";
          return buffer;
          }

          buffer += "<a class=\"qti-interaction qti-inlineInteraction qti-endAttemptInteraction btn small btn-info\"\n        data-serial=\"";
          if (helper = helpers.serial) { stack1 = helper.call(depth0, {hash:{},data:data}); }
          else { helper = (depth0 && depth0.serial); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
          buffer += escapeExpression(stack1)
            + "\" \n        data-qti-class=\"endAttemptInteraction\"\n        value=\"false\"\n        tabindex=\"0\"\n        ";
          stack1 = helpers['if'].call(depth0, ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1['xml:lang']), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
          if(stack1 || stack1 === 0) { buffer += stack1; }
          buffer += ">\n        "
            + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.attributes)),stack1 == null || stack1 === false ? stack1 : stack1.title)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
            + "\n</a>\n";
          return buffer;
          });
        function tpl(data, options, asString) {
          var html = Template(data, options);
          return (asString || true) ? html : $(html);
        }

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
         * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
         */

        /**
         * Init rendering, called after template injected into the DOM
         * All options are listed in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10402
         *
         * @param {object} interaction
         * @fires endattempt with the response identifier
         */
        function render(interaction, options) {
            var $container = containerHelper.get(interaction);

            //on click,
            $container.on('click.commonRenderer', function(e) {
                //if tts component is loaded and click-to-speak function is activated - we should prevent this listener to go further
                if (
                    $(e.currentTarget)
                        .closest('.qti-item')
                        .hasClass('prevent-click-handler')
                ) {
                    return;
                }
                $container.val(true);

                containerHelper.triggerResponseChangeEvent(interaction);

                $container.trigger('endattempt', [interaction.attr('responseIdentifier')]);
            });
        }

        /**
         * Set the response to the rendered interaction.
         *
         * The response format follows the IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * Available base types are defined in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10402
         *
         * @param {object} interaction
         * @param {object} response
         */
        function setResponse(interaction, response) {
            _setVal(interaction, pciResponse.unserialize(response, interaction)[0]);
        }

        /**
         * Return the response of the rendered interaction
         *
         * The response format follows the IMS PCI recommendation :
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * Available base types are defined in the QTI v2.1 information model:
         * http://www.imsglobal.org/question/qtiv2p1/imsqti_infov2p1.html#element10402
         *
         * @param {object} interaction
         * @returns {object}
         */
        function getResponse(interaction) {
            var val = containerHelper.get(interaction).val();
            val = val && val !== 'false' && val !== '0';
            return pciResponse.serialize([val], interaction);
        }

        /**
             * Reset the response ... wondering if it is useful ...

             * @param {type} interaction
             */
        function resetResponse(interaction) {
            _setVal(interaction, false);
        }

        /**
         * Set the interaction state. It could be done anytime with any state.
         *
         * @param {Object} interaction - the interaction instance
         * @param {Object} state - the interaction state
         */
        function setState(interaction, state) {
            if (_.isObject(state)) {
                if (state.response) {
                    interaction.resetResponse();
                    interaction.setResponse(state.response);
                }
            }
        }

        /**
         * Get the interaction state.
         *
         * @param {Object} interaction - the interaction instance
         * @returns {Object} the interaction current state
         */
        function getState(interaction) {
            var state = {};
            var response = interaction.getResponse();

            if (response) {
                state.response = response;
            }
            return state;
        }

        /**
         *
         * @param {Object} interaction
         * @param {Boolean} val
         */
        function _setVal(interaction, val) {
            containerHelper
                .get(interaction)
                .val(val)
                .change();
        }

        /**
         * Destroy the interaction to restore the dom as it is before render() is called
         *
         * @param {Object} interaction
         */
        function destroy(interaction) {
            //remove event
            containerHelper.get(interaction).off('.commonRenderer');
        }

        /**
         * Define default template data
         *
         * @param {Object} interaction
         * @param {Object} data
         * @returns {Object}
         */
        function getCustomData(interaction, data) {
            if (!data.attributes.title) {
                data.attributes.title = __('End Attempt');
            }
            return data;
        }

        var EndAttemptInteraction = {
            qtiClass: 'endAttemptInteraction',
            template: tpl,
            getData: getCustomData,
            render: render,
            getContainer: containerHelper.get,
            setResponse: setResponse,
            getResponse: getResponse,
            resetResponse: resetResponse,
            destroy: destroy,
            setState: setState,
            getState: getState
        };

        return EndAttemptInteraction;

});
