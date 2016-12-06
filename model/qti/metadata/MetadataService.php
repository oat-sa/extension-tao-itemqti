<?php

namespace oat\taoQtiItem\model\qti\metadata;

use oat\oatbox\service\ConfigurableService;

class MetadataService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiItem/metadataService';

    const IMPORTER_KEY  = 'import';
    const EXPORTER_KEY  = 'export';

    const INJECTOR_KEY  = 'injectors';
    const EXTRACTOR_KEY = 'extractors';

    public function getImporter()
    {
        return $this->getSubService(self::IMPORTER_KEY);
    }

    public function getExporter()
    {
        return $this->getSubService(self::EXPORTER_KEY);
    }

//    public function registerImporter(MetadataImporter $importer)
//    {
//        $importerOptions = array_merge($this->getOption(self::IMPORTER_KEY)->getOptions(), $importer->getOptions());
//    }
}