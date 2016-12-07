<?php

namespace oat\taoQtiItem\model\qti\metadata\exporter;

use oat\taoQtiItem\model\qti\metadata\AbstractMetadataService;
use oat\taoQtiItem\model\qti\metadata\MetadataService;

class MetadataExporter extends AbstractMetadataService
{
    protected function registerService()
    {
        $metadataService = $this->getServiceLocator()->get(MetadataService::SERVICE_ID);
        $metadataService->setOption(MetadataService::EXPORTER_KEY, $this);
        $this->getServiceManager()->register(MetadataService::SERVICE_ID, $metadataService);
    }
}