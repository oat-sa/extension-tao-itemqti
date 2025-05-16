<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\model\Lists\Business\Service\RemoteSource;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScaleRemoteListParser;

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
        $remoteSource = $this->getServiceManager()->get(RemoteSource::SERVICE_ID);
        $remoteSource->addParser('scale', new ScaleRemoteListParser);

        $this->getServiceManager()->register(
            RemoteSource::SERVICE_ID,
            $remoteSource
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}
