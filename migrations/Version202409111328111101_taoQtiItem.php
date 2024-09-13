<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoItems\model\event\ItemUpdatedEvent;
use oat\taoQtiItem\model\Translation\Listener\ItemUpdatedEventListener;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202409111328111101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add new listener to populate translation properties';
    }

    public function up(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
        $eventManager->attach(
            ItemUpdatedEvent::class,
            [ItemUpdatedEventListener::class, 'populateTranslationProperties']
        );
    }

    public function down(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
        $eventManager->detach(
            ItemUpdatedEvent::class,
            [ItemUpdatedEventListener::class, 'populateTranslationProperties']
        );
    }
}
