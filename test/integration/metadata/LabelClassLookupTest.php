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
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;

include_once dirname(__FILE__) . '/../../../includes/raw_start.php';

/**
 * Class LabelClassLookupTest
 * @package oat\taoQtiItem\test\integration\metadata
 */
class LabelClassLookupTest extends TaoPhpUnitTestRunner
{
    public function testLabelClassLookupTest()
    {
        $itemClass = \taoItems_models_classes_ItemsService::singleton()->getRootClass();

        /** @var MetadataService $test */
        $serviceLocator = ServiceManager::getServiceManager();

        $importer = new MetadataImporter();

        $importer->setOptions([
            MetadataImporter::CLASS_LOOKUP_KEY => ['oat\taoQtiItem\model\qti\metadata\classLookups\LabelClassLookup'],
            MetadataImporter::EXTRACTOR_KEY => ['oat\taoQtiItem\model\qti\metadata\imsManifest\ImsManifestMetadataExtractor'],
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

        // Create fake class.
        \core_kernel_classes_ClassFactory::createSubClass($itemClass, 'mytestclasslabel', 'mytestclasslabel', 'http://www.test.com#mytestclass');

        // Import myTestClassLabel sample...
        $samplePath = dirname(__FILE__) . '/../samples/metadata/metadataClassLookups/mytestclasslabel.zip';
        $report = $importService->importQTIPACKFile($samplePath, $itemClass, true);
        $successes = $report->getSuccesses();

        $this->assertCount(1, $successes);

        $itemResource = $successes[0]->getData();

        $class = new \core_kernel_classes_Class('http://www.test.com#mytestclass');
        $this->assertEquals(1, $class->countInstances());

        \taoItems_models_classes_ItemsService::singleton()->deleteItem($itemResource);

        // Delete fake class
        $class = new \core_kernel_classes_Class('http://www.test.com#mytestclass');
        $class->delete(true);

    }
}