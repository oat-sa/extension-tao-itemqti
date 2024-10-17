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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\Listener;

use common_Exception;
use core_kernel_persistence_Exception;
use oat\oatbox\service\ServiceManager;
use oat\taoItems\model\event\ItemContentClonedEvent;
use oat\taoQtiItem\model\qti\copyist\QtiXmlDataManager;
use tao_models_classes_FileNotFoundException;

/**
 * After the clone or copy operation it is possible that items identifier in the qti.xml is different from current
 * Class InheritedQtiXmlIdentifierListener
 * @package oat\taoQtiItem\model\Listener
 */
class ReplaceCopiedQtiXmlIdentifierListener
{
    /**
     * @param ItemContentClonedEvent $itemContentClonedEvent
     * @throws common_Exception
     * @throws core_kernel_persistence_Exception
     * @throws tao_models_classes_FileNotFoundException
     */
    public static function catchItemCreatedFromSource(ItemContentClonedEvent $itemContentClonedEvent): void
    {
        ServiceManager::getServiceManager()
            ->get(QtiXmlDataManager::class)
            ->replaceItemIdentifier(
                $itemContentClonedEvent->getSourceItemUri(),
                $itemContentClonedEvent->getDestinationItemUri()
            );
    }
}
