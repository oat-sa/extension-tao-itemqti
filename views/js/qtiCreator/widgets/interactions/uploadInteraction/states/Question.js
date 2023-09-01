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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
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

    const ANY_KIND = 'any/kind';
    const UploadInteractionStateQuestion = stateFactory.extend(Question);

    UploadInteractionStateQuestion.prototype.initForm = function () {
        const _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            callbacks = {},
            types = uploadHelper.getMimeTypes();
        // Pre-select a value in the types combo box if needed.
        let preselected = uploadHelper.getExpectedTypes(interaction);

        types.unshift({ mime: ANY_KIND, label: __('-- Any kind of file --') });

        if (interaction.attr('type') === '' || preselected.includes(ANY_KIND)) {
            // Kill the attribute if it is empty or has any/kind
            interaction.removeAttr('type');
            interaction.removeAttr('class');
            preselected = [];
        }

        const config = module.config();

        // set default list only for new added interaction
        if (_widget.$container.data('new') && config.defaultList && config.defaultList.length > 0) {
            preselected = preselected.concat(config.defaultList);
            uploadHelper.setExpectedTypes(interaction, config.defaultList);
            _widget.$container.data('new', false);
        }

        if (preselected.length === 0) {
            // WHEN loading the item in Authoring
            // AND (the file types contains only -- Any kind of file -- OR the file types contains no type at all)
            // THEN only -- Any kind of file -- is shown in the selection box.
            types[0].selected = true;
        } else {
            types.forEach(type => {
                if (preselected.indexOf(type.mime) >= 0) {
                    type.selected = true;
                }
            });
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

        const setAnyKind = () => {
            interaction.removeAttr('type');
            interaction.removeAttr('class');
            $select.select2('val', [ANY_KIND]);
        };
        // -- type callback.
        callbacks.type = function (interactionChanged, newTypes) {
            if (!newTypes) {
                setAnyKind();
            } else if (!newTypes.includes(ANY_KIND)) {
                uploadHelper.setExpectedTypes(interactionChanged, newTypes);
            } else {
                const currentTypes = interaction.attr('type');
                if (!currentTypes || (currentTypes.includes(ANY_KIND) && newTypes.length > 1)) {
                    // WHEN the Author adds another type THEN the type -- Any kind of file -- is removed.
                    const typesWithoutAny = newTypes.filter(value => value !== ANY_KIND);
                    uploadHelper.setExpectedTypes(interactionChanged, typesWithoutAny);
                    $select.select2('val', typesWithoutAny);
                } else {
                    // WHEN -- Any kind of file -- type is added THEN only -- Any kind of file -- is shown in the selection box.
                    setAnyKind();
                }
            }
        };

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, callbacks);
    };

    return UploadInteractionStateQuestion;
});
