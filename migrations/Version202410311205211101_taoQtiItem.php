<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoItems\model\event\ItemCreatedEvent;
use oat\taoItems\model\event\ItemDuplicatedEvent;
use oat\taoQtiItem\model\event\ItemImported;
use oat\taoQtiItem\model\UniqueId\Listener\ItemCreatedEventListener;

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
            [ItemCreatedEventListener::class, 'generateUniqueId']
        );
        $eventManager->attach(
            ItemImported::class,
            [ItemCreatedEventListener::class, 'generateUniqueId']
        );
        $eventManager->attach(
            ItemDuplicatedEvent::class,
            [ItemCreatedEventListener::class, 'generateUniqueId']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }

    public function down(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);

        $eventManager->detach(
            ItemCreatedEvent::class,
            [ItemCreatedEventListener::class, 'generateUniqueId']
        );
        $eventManager->detach(
            ItemImported::class,
            [ItemCreatedEventListener::class, 'generateUniqueId']
        );
        $eventManager->detach(
            ItemDuplicatedEvent::class,
            [ItemCreatedEventListener::class, 'generateUniqueId']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }
}
