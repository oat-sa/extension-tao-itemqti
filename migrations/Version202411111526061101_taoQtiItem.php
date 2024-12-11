<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\install\scripts\RemoveLegacyGenericLomExtractor;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202411111526061101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'This will remove the legacy GenericLomExtractor';
    }

    public function up(Schema $schema): void
    {
        $this->runAction(new RemoveLegacyGenericLomExtractor());
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
