<?php

namespace oat\taoQtiItem\model\qti\metadata;

use oat\oatbox\service\ConfigurableService;

class MetadataService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiItem/metadataService';

    const IMPORTER_KEY  = 'import';
    const EXPORTER_KEY  = 'export';

    public function getImporter()
    {
        return $this->getSubService(self::IMPORTER_KEY);
    }

    public function getExporter()
    {
        return $this->getSubService(self::EXPORTER_KEY);
    }
}