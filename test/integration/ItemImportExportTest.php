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

namespace oat\taoQtiItem\test\integration;

use common_exception_Error;
use common_report_Report;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\Export\QTIPackedItemExporter;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\QtiItemCompiler;
use taoItems_models_classes_ItemsService;
use tao_models_classes_service_FileStorage;
use ZipArchive;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\ItemModel;
use DOMDocument;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

/**
 * test the item content access
 *
 */
class ItemImportExportTest extends TaoPhpUnitTestRunner
{
    /**
     * @var ImportService
     */
    protected $importService;
    /**
     * @var taoItems_models_classes_ItemsService
     */
    protected $itemService;
    /**
     * @var array
     */
    protected $exportedZips = [];

    /**
     * tests initialization
     * load qti service
     */
    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
        $this->importService = ImportService::singleton();
        $this->itemService = taoItems_models_classes_ItemsService::singleton();
    }

    /**
     * @return string
     */
    protected function getSamplePath($relPath)
    {
        return __DIR__ . DIRECTORY_SEPARATOR . 'samples' . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
    }

    public function testWrongPackage()
    {
        $this->expectException(ParsingException::class);
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/wrong/InvalidArchive.zip'),
            $itemClass
        );
    }

    public function testWrongClass()
    {
        $this->expectException(common_exception_Error::class);
        $itemClass = new \core_kernel_classes_Class(taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL);
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/wrong/package.zip'),
            $itemClass
        );
    }

    /**
     *
     */
    public function testWrongFormatClass()
    {
        $itemClass = $this->itemService->getRootClass();

        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/wrong/MalformedItemXml.zip'),
            $itemClass,
            true,
            true
        );
        $this->assertEquals(\common_report_Report::TYPE_ERROR, $report->getType());
    }


    /**
     *
     */
    public function testWrongFormatXmlClass()
    {
        $itemClass = $this->itemService->getRootClass();

        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/wrong/MalformedItemInTheMiddleXml.zip'),
            $itemClass,
            true,
            false,
            true
        );
        $this->assertEquals(\common_report_Report::TYPE_WARNING, $report->getType());
    }

    /**
     *
     */
    public function testWrongManifest()
    {
        $itemClass = $this->itemService->getRootClass();


        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/wrong/MalformedManifest.zip'),
            $itemClass,
            true,
            true
        );
        $this->assertEquals(\common_report_Report::TYPE_ERROR, $report->getType());
    }
    /**
     *
     */
    public function testWrongXml()
    {

        $itemClass = $this->itemService->getRootClass();

        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/wrong/WrongManifestFileItemHref.zip'),
            $itemClass,
            true,
            true
        );
        $this->assertEquals(\common_report_Report::TYPE_ERROR, $report->getType());
    }


    public function testImportQti20()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/QTI/qti20.zip'),
            $itemClass
        );
        $this->assertEquals(\common_report_Report::TYPE_SUCCESS, $report->getType());

        $items = $this->getItemsByReport($report);
        $this->assertEquals(2, count($items));
        $this->removeItem($items[1]);

        return $items[0];
    }

    public function testImportApipv1p0Final()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/APIP/apip_v1p0_final.zip'),
            $itemClass
        );
        $this->assertEquals(\common_report_Report::TYPE_SUCCESS, $report->getType());

        $items = $this->getItemsByReport($report);
        $this->assertCount(1, $items);
        $this->removeItem($items[0]);
    }

    public function testImportPCI()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/PCI/pcisample.zip'),
            $itemClass
        );
        $this->assertEquals(\common_report_Report::TYPE_SUCCESS, $report->getType());

        $items = $this->getItemsByReport($report);
        $this->assertEquals(1, count($items));
        $item = \oat\taoQtiItem\model\qti\Service::singleton()->getDataItemByRdfItem($items[0], DEFAULT_LANG, false);

        $itemData = $item->toArray();
        $itemDataElemetns = current($itemData['body']['elements']);

        //ensure that path prefixed with interaction identifies was not changed;
        $this->assertEquals(
            $itemDataElemetns['entryPoint'],
            "adaptiveChoiceInteraction/runtime/adaptiveChoiceInteraction.js"
        );
        //ensure that interaction properties imported properly
        $this->assertTrue(isset($itemDataElemetns['properties']['choices'][0]['label']));

        foreach ($items as $item) {
            $this->itemService->deleteItem($item);
        }
    }

    public function testImport()
    {
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/QTI/package.zip'),
            $itemClass
        );

        $items = $this->getItemsByReport($report);
        $this->assertEquals(1, count($items));

        $item = current($items);
        $this->assertInstanceOf('\core_kernel_classes_Resource', $item);
        $this->assertTrue($item->exists());

        $resourceManager = new LocalItemSource(
            [ 'item' => $item,
                'lang' => DEFAULT_LANG]
        );
        $data = $resourceManager->getDirectory();
        $this->assertTrue(is_array($data));
        $this->assertTrue(isset($data['path']));
        $this->assertEquals('/', $data['path']);

        $this->assertTrue(isset($data['children']));
        $children = $data['children'];
        $this->assertEquals(3, count($children));

        $check = ['/images/','/style/'];

        $file = null;
        $dir = null;
        foreach ($children as $child) {
            if (isset($child['path'])) {
                $this->assertContains($child['path'], $check);
            }
            if (isset($child['name'])) {
                $file = $child;
            }
        }

        $this->assertEquals("qti.xml", $file['name']);
        $this->assertStringContainsString("/xml", $file['mime']);
        $this->assertTrue($file['size'] > 0);


        return $item;
    }

    /**
     * @depends testImport
     * @param $item
     */
    public function testCompile($item)
    {
        $storage = tao_models_classes_service_FileStorage::singleton();
        $compiler = new QtiItemCompiler($item, $storage);
        $compiler->setServiceLocator($this->getServiceManagerProphecy());
        $report = $compiler->compile();
        $this->assertEquals($report->getType(), common_report_Report::TYPE_SUCCESS);
        $serviceCall = $report->getData();
        $this->assertNotNull($serviceCall);
        $this->assertInstanceOf('\tao_models_classes_service_ServiceCall', $serviceCall);
    }

    /**
     * @depends testImport
     * @param $item
     * @throws Exception
     * @throws \oat\taoQtiItem\model\qti\exception\ExtractException
     * @throws \oat\taoQtiItem\model\qti\exception\ParsingException
     * @return mixed
     */
    public function testExport($item)
    {
        $itemClass = $this->itemService->getRootClass();

        list($path, $manifest) = $this->createZipArchive($item);

        $report = $this->importService->importQTIPACKFile($path, $itemClass);
        $this->assertEquals(\common_report_Report::TYPE_SUCCESS, $report->getType());
        $items = $this->getItemsByReport($report);
        $this->assertEquals(1, count($items));
        $item2 = current($items);
        $this->assertInstanceOf('\core_kernel_classes_Resource', $item);
        $this->assertTrue($item->exists());

        $this->assertEquals($item->getLabel(), $item2->getLabel());

        $this->removeItem($item2);

        return $manifest;
    }

    /**
     * @depends testImportQti20
     * @depends testExport
     * @param $item
     * @param $manifest
     * @return mixed
     */
    public function testExportWithManifest($item, $manifest)
    {
        list($path, $manifest2) = $this->createZipArchive($item, $manifest);
        $this->assertSame($manifest, $manifest2);
    }

    /**
     * @depends testImportQti20
     * @depends testImport
     */
    public function testRemoveItem()
    {
        foreach (func_get_args() as $item) {
            $this->removeItem($item);
        }
    }

    public function testExportTestWithAmpersandInTheTitleOfAsset()
    {
        list($items, $manifest) = $this->importPackageWithAmpersandInTheTitleOfAsset();
        $item = $items[0];

        $path = $this->createZipArchive($item, $manifest)[0];

        $zipArchive = new ZipArchive();
        $zipArchive->open($path);

        $folderToExtract = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid('test_with_ampersand');
        $zipArchive->extractTo($folderToExtract);

        $qtiFile = glob($folderToExtract . DIRECTORY_SEPARATOR . '*' . DIRECTORY_SEPARATOR . 'qti.xml')[0];
        $xml2 = file_get_contents($qtiFile);

        $xml = Service::singleton()->getXmlByRdfItem($item);

        $this->assertEquals($xml2, $xml);
        $this->removeItem($item);
    }

    private function importPackageWithAmpersandInTheTitleOfAsset()
    {
        $itemClass = $this->itemService->getRootClass();

        $report = $this->importService->importQTIPACKFile(
            $this->getSamplePath('/package/QTI/package_with_ampersand.zip'),
            $itemClass
        );

        $zipArchive = new ZipArchive();
        $zipArchive->open($this->getSamplePath('/package/QTI/package_with_ampersand.zip'));

        $folderToExtract = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid('test_with_ampersand');
        $zipArchive->extractTo($folderToExtract);

        $manifestPath = glob($folderToExtract . DIRECTORY_SEPARATOR . 'imsmanifest.xml')[0];
        $manifestContent = file_get_contents($manifestPath);

        $manifest = new DOMDocument('1.0', 'UTF-8');
        $manifest->loadXML($manifestContent);

        return [$this->getItemsByReport($report), $manifest];
    }

    private function getItemsByReport($report)
    {
        $items = [];
        foreach ($report as $itemReport) {
            $this->assertEquals(\common_report_Report::TYPE_SUCCESS, $itemReport->getType());
            $data = $itemReport->getData();
            if (!is_null($data)) {
                $items[] = $data;
            }
        }

        return $items;
    }

    private function removeItem($item)
    {
        $this->itemService->deleteItem($item);
        $this->assertFalse($item->exists());
    }

    public function tearDown(): void
    {
        foreach ($this->exportedZips as $path) {
            if (file_exists($path)) {
                $this->assertTrue(unlink($path));
            }
        }
    }

    /**
     * @param $item
     * @param $manifest
     * @return array
     * @throws \Exception
     */
    private function createZipArchive($item, $manifest = null)
    {
        $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . uniqid('test_') . '.zip';
        $zipArchive = new ZipArchive();
        if ($zipArchive->open($path, ZipArchive::CREATE) !== true) {
            throw new \Exception('Unable to create archive at ' . $path);
        }

        if ($this->itemService->hasItemModel($item, [ItemModel::MODEL_URI])) {
            $exporter = new QTIPackedItemExporter($item, $zipArchive, $manifest);
            $exporter->export();
            $manifest = $exporter->getManifest();
        }

        $this->assertTrue($this->itemService->hasItemModel($item, [ItemModel::MODEL_URI]));

        $this->assertNotNull($manifest);

        $this->assertEquals(ZipArchive::ER_OK, $zipArchive->status, $zipArchive->getStatusString());

        $zipArchive->close();
        $this->assertTrue(file_exists($path), 'could not find path ' . $path);
        $this->exportedZips[] = $path;
        return [$path, $manifest];
    }
}
