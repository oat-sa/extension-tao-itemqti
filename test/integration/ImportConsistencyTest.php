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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\test\integration;

use common_report_Report;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\ImportService;
use taoItems_models_classes_ItemsService;

// phpcs:disable PSR1.Files.SideEffects
include_once dirname(__FILE__) . '/../../includes/raw_start.php';
// phpcs:enable PSR1.Files.SideEffects

/**
 * test the item imported into TAO does not suffer modification
 *
 */
class ImportConsistencyTest extends TaoPhpUnitTestRunner
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
     * tests initialization
     * load qti service
     */
    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
        $this->importService = ImportService::singleton();
        $this->itemService = taoItems_models_classes_ItemsService::singleton();
        $this->qtiService = \oat\taoQtiItem\model\qti\Service::singleton();
    }

    /**
     * @return string
     */
    protected function getSamplePath($relPath)
    {
        return __DIR__ . DIRECTORY_SEPARATOR . 'samples' . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
    }

    public function testImportResponseEncoding()
    {
        $importQtiFilePath = $this->getSamplePath('/xml/qtiv2p1/textentry_response_special_chars.xml');
        $itemClass = $this->itemService->getRootClass();
        $report = $this->importService->importQTIFile($importQtiFilePath, $itemClass);

        $this->assertEquals(\common_report_Report::TYPE_SUCCESS, $report->getType());
        $item = $report->getData();
        $this->assertNotEmpty($item);
        $itemXml = $this->qtiService->getXmlByRdfItem($item, DEFAULT_LANG);

        $this->assertXmlStringEqualsXmlString(
            $this->normalizeXml(file_get_contents($importQtiFilePath)),
            $this->normalizeXml($itemXml)
        );

        $this->itemService->deleteResource($item);
    }

    /**
     * Normalize the xml string for comparison
     * @param $xml
     * @return string
     */
    protected function normalizeXml($xml)
    {
        $xml = preg_replace('/toolVersion="[0-9a-zA-Z-\.]+"/', '', $xml);

        //work around DOMNode C14N error : "Relative namespace UR is invalid here"
        $xml = str_replace('xmlns:html5="html5"', 'xmlns:html5="http://www.imsglobal.org/xsd/html5"', $xml);

        //replace media url by a fixed uri
        $xml = preg_replace('/taomedia:\/\/mediamanager\/([a-zA-Z0-9_]+)/', 'taomedia://mediamanager/ASSET_URI', $xml);

        return $xml;
    }
}
