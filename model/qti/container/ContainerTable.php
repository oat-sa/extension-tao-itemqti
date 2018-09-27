<?php
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\qti\container;

/**
 * The ContainerTable represents a QTI table content
 *
 * @access public
 * @author Christophe Noël <christophe@taotesting.com>
 * @package taoQTI
 */
class ContainerTable extends ContainerInteractive
{

    /**
     * return the list of available element classes
     *
     * @access public
     * @return array
     */
    public function getValidElementTypes(){
        return array(
            'oat\\taoQtiItem\\model\\qti\\Img',
            'oat\\taoQtiItem\\model\\qti\\Math',
            'oat\\taoQtiItem\\model\\qti\\feedback\\Feedback',
            \oat\taoQtiItem\model\qti\QtiObject::class,
            'oat\\taoQtiItem\\model\\qti\\Tooltip',
            'oat\\taoQtiItem\\model\\qti\\interaction\\Interaction',
            'oat\\taoQtiItem\\model\\qti\\RubricBlock',
            'oat\\taoQtiItem\\model\\qti\\InfoControl',
            'oat\\taoQtiItem\\model\\qti\\XInclude',
            \oat\taoQtiItem\model\qti\Table::class,
        );
    }
}
