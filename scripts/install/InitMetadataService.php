<?php

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\action\Action;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class InitMetadataService implements Action, ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    public function __invoke($params)
    {
        $metadataService = new MetadataService([
            MetadataService::IMPORTER_KEY => [
                MetadataImporter::INJECTOR_KEY     => [],
                MetadataImporter::EXTRACTOR_KEY    => [],
                MetadataImporter::GUARDIAN_KEY     => [],
                MetadataImporter::CLASS_LOOKUP_KEY => [],
            ],
            MetadataService::EXPORTER_KEY => [
                MetadataExporter::INJECTOR_KEY     => [],
                MetadataExporter::EXTRACTOR_KEY    => [],
            ]
        ]);
        $this->getServiceLocator()->register(MetadataService::SERVICE_ID, $metadataService);
    }

}