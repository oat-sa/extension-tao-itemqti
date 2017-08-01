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
 */

namespace oat\taoQtiItem\model\qti;

use oat\taoQtiItem\model\qti\container\ContainerStatic;
use oat\taoQtiItem\model\qti\container\ContainerTable;
use oat\taoQtiItem\model\qti\container\FlowContainer;

/**
 * @access public
 * @author Christophe Noël <christophe@taotesting.com>
 * @package taoQTI

 */
class Table extends Element implements FlowContainer
{
    /**
     * the QTI tag name as defined in QTI standard
     * @access protected
     * @var string
     */
    protected static $qtiTagName = 'table';

    protected $body = null;

    public function __construct($attributes, Item $relatedItem = null, $serial = ''){
        parent::__construct($attributes, $relatedItem, $serial);
        $this->body = new ContainerTable();
    }

    public function getBody(){
        return $this->body;
    }

    public function getUsedAttributes(){
        return array(
            'oat\\taoQtiItem\\model\\qti\\attribute\\Summary'
        );
    }


}