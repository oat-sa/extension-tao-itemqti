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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\export;

use oat\taoQtiItem\model\portableElement\element\PortableElementObject;
use oat\taoQtiItem\model\Export\AbstractQTIItemExporter;
use DOMNode;

abstract class PortableElementExporter
{
    /**
     * @var null|PortableElementObject
     */
    protected $object = null;

    /**
     * @var array
     */
    protected $portableAssetsToExport = [];

    /**
     * PortableElementExporter constructor.
     * @param PortableElementObject $portableElementObject
     * @param AbstractQTIItemExporter $qtiItemExporter
     */
    public function __construct(PortableElementObject $portableElementObject, AbstractQTIItemExporter $qtiItemExporter)
    {
        $this->object = $portableElementObject;
        $this->qtiItemExporter = $qtiItemExporter;
    }

    /**
     * Copy the asset files of the PCI to the item exporter and return the list of copied assets
     * @param $replacementList
     * @return array
     */
    abstract public function copyAssetFiles(&$replacementList);

    protected function removeOldNode(DOMNode $resourcesNode, $nodeName)
    {
        $xpath = new \DOMXPath($resourcesNode->ownerDocument);
        $oldNodeList = $xpath->query('.//*[local-name(.) = "' . $nodeName . '"]', $resourcesNode);
        if ($oldNodeList->length > 0) {
            foreach ($oldNodeList as $oldNode) {
                $resourcesNode->removeChild($oldNode);
            }
        }
        unset($xpath);
    }

    protected function getRawExportPath($file)
    {
        return $this->portableAssetsToExport[$file];
    }

    protected function getRelPath($from, $to)
    {
        return ($from === basename($from)) ? $to : \helpers_File::getRelPath($from, $to);
    }
}
