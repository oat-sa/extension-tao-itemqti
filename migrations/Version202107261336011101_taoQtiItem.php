<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;
use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\QtiCreatorClientConfigRegistry;
use common_ext_ExtensionsManager;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202107261336011101_taoQtiItem extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Add feature flag for the scrollable multi-column layout within Item Authoring';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    public function down(Schema $schema): void
    {
        $registry = QtiCreatorClientConfigRegistry::getRegistry();

        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceManager()->get(common_ext_ExtensionsManager::SERVICE_ID);
        $extension = $extensionManager->getExtensionById('taoQtiItem');
        $config = $extension->getConfig('qtiCreator');
        if ($config['scrollable-multi-column']) {
            $registry->registerPlugin('layoutEditor', 'taoQtiItem/qtiCreator/plugins/panel/layoutEditor', 'panel');
        }
    }
}
