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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\scripts\install;

use oat\oatbox\action\Action;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\GenericLomManifestClassificationExtractor;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\taoQtiItem\model\qti\metadata\ontology\GenericLomOntologyClassificationExtractor;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use oat\taoQtiItem\model\qti\metadata\ontology\LomInjector as OntologyLomInjector;
use oat\taoQtiItem\model\qti\metadata\imsManifest\LomInjector as ImsManifestLomInjector;

/**
 * Class InitMetadataService
 *
 * @package oat\taoQtiItem\scripts\install
 */
class InitMetadataService implements Action, ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * Register metadataService
     *
     * Check if taoQtiItem/metadata_registry config exists
     * If yes, get content of the config
     * Create metadataService with oldConfig or default config & register it
     * Delete old metadataRegistry if exists
     *
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        $importerConfig = [];

        if (
            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->hasConfig('metadata_registry')
        ) {
            $oldConfig = \common_ext_ExtensionsManager::singleton()
                ->getExtensionById('taoQtiItem')
                ->getConfig('metadata_registry');

            foreach ($oldConfig as $key => $value) {
                if (is_array($value)) {
                    $importerConfig[$key] = array_unique($value, SORT_STRING);
                }
            }
        } else {
            $importerConfig = [
                MetadataImporter::INJECTOR_KEY     => [OntologyLomInjector::class],
                MetadataImporter::EXTRACTOR_KEY    => [GenericLomManifestClassificationExtractor::class],
                MetadataImporter::GUARDIAN_KEY     => [],
                MetadataImporter::CLASS_LOOKUP_KEY => [],
            ];
        }

        $options = [
            MetadataService::IMPORTER_KEY => new MetadataImporter(
                $importerConfig
            ),
            MetadataService::EXPORTER_KEY => new MetadataExporter([
                MetadataExporter::INJECTOR_KEY     => [ImsManifestLomInjector::class],
                MetadataExporter::EXTRACTOR_KEY    => [GenericLomOntologyClassificationExtractor::class],
            ])
        ];
        $metadataService = $this->getServiceLocator()->build(MetadataService::class, $options);
        $this->getServiceLocator()->register(MetadataService::SERVICE_ID, $metadataService);

        if (
            \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem')->hasConfig('metadata_registry')
        ) {
            \common_ext_ExtensionsManager::singleton()
                ->getExtensionById('taoQtiItem')
                ->unsetConfig('metadata_registry');
        }

        return \common_report_Report::createSuccess(__('Metadata service successfully registered.'));
    }
}
