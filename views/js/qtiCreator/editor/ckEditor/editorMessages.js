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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * This is a place to store messages originating from CKeditor plugins, so we can translate them...
 * @author Christophe Noël <christophe@taotesting.com>
 */
define(['i18n'], function(__) {
    'use strict';

    return {
        tooltipInvalidSelection: __(
            'It is not possible to create a tooltip from the current selection or cursor position. ' +
            'Please try to make your selection smaller or move the cursor outside of an existing tooltip.'
        )
    };
});