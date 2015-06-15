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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'taoQtiItem/apipCreator/editor/form/formHelper',
    'tpl!taoQtiItem/apipCreator/tpl/form/accessElementInfo/brailleText'
], function (formHelper, formTpl) {
    'use strict';

    function Form(accessElementInfo, options) {
        this.accessElementInfo = accessElementInfo;
        this.options = options;
    }

    /**
     * Render form
     * @param {object} options
     * @returns {unresolved}
     */
    Form.prototype.render = function render(options) {
        var tplData = {
            "brailleTextString" : this.accessElementInfo.getAttribute('brailleTextString')
        };
        return formTpl(tplData);
    };

    /**
     * Initialize form events.
     * @param {object} $container - jQuery element. Popup container.
     * @returns {undefined}
     */
    Form.prototype.initEvents = function initEvents($container) {
        formHelper.initEvents(this, $container);
    };

    return Form;
});