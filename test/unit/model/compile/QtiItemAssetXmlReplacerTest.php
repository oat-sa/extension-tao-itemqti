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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\compile;

use DOMDocument;
use oat\generis\test\TestCase;
use oat\taoQtiItem\model\compile\QtiAssetCompiler\QtiItemAssetXmlReplacer;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;

class QtiItemAssetXmlReplacerTest extends TestCase
{
    /** @var QtiItemAssetXmlReplacer */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new QtiItemAssetXmlReplacer();
    }

    public function testReplaceAssetNodeValue()
    {
        $packedAsset = $this->createMock(PackedAsset::class);
        $packedAsset->method('getReplacedBy')
            ->willReturn('new-link-fixture_1');

        $packedAsset2 = $this->createMock(PackedAsset::class);
        $packedAsset2->method('getReplacedBy')
            ->willReturn('new-link-fixture_2');

        $packedAsset3 = $this->createMock(PackedAsset::class);
        $packedAsset3->method('getReplacedBy')
            ->willReturn('new-link-fixture_3');

        $packedAssets = [
            'fixture' => $packedAsset,
            'decoded_fixture' => $packedAsset2,
            'another-fixture' => '',
            'hrefFixture' => $packedAsset3,
        ];

        $domDocument = new DOMDocument('1.0', 'UTF-8');
        $element = $domDocument->createElement('video');
        $element->setAttribute('src', 'fixture');
        $domDocument->appendChild($element);

        $element = $domDocument->createElement('property');
        $element->appendChild($domDocument->createTextNode(htmlentities(
            '<img src="decoded_fixture" alt="type="image/png"/>'
        )));
        $domDocument->appendChild($element);

        $element = $domDocument->createElement('fileHref');
        $element->appendChild($domDocument->createTextNode('hrefFixture'));
        $domDocument->appendChild($element);


        $this->subject->replaceAssetNodeValue($domDocument, $packedAssets);

        $attributes = $domDocument->getElementsByTagName('video')->item(0)->attributes;
        $this->assertEquals('new-link-fixture_1', $attributes['src']->nodeValue);

        $propertyValue = $domDocument->getElementsByTagName('property')->item(0)->nodeValue;
        $this->assertEquals(htmlentities(
            '<img src="new-link-fixture_2" alt="type="image/png"/>'
        ), $propertyValue);

        $hrefValue = $domDocument->getElementsByTagName('fileHref')->item(0)->nodeValue;
        $this->assertEquals('new-link-fixture_3', $hrefValue);
    }

    public function testReplaceAssetNodeValues()
    {
        $packedAsset1 = $this->createMock(PackedAsset::class);
        $packedAsset1->method('getReplacedBy')
            ->willReturn('new-link-fixture-1')
        ;

        $packedAsset2 = $this->createMock(PackedAsset::class);
        $packedAsset2->method('getReplacedBy')
            ->willReturn('new-link-fixture-2')
        ;

        $packedAssets = [
            'fixture-1' => $packedAsset1,
            'fixture-2' => $packedAsset2,
            'another-fixture' => '',
        ];

        $domDocument = new DOMDocument('1.0', 'UTF-8');
        $element = $domDocument->createElement('video');
        $element->setAttribute('src', 'fixture-1');
        $domDocument->appendChild($element);

        $element = $domDocument->createElement('img');
        $element->setAttribute('do-not-care', 'fixture-2');
        $domDocument->appendChild($element);

        $this->subject->replaceAssetNodeValue($domDocument, $packedAssets);

        $attributes = $domDocument->getElementsByTagName('video')->item(0)->attributes;
        $this->assertEquals('new-link-fixture-1', $attributes['src']->nodeValue);

        $attributes = $domDocument->getElementsByTagName('img')->item(0)->attributes;
        $this->assertEquals('new-link-fixture-2', $attributes['do-not-care']->nodeValue);
    }
}
