<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\GenericLomManifestClassificationExtractor;
use oat\taoQtiItem\model\qti\metadata\imsManifest\LomInjector;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationExtractor;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationInjector;

/**
 * This service sets up the import and export of metadata in items.
 * It's not triggered upon installation nor update, it has to be activated on application level.
 */
class SetupQtiMetadataImportExportService extends InstallAction
{
    public function __invoke($params)
    {
        /** @var MetadataImporter $importer */
        $importer = $this->getServiceLocator()->get(MetadataService::SERVICE_ID)->getImporter();
        $importer->register(MetadataImporter::EXTRACTOR_KEY, GenericLomManifestClassificationExtractor::class);
        $importer->register(MetadataImporter::INJECTOR_KEY, GenericLomOntologyClassificationInjector::class);

        /** @var MetadataExporter $exporter */
        $exporter = $this->getServiceLocator()->get(MetadataService::SERVICE_ID)->getExporter();
        $exporter->register(MetadataExporter::EXTRACTOR_KEY, GenericLomOntologyClassificationExtractor::class);
        $exporter->register(MetadataExporter::INJECTOR_KEY, LomInjector::class);

        return \common_report_Report::createSuccess('Metadata Service updated.');
    }
}
