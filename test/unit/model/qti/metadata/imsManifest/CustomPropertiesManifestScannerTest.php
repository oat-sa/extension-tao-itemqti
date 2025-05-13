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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata\imsManifest;

use DOMDocument;
use DOMNodeList;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use oat\taoQtiItem\model\qti\metadata\exporter\CustomPropertiesManifestScanner;
use PHPUnit\Framework\TestCase;

class CustomPropertiesManifestScannerTest extends TestCase
{
    public function setUp(): void
    {
        $this->subject = new CustomPropertiesManifestScanner();
    }

    public function testGetCustomPropertyByUri(): void
    {
        $dom = new DOMDocument();
        $dom->loadXML($this->readSampleFile('manifestSample.xml'));
        $this->assertInstanceOf(
            DOMNodeList::class,
            $this->subject->getCustomPropertyByUri($dom, 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1')
        );
        $this->assertEquals(
            1,
            $this->subject
                ->getCustomPropertyByUri($dom, 'http://www.tao.lu/Ontologies/TAO.rdf#CERF-A2-B1')
                ->length
        );
    }

    public function testGetCustomProperties(): void
    {
        $dom = new DOMDocument();
        $dom->loadXML($this->readSampleFile('manifestSample.xml'));

        $result = $this->subject->getCustomProperties($dom);
        $this->assertInstanceOf(
            DOMNodeList::class,
            $result
        );
        $this->assertEquals(
            1,
            $result->length
        );
    }

    private function readSampleFile($filename): string
    {
        $adapter = new LocalFilesystemAdapter(
            dirname(__FILE__, 2)
        );

        $filesystem = new Filesystem($adapter);
        return $filesystem->read('samples/' . $filename);
    }
}
