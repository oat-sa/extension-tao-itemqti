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
 * Copyright (c) 2015-2025 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiItem\test\integration\helpers;

use DOMDocument;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\helpers\Authoring;
use oat\taoQtiItem\model\qti\exception\QtiModelException;

/**
 * Test QTI authiring helper methods
 *
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 * @package taoQtiItem
 */
class AuthoringTest extends TaoPhpUnitTestRunner
{
    /**
     * tests initialization
     */
    public function setUp(): void
    {
        TaoPhpUnitTestRunner::initTest();
    }

    public function testSanitizeQtiXml()
    {
        $xmlStr = file_get_contents($this->getSamplePath('/authoring/sanitizeQtiXml.xml'));
        $xml = simplexml_load_string($xmlStr);

        $sanitizedXmlStr = Authoring::sanitizeQtiXml($xmlStr);

        $sanitizedXml = simplexml_load_string($sanitizedXmlStr);

        $this->assertCount(
            count($xml->xpath("//*[local-name() = 'itemBody']//*[@style]")),
            $sanitizedXml->xpath("//*[local-name() = 'itemBody']//*[@style]")
        );

        return $sanitizedXmlStr;
    }

    /**
     * @depends testSanitizeQtiXml
     */
    public function testValidateSanitizedString($xmlStr)
    {
        $dom = Authoring::loadQtiXml($xmlStr);
        self::assertInstanceOf(DOMDocument::class, $dom);
    }

    public function testSanitizeQtiXmlMultipleIds()
    {
        $xmlStr = file_get_contents($this->getSamplePath('/authoring/sanitizeQtiXmlMultipleIds.xml'));
        $xml = simplexml_load_string($xmlStr);

        $duplicate = [];
        $ids = [];
        foreach ($xml->xpath("//*[@id]") as $idElement) {
            $id = (string)$idElement['id'];
            if (!in_array($id, $ids)) {
                $ids[] = $id;
            } else {
                if (array_key_exists($id, $duplicate)) {
                    $duplicate[$id]++;
                } else {
                    $duplicate[$id] = 2;
                }
            }
        }
        $this->assertCount(3, $duplicate);
        $this->assertEquals(2, $duplicate['p001']);
        $this->assertEquals(3, $duplicate['p002']);
        $this->assertEquals(4, $duplicate['p003']);

        $sanitizedXmlStr = Authoring::sanitizeQtiXml($xmlStr);

        $sanitizedXml = simplexml_load_string($sanitizedXmlStr);

        $duplicate = [];
        $ids = [];
        foreach ($sanitizedXml->xpath("//*[@id]") as $idElement) {
            $id = (string)$idElement['id'];
            if (!in_array($id, $ids)) {
                $ids[] = $id;
            } else {
                if (array_key_exists($id, $duplicate)) {
                    $duplicate[$id]++;
                } else {
                    $duplicate[$id] = 2;
                }
            }
        }
        $this->assertCount(0, $duplicate);

        return $sanitizedXmlStr;
    }

    /**
     * @depends testSanitizeQtiXmlMultipleIds
     */
    public function testValidateSanitizedStringSingleId($xmlStr)
    {
        $dom = Authoring::loadQtiXml($xmlStr);
        self::assertInstanceOf(DOMDocument::class, $dom);
    }

    public function testLoadQtiXml()
    {
        $xmlStr = file_get_contents($this->getSamplePath('/authoring/loadQtiXml.xml'));
        $this->assertTrue(Authoring::loadQtiXml($xmlStr) instanceof DOMDocument);
    }

    public function testLoadWrongQtiXml()
    {
        $this->expectException(QtiModelException::class);
        $this->expectExceptionMessageMatches('|^Wrong QTI item output format.*|');
        $xmlStr = file_get_contents($this->getSamplePath('/authoring/loadWrongQtiXml.xml'));
        Authoring::loadQtiXml($xmlStr);
    }

    public function testValidateQtiXmlQti2p1Wrong()
    {
        $this->expectException(QtiModelException::class);
        //check if wrong files are not validated correctly
        foreach (glob($this->getSamplePath('/wrong/*.*')) as $file) {
            Authoring::validateQtiXml($file);
        }
    }

    public function testValidateQtiXmlQti2p1()
    {
        $files = array_merge(
            glob($this->getSamplePath('/xml/qtiv2p1/*.xml')),
            glob($this->getSamplePath('/xml/qtiv2p1/rubricBlock/*.xml'))
        );
        foreach ($files as $file) {
            Authoring::validateQtiXml($file);
        }
        self::assertTrue(true, 'No exceptions triggered');
    }

    public function testValidateQtiXmlQti2p0()
    {
        $files = glob($this->getSamplePath('/xml/qtiv2p0/*.xml'));
        foreach ($files as $file) {
            Authoring::validateQtiXml($file);
        }
        self::assertTrue(true, 'No exceptions triggered');
    }

    public function testFileParsingApipv1p0()
    {
        $files = glob($this->getSamplePath('/xml/apipv1p0/*.xml'));
        foreach ($files as $file) {
            Authoring::validateQtiXml($file);
        }
        self::assertTrue(true, 'No exceptions triggered');
    }

    /**
     * Get absolute path to samples dir.
     *
     * @return string
     */
    protected function getSamplePath($relPath)
    {
        return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'samples' . str_replace('/', DIRECTORY_SEPARATOR, $relPath);
    }
}
