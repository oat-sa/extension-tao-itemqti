<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\tao\model\ClientLibRegistry;
use oat\tao\model\asset\AssetService;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202203312049471101_taoQtiItem extends AbstractMigration
{

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->remove('taoQtiItem/runner');
    }

    public function down(Schema $schema): void
    {
        $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
        $taoQtiItemNpmDist = $assetService->getJsBaseWww('taoQtiItem') . 'node_modules/@oat-sa/tao-item-runner-qti/dist/';
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->register('taoQtiItem/runner', $taoQtiItemNpmDist . 'runner');
    }
}
