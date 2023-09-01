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

namespace oat\taoQtiItem\migrations;

use common_Exception;
use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoItems\model\event\ItemContentClonedEvent;
use oat\taoQtiItem\model\Listener\ReplaceCopiedQtiXmlIdentifierListener;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

final class Version202009031236051101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adding ReplaceCopiedQtiXmlIdentifier listener';
    }

    /**
     * @return EventManager|ServiceLocatorAwareInterface
     */
    private function getEventManager(): EventManager
    {
        return $this->getServiceLocator()->get(EventManager::SERVICE_ID);
    }

    /**
     * @param Schema $schema
     * @throws InvalidServiceManagerException
     * @throws common_Exception
     */
    public function up(Schema $schema): void
    {
        $eventManager = $this->getEventManager();
        $eventManager->attach(
            ItemContentClonedEvent::class,
            [ReplaceCopiedQtiXmlIdentifierListener::class, 'catchItemCreatedFromSource']
        );
        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }

    /**
     * @param Schema $schema
     * @throws common_Exception
     * @throws InvalidServiceManagerException
     */
    public function down(Schema $schema): void
    {
        $eventManager = $this->getEventManager();
        $eventManager->detach(
            ItemContentClonedEvent::class,
            [ReplaceCopiedQtiXmlIdentifierListener::class, 'catchItemCreatedFromSource']
        );
        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }
}
