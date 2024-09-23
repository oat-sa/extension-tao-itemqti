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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti\metadata\ontology;

use core_kernel_classes_Resource as Resource;
use core_kernel_classes_Triple as Triple;
use core_kernel_classes_Property as Property;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationEntryMetadataValue;
use oat\taoQtiItem\model\qti\metadata\imsManifest\classificationMetadata\ClassificationMetadataValue;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiItem\model\qti\metadata\ontology\LabelBasedLomOntologyClassificationExtractor;
use PHPUnit\Framework\TestCase;

class LabelBasedLomOntologyClassificationExtractorTest extends TestCase
{
    private LabelBasedLomOntologyClassificationExtractor $subject;

    public function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->subject = new LabelBasedLomOntologyClassificationExtractor();
        $this->subject->setModel($this->ontologyMock);
    }

    public function testExtract(): void
    {
        $resourceMock = $this->createMock(Resource::class);
        $resourceMock->method('getUri')->willReturn('uri#identifier');

        //Should be exported
        $rdfTripleUri = $this->createMock(Triple::class);
        $rdfTripleUri->object = 'ResourceUri';

        //Should be iported
        $rdfTriple0 = $this->createMock(Triple::class);
        $rdfTriple0->object = '0';

        //Should be ignored
        $rdfTripleNull = $this->createMock(Triple::class);
        $rdfTripleNull->object = null;

        $propertyMock = $this->createMock(Property::class);

        $resourceMock
            ->method('getRdfTriples')
            ->willReturn([
                $rdfTripleUri,
                $rdfTriple0,
                $rdfTripleNull
            ]);
        $this->ontologyMock
            ->method('getProperty')
            ->willReturn($propertyMock);

        $this->ontologyMock
            ->method('getResource')
            ->willReturn($resourceMock);

        $resourceMock
            ->method('getLabel')
            ->willReturn('resource label');

        $resourceMock->method('exists')->willReturn(true);

        $propertyMock
            ->method('isProperty')
            ->willReturn(true);

        $propertyMock
            ->method('getUri')
            ->willReturn('uri');


        $result = $this->subject->extract($resourceMock);
        self::assertIsArray($result);
        self::assertArrayHasKey('identifier', $result);
        self::assertEquals(2, count($result['identifier']));
        foreach ($result['identifier'] as $classificationMetadataValue) {
            self::assertInstanceOf(ClassificationMetadataValue::class, $classificationMetadataValue);
            self::assertEquals(5, count($classificationMetadataValue->getPath()));
            self::assertEquals('uri', $classificationMetadataValue->getValue());
            self::assertIsArray($classificationMetadataValue->getEntries());
            $entry = $classificationMetadataValue->getEntries();
            self::assertInstanceOf(
                ClassificationEntryMetadataValue::class,
                reset($entry)
            );
        }
    }

    public function testExtractWithNonResource()
    {
        $this->expectException(MetadataExtractionException::class);
        $this->subject->extract('non_resource');
    }
}
