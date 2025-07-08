<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\tao\model\Lists\Business\Service\RemoteSource;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScaleRemoteListParser;
use oat\taoQtiItem\scripts\install\RegisterScaleRemoteListParser;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202505161151231102_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->runAction(new RegisterScaleRemoteListParser());
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'You cannot remove locales from configuration'
        );
    }
}
