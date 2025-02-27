<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\scripts\install\RegisterCreatorConfigFactory;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202502240937111103_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register CreatorConfigFactory service';
    }

    public function up(Schema $schema): void
    {
        $this->runAction(new RegisterCreatorConfigFactory());
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(RegisterCreatorConfigFactory::class);
    }
}
