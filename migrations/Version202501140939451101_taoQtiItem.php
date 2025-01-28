<?php

declare(strict_types=1);

namespace oat\taoQtiItem\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiItem\model\ItemModel;
use oat\taoQtiItem\model\Export\Qti3Package\Handler as Qti3PackageExportHandler;

final class Version202501140939451101_taoQtiItem extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Qti3PackageExportHandler to ItemModel service configuration';
    }

    public function up(Schema $schema): void
    {
        $itemModel = $this->getServiceManager()->get(ItemModel::SERVICE_ID);
        $handlers = $itemModel->getOption(ItemModel::EXPORT_HANDLER);

        $hasHandler = false;
        foreach ($handlers as $handler) {
            if ($handler instanceof Qti3PackageExportHandler) {
                $hasHandler = true;
                break;
            }
        }

        if (!$hasHandler) {
            $handlers[] = new Qti3PackageExportHandler();
            $itemModel->setOption(ItemModel::EXPORT_HANDLER, $handlers);
            $this->getServiceManager()->register(ItemModel::SERVICE_ID, $itemModel);
        }
    }

    public function down(Schema $schema): void
    {
        $itemModel = $this->getServiceManager()->get(ItemModel::SERVICE_ID);
        $handlers = $itemModel->getOption(ItemModel::EXPORT_HANDLER);

        $filteredHandlers = array_filter($handlers, function($handler) {
            return !($handler instanceof Qti3PackageExportHandler);
        });

        $itemModel->setOption(ItemModel::EXPORT_HANDLER, $filteredHandlers);
        $this->getServiceManager()->register(ItemModel::SERVICE_ID, $itemModel);
    }
}
