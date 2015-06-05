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
    'ui/contextualPopup'
], function(contextualPopup){

    'use strict';

    function build($anchor, qtiElement){
        var formContent = renderForm(qtiElement);
        return buildPopup($anchor, formContent);
    }

    function renderForm(qtiElement){
        return 'the form';
    }

    function buildPopup($anchor, formContent){
        return contextualPopup($anchor, $anchor.parents('#item-editor-scroll-inner'), {content : formContent});
    }

    return {
        build : build
    };
});