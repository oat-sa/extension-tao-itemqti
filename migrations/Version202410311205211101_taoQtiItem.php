<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\tao\model\resources\Event\InstanceCopiedEvent;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoItems\model\event\ItemDuplicatedEvent;
use oat\taoQtiItem\model\event\ItemImported;
use oat\taoQtiItem\model\UniqueId\Listener\ItemCreationListener;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202410311205211101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);

        $eventManager->attach(
            ItemCreatedEvent::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );
        $eventManager->attach(
            ItemImported::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );
        $eventManager->attach(
            ItemDuplicatedEvent::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );
        $eventManager->attach(
            InstanceCopiedEvent::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }

    public function down(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);

        $eventManager->detach(
            ItemCreatedEvent::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );
        $eventManager->detach(
            ItemImported::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );
        $eventManager->detach(
            ItemDuplicatedEvent::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );
        $eventManager->detach(
            InstanceCopiedEvent::class,
            [ItemCreationListener::class, 'populateUniqueId']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }
}
