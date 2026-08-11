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
define(['lodash', 'taoQtiItem/qtiCreator/helper/dummyElement', 'ui/validator/validators'], function (
    _,
    dummyElement,
    validators
) {
    const _qtiClassToDummies = {
        math: 'maths',
        img: 'image',
        object: 'media'
    };

    //only valid for a state
    const inlineHelper = {
        checkFileExists: function (widget, element, fileSrcAttrName, baseUrl) {
            validators.validators.fileExists.validate(
                element.attr(fileSrcAttrName),
                function (fileExists) {
                    if (!fileExists) {
                        //clear value:
                        element.attr(fileSrcAttrName, '');
                        inlineHelper.togglePlaceholder(widget);
                    }
                },
                {
                    baseUrl: baseUrl || ''
                }
            );
        },
        togglePlaceholder: function (widget, opts) {
            const options = _.defaults(opts || {}, {
                container: widget.$original,
                type: widget.element.qtiClass
            });

            const $container = options.container;
            let $placeholder = $container.siblings('.dummy-element');

            if (widget.element.isEmpty()) {
                $container.hide();

                const type = _qtiClassToDummies[options.type] || options.type;
                if (!$placeholder.length) {
                    $placeholder = dummyElement.get(type);
                    $container.after($placeholder);
                }
                $placeholder.show();
            } else {
                $container.show();
                $placeholder.hide();
            }

            widget.$container.trigger('contentChange.qti-widget');
        },
        positionFloat: function (widget, position) {
            const $container = widget.$container,
                elt = widget.element;

            //remove class
            $container.removeClass('rgt lft');

            elt.removeClass('rgt');
            elt.removeClass('lft');
            switch (position) {
                case 'right':
                    $container.addClass('rgt');
                    elt.addClass('rgt');
                    break;
                case 'left':
                    $container.addClass('lft');
                    elt.addClass('lft');
                    break;
            }
        }
    };

    return inlineHelper;
});
