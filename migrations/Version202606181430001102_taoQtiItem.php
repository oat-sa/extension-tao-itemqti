<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\scripts\install\RegisterNpmPaths;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202606181430001102_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update @oat-sa/tao-qti-item 0.4.1: sync mathquill IME composition handling for QTI Creator';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new RegisterNpmPaths()
            )(['0.4.1'])
        );
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterNpmPaths::class
        );
    }
}
