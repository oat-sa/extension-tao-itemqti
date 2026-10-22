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
 * Copyright (c) 2014 (original work) Open Assessment Technlogies SA (under the project TAO-PRODUCT);
 *
 */

/**
 * Math common renderer
 *
 * @author Sam Sipasseuth <sam@taotesting.com>
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
import tpl from 'taoQtiItem/qtiCommonRenderer/tpl/math';
import containerHelper from 'taoQtiItem/qtiCommonRenderer/helpers/container';
import MathJax from 'mathJax';
import $ from 'jquery';

// Do not wait between rendering each individual math element
// http://docs.mathjax.org/en/latest/api/hub.html
if (typeof MathJax !== 'undefined' && MathJax) {
    MathJax.Hub.processSectionDelay = 0;
}

export default {
    qtiClass: 'math',
    template: tpl,
    getContainer: containerHelper.get,
    render: function render(math) {
        $('body').on('mathjaxRendered', function (event, reference) {
            if ($(reference).find('math').length !== 0) {
                $(reference).closest('.qti-choice').addClass('flexible-choice-width');
            }
        });

        return new Promise(function (resolve) {
            const $self = containerHelper.get(math);
            if (typeof MathJax !== 'undefined' && MathJax) {
                //MathJax needs to be exported globally to integrate with tools like TTS, it's weird...
                if (!window.MathJax) {
                    window.MathJax = MathJax;
                }
                //defer execution fix some rendering issue in chrome
                if ($self.length) {
                    MathJax.Hub.Queue(['Typeset', MathJax.Hub, $self[0]]);
                    MathJax.Hub.Queue(function () {
                        $('body').trigger('mathjaxRendered', [$self[0]]);
                        resolve();
                    });
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    }
};
