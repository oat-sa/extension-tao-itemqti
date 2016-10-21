<?php
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\model\update;

use oat\qtiItemPci\model\PciModel;
use \oat\taoQtiItem\model\qti\Item;

/**
 * Class ItemFixPortableElementCss
 * @package oat\taoQtiItem\model\update
 */
class ItemFixPortableElementCss extends ItemUpdater
{
    /**
     *
     * Remove unused local item reference to a registered PCI css
     *
     * @param Item $item
     * @param string $itemFile
     * @return bool
     */
    protected function updateItem(Item $item, $itemFile)
    {
        $changed = false;
        $registry = (new PciModel())->getRegistry();
        $pcis = $item->getComposingElements('\oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction');
        $pciStylesheets = [];
        foreach($pcis as $pci){
            $model = $registry->fetch($pci->getTypeIdentifier());
            $pciStylesheets = array_merge($pciStylesheets, array_map(function($css) use ($pci){
                return preg_replace('/^.\//', $pci->getTypeIdentifier().'/', $css);
            }, $model->getRuntimeKey('stylesheets')));
        }

        $stylesheets = $item->getStylesheets();
        foreach($stylesheets as $stylesheet){
            if(in_array($stylesheet->attr('href'), $pciStylesheets)){
                $item->removeStylesheet($stylesheet);
                $changed = true;
            }
        }

        return $changed;
    }
}