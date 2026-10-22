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
 * @author Christophe Noël <christophe@taotesting.com>
 */
import Mixin from 'taoQtiItem/qtiItem/mixin/Mixin';
import Container from 'taoQtiItem/qtiItem/mixin/Container';
import _ from 'lodash';

var methods = {};
_.extend(methods, Container.methods);
_.extend(methods, {
    initContainer: function(body) {
        Container.methods.initContainer.call(this, body);
        this.bdy.contentModel = 'table';
    }
});

export default {
    augment: function(targetClass) {
        Mixin.augment(targetClass, methods);
    },
    methods: methods
};
