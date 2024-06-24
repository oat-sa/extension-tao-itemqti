<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\scripts\install\EnableUuidQtiIdentifier;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202406241409071101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(new EnableUuidQtiIdentifier())([])
        );
    }

    public function down(Schema $schema): void
    {
    }
}
