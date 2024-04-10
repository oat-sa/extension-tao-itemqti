<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\qti\metaMetadata\Exporter;
use oat\taoQtiItem\model\qti\metaMetadata\Importer;
use oat\taoQtiItem\model\qti\metaMetadata\MetaMetadataService;

/**

 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202404081126511103_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add metametadata service for QTI items.';
    }

    public function up(Schema $schema): void
    {
        $options = [
            MetaMetadataService::IMPORTER_KEY => new Importer(),
            MetaMetadataService::EXPORTER_KEY => new Exporter()
        ];
        $metaMetadataService = $this->getServiceLocator()->build(MetaMetadataService::class, $options);


        $this->registerService(MetaMetadataService::SERVICE_ID, $metaMetadataService);

    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(MetaMetadataService::SERVICE_ID);
    }
}
