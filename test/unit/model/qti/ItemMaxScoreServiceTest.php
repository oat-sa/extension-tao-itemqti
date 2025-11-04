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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\qti\ItemMaxScoreService;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\OutcomeDeclaration;

/**
 * Unit tests for ItemMaxScoreService
 *
 * Tests the bulk retrieval of MAXSCORE values from QTI items
 */
class ItemMaxScoreServiceTest extends TestCase
{
    /**
     * @var ItemMaxScoreService
     */
    private $service;

    /**
     * @var Service|\PHPUnit\Framework\MockObject\MockObject
     */
    private $qtiServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->qtiServiceMock = $this->createMock(Service::class);

        $slMock = $this->getServiceLocatorMock([
            Service::class => $this->qtiServiceMock
        ]);

        $this->service = new ItemMaxScoreService();
        $this->service->setServiceLocator($slMock);
    }

    /**
     * Test retrieving MAXSCORE for a single item
     */
    public function testGetSingleItemMaxScore(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#item1';

        $maxScoreOutcome = $this->createMockOutcome('MAXSCORE', '10.0');

        $qtiItem = $this->createMockQtiItem([$maxScoreOutcome]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturn($qtiItem);

        $result = $this->service->getItemsMaxScores([$itemUri]);

        $this->assertArrayHasKey($itemUri, $result);
        $this->assertEquals(10.0, $result[$itemUri]);
    }

    /**
     * Test retrieving MAXSCORE for multiple items
     */
    public function testGetMultipleItemsMaxScores(): void
    {
        $item1Uri = 'http://tao.dev/ontology.rdf#item1';
        $item2Uri = 'http://tao.dev/ontology.rdf#item2';
        $item3Uri = 'http://tao.dev/ontology.rdf#item3';

        $outcome1 = $this->createMockOutcome('MAXSCORE', '10.0');
        $outcome2 = $this->createMockOutcome('MAXSCORE', '5.5');
        $outcome3 = $this->createMockOutcome('MAXSCORE', '8.0');

        $qtiItem1 = $this->createMockQtiItem([$outcome1]);
        $qtiItem2 = $this->createMockQtiItem([$outcome2]);
        $qtiItem3 = $this->createMockQtiItem([$outcome3]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturnCallback(function ($resource) use ($qtiItem1, $qtiItem2, $qtiItem3) {
                $uri = $resource->getUri();
                if ($uri === 'http://tao.dev/ontology.rdf#item1') {
                    return $qtiItem1;
                } elseif ($uri === 'http://tao.dev/ontology.rdf#item2') {
                    return $qtiItem2;
                } else {
                    return $qtiItem3;
                }
            });

        $result = $this->service->getItemsMaxScores([$item1Uri, $item2Uri, $item3Uri]);

        $this->assertCount(3, $result);
        $this->assertEquals(10.0, $result[$item1Uri]);
        $this->assertEquals(5.5, $result[$item2Uri]);
        $this->assertEquals(8.0, $result[$item3Uri]);
    }

    /**
     * Test handling of item with missing MAXSCORE
     */
    public function testMissingMaxScore(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#itemNoMax';

        $scoreOutcome = $this->createMockOutcome('SCORE', '0');
        $qtiItem = $this->createMockQtiItem([$scoreOutcome]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturn($qtiItem);

        $result = $this->service->getItemsMaxScores([$itemUri]);

        $this->assertEquals(0.0, $result[$itemUri]);
    }

    /**
     * Test handling of item with empty MAXSCORE value
     */
    public function testEmptyMaxScoreValue(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#itemEmptyMax';

        $maxScoreOutcome = $this->createMockOutcome('MAXSCORE', '');
        $qtiItem = $this->createMockQtiItem([$maxScoreOutcome]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturn($qtiItem);

        $result = $this->service->getItemsMaxScores([$itemUri]);

        $this->assertEquals(0.0, $result[$itemUri]);
    }

    /**
     * Test handling of item with null MAXSCORE value
     */
    public function testNullMaxScoreValue(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#itemNullMax';

        $maxScoreOutcome = $this->createMockOutcome('MAXSCORE', null);
        $qtiItem = $this->createMockQtiItem([$maxScoreOutcome]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturn($qtiItem);

        $result = $this->service->getItemsMaxScores([$itemUri]);

        $this->assertEquals(0.0, $result[$itemUri]);
    }

    /**
     * Test handling of parsing errors
     */
    public function testItemParsingError(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#itemError';

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willThrowException(new \Exception('Parse error'));

        $result = $this->service->getItemsMaxScores([$itemUri]);

        $this->assertEquals(0.0, $result[$itemUri]);
    }

    /**
     * Test handling of item with fractional MAXSCORE
     */
    public function testFractionalMaxScore(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#itemFraction';

        $maxScoreOutcome = $this->createMockOutcome('MAXSCORE', '3.14159');
        $qtiItem = $this->createMockQtiItem([$maxScoreOutcome]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturn($qtiItem);

        $result = $this->service->getItemsMaxScores([$itemUri]);

        $this->assertEquals(3.14159, $result[$itemUri]);
    }

    /**
     * Test single item retrieval method
     */
    public function testGetItemMaxScoreSingleItem(): void
    {
        $itemUri = 'http://tao.dev/ontology.rdf#item1';

        $maxScoreOutcome = $this->createMockOutcome('MAXSCORE', '15.0');
        $qtiItem = $this->createMockQtiItem([$maxScoreOutcome]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturn($qtiItem);

        $result = $this->service->getItemMaxScore($itemUri);

        $this->assertEquals(15.0, $result);
    }

    /**
     * Test empty array input
     */
    public function testEmptyArrayInput(): void
    {
        $result = $this->service->getItemsMaxScores([]);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    /**
     * Test validation: empty string URI should throw InvalidArgumentException
     */
    public function testEmptyUriThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid item URI provided');

        $this->service->getItemMaxScore('');
    }

    /**
     * Test validation: malformed URI should throw InvalidArgumentException
     */
    public function testMalformedUriThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid item URI provided');

        $this->service->getItemMaxScore('not-a-valid-uri');
    }

    /**
     * Test validation: URI without fragment should throw InvalidArgumentException
     */
    public function testUriWithoutFragmentThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid item URI provided');

        $this->service->getItemMaxScore('http://tao.dev/ontology.rdf');
    }

    /**
     * Test validation: plain string should throw InvalidArgumentException
     */
    public function testPlainStringThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid item URI provided');

        $this->service->getItemMaxScore('item123');
    }

    /**
     * Test validation: whitespace-only string should throw InvalidArgumentException
     */
    public function testWhitespaceOnlyUriThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid item URI provided');

        $this->service->getItemMaxScore('   ');
    }

    /**
     * Test that getItemsMaxScores handles invalid URIs gracefully by returning 0.0
     */
    public function testGetItemsMaxScoresWithInvalidUri(): void
    {
        $result = $this->service->getItemsMaxScores(['not-a-valid-uri']);

        $this->assertArrayHasKey('not-a-valid-uri', $result);
        $this->assertEquals(0.0, $result['not-a-valid-uri']);
    }

    /**
     * Test that getItemsMaxScores filters out non-string values
     */
    public function testGetItemsMaxScoresFiltersNonStrings(): void
    {
        $mixedArray = [
            'http://tao.dev/ontology.rdf#item1',
            123,
            null,
            ['nested'],
            'http://tao.dev/ontology.rdf#item2',
        ];

        $maxScoreOutcome1 = $this->createMockOutcome('MAXSCORE', '10.0');
        $maxScoreOutcome2 = $this->createMockOutcome('MAXSCORE', '5.0');
        $qtiItem1 = $this->createMockQtiItem([$maxScoreOutcome1]);
        $qtiItem2 = $this->createMockQtiItem([$maxScoreOutcome2]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturnCallback(function ($resource) use ($qtiItem1, $qtiItem2) {
                $uri = $resource->getUri();
                if ($uri === 'http://tao.dev/ontology.rdf#item1') {
                    return $qtiItem1;
                }
                return $qtiItem2;
            });

        $result = $this->service->getItemsMaxScores($mixedArray);

        // Should only process the two valid string URIs
        $this->assertCount(2, $result);
        $this->assertArrayHasKey('http://tao.dev/ontology.rdf#item1', $result);
        $this->assertArrayHasKey('http://tao.dev/ontology.rdf#item2', $result);
        $this->assertEquals(10.0, $result['http://tao.dev/ontology.rdf#item1']);
        $this->assertEquals(5.0, $result['http://tao.dev/ontology.rdf#item2']);
    }

    /**
     * Test that getItemsMaxScores handles mixed valid and invalid URIs
     */
    public function testGetItemsMaxScoresWithMixedValidAndInvalidUris(): void
    {
        $itemUris = [
            'http://tao.dev/ontology.rdf#item1',
            'invalid-uri',
            'http://tao.dev/ontology.rdf#item2',
        ];

        $maxScoreOutcome1 = $this->createMockOutcome('MAXSCORE', '10.0');
        $maxScoreOutcome2 = $this->createMockOutcome('MAXSCORE', '5.0');
        $qtiItem1 = $this->createMockQtiItem([$maxScoreOutcome1]);
        $qtiItem2 = $this->createMockQtiItem([$maxScoreOutcome2]);

        $this->qtiServiceMock->method('getDataItemByRdfItem')
            ->willReturnCallback(function ($resource) use ($qtiItem1, $qtiItem2) {
                $uri = $resource->getUri();
                if ($uri === 'http://tao.dev/ontology.rdf#item1') {
                    return $qtiItem1;
                }
                return $qtiItem2;
            });

        $result = $this->service->getItemsMaxScores($itemUris);

        $this->assertCount(3, $result);
        $this->assertEquals(10.0, $result['http://tao.dev/ontology.rdf#item1']);
        $this->assertEquals(0.0, $result['invalid-uri']); // Invalid URI returns 0.0
        $this->assertEquals(5.0, $result['http://tao.dev/ontology.rdf#item2']);
    }

    /**
     * Helper method to create a mock OutcomeDeclaration
     *
     * @param string $identifier
     * @param string|null $defaultValue
     * @return OutcomeDeclaration|\PHPUnit\Framework\MockObject\MockObject
     */
    private function createMockOutcome(string $identifier, ?string $defaultValue)
    {
        $outcome = $this->createMock(OutcomeDeclaration::class);
        $outcome->method('getIdentifier')->willReturn($identifier);
        $outcome->method('getDefaultValue')->willReturn($defaultValue);

        return $outcome;
    }

    /**
     * Helper method to create a mock QTI Item
     *
     * @param array $outcomes
     * @return Item|\PHPUnit\Framework\MockObject\MockObject
     */
    private function createMockQtiItem(array $outcomes)
    {
        $item = $this->createMock(Item::class);
        $item->method('getOutcomes')->willReturn($outcomes);

        return $item;
    }
}
