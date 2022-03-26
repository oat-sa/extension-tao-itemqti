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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'util/locale',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/item',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'select2'
], function (_, locale, stateFactory, Active, formTpl, formElement) {
    'use strict';

    const ItemStateActive = stateFactory.create(
        Active,
        function enterActiveState() {
            const _widget = this.widget;
            const item = _widget.element;
            const $form = _widget.$form;
            const areaBroker = this.widget.getAreaBroker();
            const $itemBody = _widget.$container.find('.qti-itemBody');
            const rtl = locale.getConfig().rtl || [];

            //build form:
            $form.html(
                formTpl({
                    serial: item.getSerial(),
                    identifier: item.id(),
                    title: item.attr('title'),
                    timeDependent: !!item.attr('timeDependent'),
                    'xml:lang': item.attr('xml:lang'),
                    languagesList: item.data('languagesList'),
                    rtl
                })
            );

            //init widget
            formElement.initWidget($form);

            //init data validation and binding
            formElement.setChangeCallbacks($form, item, {
                identifier: formElement.getAttributeChangeCallback(),
                title: function titleChange(i, title) {
                    item.attr('title', title);
                    areaBroker.getTitleArea().text(item.attr('title'));
                },
                timeDependent: formElement.getAttributeChangeCallback(),
                'xml:lang': function langChange(i, lang) {
                    item.attr('xml:lang', lang);
                    if (rtl.includes(lang)) {
                        item.bdy.attr('dir', 'rtl');
                        $itemBody.attr('dir', 'rtl');
                    } else {
                        item.bdy.removeAttr('dir');
                        $itemBody.removeAttr('dir');
                    }
                    $itemBody.trigger('item-dir-changed');
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
