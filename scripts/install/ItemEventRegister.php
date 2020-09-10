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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoItems\model\event\ItemContentClonedEvent;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoItems\model\event\ItemRdfUpdatedEvent;
use oat\taoQtiItem\model\Listener\ItemUpdater;
use oat\taoQtiItem\model\Listener\ReplaceCopiedQtiXmlIdentifierListener;
use oat\taoQtiItem\model\qti\Service;

/**
 * Description of ItemEventRegister
 *
 * @author Christophe GARCIA <christopheg@taotesting.com>
 */
class ItemEventRegister extends InstallAction
{
    public function __invoke($params)
    {
        $this->registerEvent(
            ItemRdfUpdatedEvent::class,
            [ItemUpdater::class, 'catchItemRdfUpdatedEvent']
        );
        $this->registerEvent(
            ItemCreatedEvent::class,
            [Service::class, 'catchItemCreatedEvent']
        );
        $this->registerEvent(
            ItemContentClonedEvent::class,
            [ReplaceCopiedQtiXmlIdentifierListener::class, 'catchItemCreatedFromSource']
        );
    }
}
