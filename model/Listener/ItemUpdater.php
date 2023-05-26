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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiItem\model\Listener;

use core_kernel_classes_Resource;
use oat\oatbox\filesystem\File;
use oat\taoItems\model\event\ItemRdfUpdatedEvent;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\Service;
use taoItems_models_classes_itemModel;
use taoItems_models_classes_ItemsService;

/**
 * synchronise item between database and QTI XMl
 * @author Christophe GARCIA <christopheg@taotesting.com>
 */
class ItemUpdater
{
    /**
     * synchronise item label
     * @param ItemRdfUpdatedEvent $event
     */
    public static function catchItemRdfUpdatedEvent(ItemRdfUpdatedEvent $event)
    {
        $rdfItem = new core_kernel_classes_Resource($event->getItemUri());
        $type = $rdfItem->getProperty(taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL);
        /*@var $directory \oat\oatbox\filesystem\Directory */
        $directory = taoItems_models_classes_ItemsService::singleton()->getItemDirectory($rdfItem);
        $itemModel = $rdfItem->getPropertyValues($type);
        if ($directory->exists() && in_array(taoItems_models_classes_itemModel::CLASS_URI_QTI, $itemModel)) {
            /* @var $file File */
            $file = $directory->getFile(Service::QTI_ITEM_FILE);

            $qtiParser = new Parser($file->read());
            $qtiItem = $qtiParser->load();
            $label = mb_substr($rdfItem->getLabel(), 0, 256, 'UTF-8');
            $qtiItem->setAttribute('label', $label);
            $file->put($qtiItem->toXML());
        }
    }
}
