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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA
 *
 */
define(['module', 'i18n'], function (module, __) {
    'use strict';

    const qtiIdPattern = module.config().qtiResponseIdPattern || '/^[a-zA-Z_]{1}[a-zA-Z0-9_.-]*$/u';
    const [, patternContent, flags] = qtiIdPattern.match(/^\/(.+)\/(\w*)$/);
    const defaultInvalidQtiIdMessage = 'Identifiers must start with a letter or an underscore and contain only letters, numbers, dots, underscores ( _ ), or hyphens ( - ).';
    const message = module.config().invalidQtiIdMessage || defaultInvalidQtiIdMessage;
    const invalidQtiIdMessage = __(message);
    const isDisabled = module.config().isDisabled || false;

    return {
        pattern: new RegExp(patternContent, flags),
        invalidQtiIdMessage,
        maxQtiIdLength: 32,
        isDisabled
    };
});
