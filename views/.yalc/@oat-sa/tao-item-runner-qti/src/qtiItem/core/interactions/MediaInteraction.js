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
 * Copyright (c) 2014-2017 (original work) Open Assessment Technologies SA ;
 */
import _ from 'lodash';
import ObjectInteraction from 'taoQtiItem/qtiItem/core/interactions/ObjectInteraction';
import rendererConfig from 'taoQtiItem/qtiItem/helper/rendererConfig';

var MediaInteraction = ObjectInteraction.extend({
    qtiClass: 'mediaInteraction',
    render: function render() {
        var args = rendererConfig.getOptionsFromArguments(arguments),
            renderer = args.renderer || this.getRenderer(),
            defaultData = {
                object: this.object.render({}, null, '', renderer)
            };

        return this._super(_.merge(defaultData, args.data), args.placeholder, args.subclass, renderer);
    },
    getNormalMaximum: function getNormalMaximum() {
        return 0;
    }
});
export default MediaInteraction;
