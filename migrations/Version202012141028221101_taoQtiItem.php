<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\compile\QtiAssetReplacer\NullQtiItemAssetReplacer;
use oat\taoQtiItem\model\compile\QtiAssetReplacer\QtiItemAssetReplacer;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202012141028221101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register QtiItemAssetReplacer service';
    }

    public function up(Schema $schema): void
    {
        $this->getServiceLocator()->register(QtiItemAssetReplacer::SERVICE_ID, new NullQtiItemAssetReplacer());
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
    }
}
