<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\model\ClientLibConfigRegistry;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\QtiCreatorClientConfigRegistry;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202102051019351101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Actualize the plugins is client_lib_config_registry.conf';
    }

    public function up(Schema $schema): void
    {
        $registry = ClientLibConfigRegistry::getRegistry();

        if ($registry->isRegistered(QtiCreatorClientConfigRegistry::CREATOR)) {
            /** @var array $config */
            $config = $registry->get(QtiCreatorClientConfigRegistry::CREATOR);
            if (!empty($config['plugins'])) {
                $config['plugins'] = array_values($config['plugins']);
            }
            $registry->set(QtiCreatorClientConfigRegistry::CREATOR, $config);
        }
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
