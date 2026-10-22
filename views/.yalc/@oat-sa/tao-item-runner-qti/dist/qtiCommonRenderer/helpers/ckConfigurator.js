define(['ui/ckeditor/ckConfigurator'], function (ckConfigurator$1) { 'use strict';

    ckConfigurator$1 = ckConfigurator$1 && Object.prototype.hasOwnProperty.call(ckConfigurator$1, 'default') ? ckConfigurator$1['default'] : ckConfigurator$1;

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
     * Generate a configuration object for CKEDITOR
     *
     * @param editor instance of ckeditor
     * @param toolbarType block | inline | flow | qtiBlock | qtiInline | qtiFlow | reset to get back to normal
     * @param {Object} [options] - is based on the CKEDITOR config object with some additional sugar
     *        Note that it's here you need to add parameters for the resource manager.
     *        Some options are not covered in http://docs.ckeditor.com/#!/api/CKEDITOR.config
     * @param [options.dtdOverrides] - @see dtdOverrides which pre-defines them
     * @param {Object} [options.positionedPlugins] - @see ckConfig.positionedPlugins
     * @param {Boolean} [options.qtiImage] - enables the qtiImage plugin
     * @param {Boolean} [options.qtiInclude] - enables the qtiInclude plugin
     * @param {Boolean} [options.underline] - enables the underline plugin
     * @param {Boolean} [options.mathJax] - enables the mathJax plugin
     *
     * @see http://docs.ckeditor.com/#!/api/CKEDITOR.config
     */
    var getConfig = function(editor, toolbarType, options) {
        options = options || {};

        options.underline = true;

        return ckConfigurator$1.getConfig(editor, toolbarType, options);
    };

    var ckConfigurator = {
        getConfig: getConfig
    };

    return ckConfigurator;

});
