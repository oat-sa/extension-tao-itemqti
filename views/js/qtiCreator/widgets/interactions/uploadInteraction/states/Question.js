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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

define([
    'module',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/blockInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCommonRenderer/helpers/uploadMime',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/upload'
], function (module, _, __, stateFactory, Question, formElement, uploadHelper, formTpl) {
    'use strict';
    const UploadInteractionStateQuestion = stateFactory.extend(Question);

    UploadInteractionStateQuestion.prototype.initForm = function () {
        const _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            callbacks = {},
            types = uploadHelper.getMimeTypes();
        // Pre-select a value in the types combo box if needed.
        let preselected = uploadHelper.getExpectedTypes(interaction);

        const config = module.config();

        if (preselected.length === 0 && config.defaultList && config.defaultList.length > 0) {
            preselected = preselected.concat(config.defaultList);
            uploadHelper.setExpectedTypes(interaction, config.defaultList);
        }

        types.unshift({ mime: 'any/kind', label: __('-- Any kind of file --') });

        if (interaction.attr('type') === '') {
            // Kill the attribute if it is empty.
            delete interaction.attributes.type;
        }

        for (let i in types) {
            if (_.indexOf(preselected, types[i].mime) >= 0) {
                types[i].selected = true;
            }
        }
        $form.html(
            formTpl({
                types: types
            })
        );

        formElement.initWidget($form);
        const $select = $form.find('[name="type"]');
        $select.select2({
            width: '100%',
            formatNoMatches: function () {
                return __('Enter a select MIME-type');
            }
        });

        // -- type callback.
        callbacks.type = function (interactionChanged, attrValue) {
            uploadHelper.setExpectedTypes(interactionChanged, attrValue);
        };

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    return UploadInteractionStateQuestion;
});