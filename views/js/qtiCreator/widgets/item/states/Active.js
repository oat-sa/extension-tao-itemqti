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
 * Copyright (c) 2014-2024 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'i18n',
    'services/features',
    'taoQtiItem/qtiCreator/helper/languages',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/item',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/qtiIdentifier',
    'select2'
], function (_, __, features, languages, stateFactory, Active, formTpl, formElement, qtiIdentifier) {
    'use strict';

    // These classes are supported for removing the instructions.
    // Therefore, they are verified for checking the related option.
    const removeInstructionClasses = ['remove-instructions', '__custom__remove-instructions'];

    // This class will be set for removing the instructions
    const removeInstructionClass = 'remove-instructions';

    const writingModeVerticalRlClass = 'writing-mode-vertical-rl';

    const ItemStateActive = stateFactory.create(
        Active,
        function enterActiveState() {
            const _widget = this.widget;
            const item = _widget.element;
            const $form = _widget.$form;
            const areaBroker = this.widget.getAreaBroker();
            const $itemBody = _widget.$container.find('.qti-itemBody');

            const showIdentifier = features.isVisible('taoQtiItem/creator/item/property/identifier');
            const disableIdentifier = qtiIdentifier.isDisabled;

            const itemElements = [$itemBody, item];
            const itemHasClass = classes => classes.some(cls => $itemBody.hasClass(cls));
            const itemAddClass = cls => itemElements.forEach(el => el.addClass(cls));
            const itemRemoveClass = cls => itemElements.forEach(el => el.removeClass(cls));
            const itemRemoveClasses = classes => classes.forEach(itemRemoveClass);

            /**
             * @param {string} lang
             * @returns {Promise<void>}
             */
            const toggleVerticalWritingModeByLang = lang =>
                languages.getVerticalWritingModeByLang(lang).then(supportedVerticalMode => {
                    const isSupported = supportedVerticalMode === 'vertical-rl';
                    if (!isSupported && itemHasClass([writingModeVerticalRlClass])) {
                        itemRemoveClasses([writingModeVerticalRlClass]);
                    }
                    $form.find('#writingMode-panel').toggle(isSupported);

                    const isVertical = itemHasClass([writingModeVerticalRlClass]);
                    $form.find('#writingMode-radio-vertical').prop('checked', isVertical);
                    $form.find('#writingMode-radio-horizontal').prop('checked', !isVertical);
                });

            let titleFormat = '%title%';
            if (_widget.options.translation) {
                titleFormat = __('%title% - Translation (%lang%)');
            }

            //build form:
            const initialXmlLang = item.attr('xml:lang');
            $form.html(
                formTpl({
                    serial: item.getSerial(),
                    identifier: item.id(),
                    showIdentifier,
                    title: item.attr('title'),
                    timeDependent: !!item.attr('timeDependent'),
                    showTimeDependent: features.isVisible('taoQtiItem/creator/item/property/timeDependant'),
                    removeInstructions: itemHasClass(removeInstructionClasses),
                    showRemoveInstructions: true,
                    'xml:lang': initialXmlLang,
                    languagesList: item.data('languagesList'),
                    disableIdentifier,
                    translation: _widget.options.translation,
                    translationStatus: _widget.options.translationStatus
                })
            );
            toggleVerticalWritingModeByLang(initialXmlLang);

            //init widget
            formElement.initWidget($form);

            //init data validation and binding
            formElement.setChangeCallbacks($form, item, {
                identifier: formElement.getAttributeChangeCallback(),
                title: function titleChange(i, title) {
                    item.attr('title', title);
                    areaBroker
                        .getTitleArea()
                        .text(
                            titleFormat
                                .replace('%title%', item.attr('title'))
                                .replace('%lang%', _widget.options.translationLanguageCode)
                        );
                },
                timeDependent: formElement.getAttributeChangeCallback(),
                removeInstructions(i, value) {
                    if (value) {
                        itemAddClass(removeInstructionClass);
                    } else {
                        itemRemoveClasses(removeInstructionClasses);
                    }
                },
                'xml:lang': function langChange(i, lang) {
                    item.attr('xml:lang', lang);
                    languages.isRTLbyLanguageCode(lang).then(isRTL => {
                        if (isRTL) {
                            item.bdy.attr('dir', 'rtl');
                            $itemBody.attr('dir', 'rtl');
                        } else {
                            item.bdy.removeAttr('dir');
                            $itemBody.removeAttr('dir');
                        }

                        $itemBody.trigger('item-dir-changed');
                    });
                    toggleVerticalWritingModeByLang(lang);
                },
                translationStatus(i, status) {
                    _widget.options.translationStatus = status;
                },
                writingMode(i, mode) {
                    if (mode === 'vertical') {
                        itemAddClass(writingModeVerticalRlClass);
                    } else {
                        itemRemoveClasses([writingModeVerticalRlClass]);
                    }
                }
            });

            const $selectBox = $form.find('select');

            $selectBox.select2({
                dropdownAutoWidth: true,
                width: 'resolve',
                minimumResultsForSearch: -1,
                formatSelection: data => {
                    if (data.css) {
                        return `<span class="${data.css}">${data.text}</span>`;
                    }
                    return data.text;
                }
            });
        },
        _.noop
    );

    return ItemStateActive;
});
