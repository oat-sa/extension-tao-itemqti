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
 * Copyright (c) 2014-2021 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'lodash',
    'util/locale',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Active',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/item',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/gridEditor/content',
    'taoQtiItem/qtiCreator/widgets/component/languageSelector/languageSelector',
    'select2'
], function(_, locale, stateFactory, Active, formTpl, formElement, contentHelper, languageSelectorFactory){
    'use strict';

    const ItemStateActive = stateFactory.create(Active, function enterActiveState(){
        const _widget = this.widget;
        const item = _widget.element;
        const $form = _widget.$form;
        const areaBroker = this.widget.getAreaBroker();

        const rtl = locale.getConfig().rtl || [];
        //build form:
        $form.html(formTpl({
            serial : item.getSerial(),
            identifier : item.id(),
            title : item.attr('title'),
            timeDependent : !!item.attr('timeDependent')
        }));

        //init widget
        formElement.initWidget($form);

        //init data validation and binding
        formElement.setChangeCallbacks($form, item, {
            identifier : formElement.getAttributeChangeCallback(),
            title : function titleChange(i, title){
                item.attr('title', title);
                areaBroker.getTitleArea().text(item.attr('title'));
            },
            timeDependent : formElement.getAttributeChangeCallback()
        });

        languageSelectorFactory($form.find('.language-selector-panel'), {
            lang : item.attr('xml:lang'),
            languagesList : item.data('languagesList')
        }).on('change', function({ lang, dir }){
            item.attr('xml:lang', lang);
            item.attr('dir', dir);
            const $itemBody = _widget.$container.find('.qti-itemBody');
            $itemBody.attr('dir', dir);
                //need to update item body
                // item.body(contentHelper.getContent($itemBody));
        });

    }, _.noop);

    return ItemStateActive;
});
