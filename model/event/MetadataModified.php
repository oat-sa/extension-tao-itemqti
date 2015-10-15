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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA
 *
 */
namespace oat\taoQtiItem\model\event;


use oat\oatbox\event\Event;

class MetadataModified implements Event
{

    /**
     *
     * Event name
     *
     * @var \core_kernel_classes_Resource
     */
    private $item;

    /**
     * Metadata that had changed
     *
     * @var array()
     */
    private $metadataValue;

    /**
     * MetadataInjected constructor.
     * @param $item
     * @param array $metadataValue
     */
    public function __construct($item, $metadataValue = array())
    {
        $this->item = $item;
        $this->metadataValue = $metadataValue;
    }


    /**
     * (non-PHPdoc)
     * @see \oat\oatbox\event\Event::getName()
     */
    public function getName()
    {
        return __CLASS__;
    }

    /**
     * @return \core_kernel_classes_Resource
     */
    public function getItem()
    {
        return $this->item;
    }

    /**
     * @return array
     */
    public function getMetadataValue()
    {
        return $this->metadataValue;
    }




}