<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\QtiCreator\ExtendedTextInteractionConfigurationRegistry;
use oat\taoQtiItem\scripts\install\SetupQtiMetadataImportExportService;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202209281354481104_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(new SetupQtiMetadataImportExportService())([])
        );
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
