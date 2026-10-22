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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA
 *
 */
import Element from 'taoQtiItem/qtiItem/core/Element';
import Container from 'taoQtiItem/qtiItem/mixin/ContainerFigcaption';
import NamespacedElement from 'taoQtiItem/qtiItem/mixin/NamespacedElement';

const Figcaption = Element.extend({
    qtiClass: 'figcaption',
    defaultNsName: 'qh5',
    defaultNsUri: 'http://www.imsglobal.org/xsd/imsqtiv2p2_html5_v1p0',
    nsUriFragment: 'imsqtiv2p2_html5_v1p0',
    init: function (serial, attributes) {
        this._super(serial, attributes);
    },
    is: function (qtiClass) {
        return qtiClass === 'figcaption' || this._super(qtiClass);
    }
});

Container.augment(Figcaption);
NamespacedElement.augment(Figcaption);

export default Figcaption;
