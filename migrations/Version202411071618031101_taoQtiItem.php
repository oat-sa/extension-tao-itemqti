<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\scripts\install\RemoveLabelInjectorFromExport;

/**
 * Remove LabelBasedLomOntologyClassificationExtractor if present
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202411071618031101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove oat\taoQtiItem\model\qti\metadata\ontology\LabelBasedLomOntologyClassificationExtractor' .
            ' if present';
    }

    public function up(Schema $schema): void
    {
        $this->runAction(new RemoveLabelInjectorFromExport());
    }

    public function down(Schema $schema): void
    {
    }
}
