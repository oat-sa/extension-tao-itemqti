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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\test\integration\metadata;

use oat\oatbox\service\ServiceManager;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\metadata\guardians\LomIdentifierGuardian;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

class LomIdentifierGuardianTest extends TaoPhpUnitTestRunner
{
    public function testLomIdentifierGuardian()
    {
        // Import LomIdentifier sample.
        $itemClass = \taoItems_models_classes_ItemsService::singleton()->getRootClass();

        /** @var MetadataService $test */
        $serviceLocator = ServiceManager::getServiceManager();

        $importer = new MetadataImporter();

        $importer->setOptions([
            MetadataImporter::INJECTOR_KEY => ['oat\taoQtiItem\model\qti\metadata\ontology\LomInjector'],
            MetadataImporter::EXTRACTOR_KEY => [
                'oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMetadataExtractor',
            ],
            MetadataImporter::GUARDIAN_KEY => ['oat\taoQtiItem\model\qti\metadata\guardians\LomIdentifierGuardian'],
        ]);

        $metadataService = $this->getMockBuilder(MetadataService::class)
            ->disableOriginalConstructor()
            ->setMethods(['getImporter'])
            ->getMock();

        $metadataService->expects($this->once())
            ->method('getImporter')
            ->willReturn($importer);

        $serviceLocator->overload(MetadataService::SERVICE_ID, $metadataService);

        /** @var ImportService $importService */
        $importService = $serviceLocator->get(ImportService::SERVICE_ID);

        $this->setInaccessibleProperty($importService, 'metadataImporter', null);

        $samplePath = dirname(__FILE__) . '/../samples/metadata/metadataGuardians/lomidentifieritem.zip';
        $report = $importService->importQTIPACKFile($samplePath, $itemClass, true);
        $successes = $report->getSuccesses();

        $this->assertCount(1, $successes);

        $itemResource = $successes[0]->getData();

        $itemClass = \taoItems_models_classes_ItemsService::singleton()->getRootClass();

        $samplePath = dirname(__FILE__) . '/../samples/metadata/metadataGuardians/lomidentifieritem.zip';
        $report = $importService->importQTIPACKFile($samplePath, $itemClass, true);

        // Report must contain an information message.
        $this->assertTrue($report->contains(\common_report_Report::TYPE_INFO));
        $this->assertEquals(1, count($report->getInfos()));

        \taoItems_models_classes_ItemsService::singleton()->deleteItem($itemResource);
    }
}
