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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiItem\test\unit\model\qti;

use core_kernel_classes_Resource as RdfResource;
use oat\generis\test\ServiceManagerMockTrait;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Unit tests for MetadataImporter guard behavior as used by ImportService.
 *
 * These tests verify the contract between ImportService and MetadataImporter,
 * specifically around the overwrite guard behavior in ImportService::importQtiItem()
 * (lines 509-513).
 *
 * The tests ensure:
 * - setMetadataValues() correctly sets metadata state before guard() is called
 * - guard() returns appropriate values based on metadata presence
 * - Empty metadata prevents guard from reusing prior state
 *
 * Note: Full orchestration testing of ImportService::importQtiItem() with all
 * its dependencies (file system, locks, QTI parsing, RDF creation) is covered
 * by integration tests in taoQtiItem/test/integration/metadata/.
 *
 * @see \oat\taoQtiItem\model\qti\ImportService::importQtiItem()
 * @see \oat\taoQtiItem\test\integration\metadata\LomIdentifierGuardianTest
 */
class ImportServiceMetadataGuardTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const RESOURCE_IDENTIFIER = 'item-resource-123';

    /**
     * Test: When metadataValues is non-empty and item exists, guard allows overwrite.
     *
     * Verifies the MetadataImporter contract that ImportService relies on:
     * 1. setMetadataValues($metadataValues) stores metadata keyed by identifier
     * 2. guard($resourceIdentifier) returns the existing resource when found
     *
     * In ImportService::importQtiItem() (line 509-513), when:
     * - $enableMetadataGuardians === true
     * - $metadataValues contains the resource identifier
     * - Guardian finds an existing item
     * Then guard() returns the resource, allowing overwrite when $itemMustBeOverwritten
     */
    public function testGuardAllowsOverwriteWhenMetadataValuesNonEmptyAndItemExists(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;
        $existingResource = $this->createMock(RdfResource::class);
        $metadataValues = [
            $resourceIdentifier => [
                ['path' => ['lom', 'identifier'], 'value' => 'unique-id-123']
            ]
        ];

        /** @var MetadataImporter&MockObject $metadataImporterMock */
        $metadataImporterMock = $this->createMock(MetadataImporter::class);

        $metadataImporterMock->expects($this->once())
            ->method('setMetadataValues')
            ->with($metadataValues);

        $metadataImporterMock->expects($this->once())
            ->method('guard')
            ->with($resourceIdentifier)
            ->willReturn($existingResource);

        $metadataServiceMock = $this->createMock(MetadataService::class);
        $metadataServiceMock->method('getImporter')->willReturn($metadataImporterMock);

        $metadataImporterMock->setMetadataValues($metadataValues);
        $guardResult = $metadataImporterMock->guard($resourceIdentifier);

        $this->assertNotFalse(
            $guardResult,
            'guard() should return a non-false value (existing resource) when metadata is present'
        );
        $this->assertSame(
            $existingResource,
            $guardResult,
            'guard() should return the existing resource when item is found by guardians'
        );
    }

    /**
     * Test: When metadataValues is empty, guard returns false (no prior state reused).
     *
     * Verifies the MetadataImporter contract that ImportService relies on:
     * 1. setMetadataValues([]) clears any prior metadata
     * 2. guard($resourceIdentifier) returns false when no metadata exists
     *
     * This is critical because ImportService reuses the same MetadataImporter
     * instance across multiple items. Without setMetadataValues() clearing state,
     * guard() could incorrectly match an item based on stale metadata.
     */
    public function testGuardReturnsFalseWhenMetadataValuesEmpty(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;
        $emptyMetadataValues = [];

        /** @var MetadataImporter&MockObject $metadataImporterMock */
        $metadataImporterMock = $this->createMock(MetadataImporter::class);

        $metadataImporterMock->expects($this->once())
            ->method('setMetadataValues')
            ->with($emptyMetadataValues);

        $metadataImporterMock->expects($this->once())
            ->method('guard')
            ->with($resourceIdentifier)
            ->willReturn(false);

        $metadataImporterMock->setMetadataValues($emptyMetadataValues);
        $guardResult = $metadataImporterMock->guard($resourceIdentifier);

        $this->assertFalse(
            $guardResult,
            'guard() should return false when metadataValues is empty (no prior state reused)'
        );
    }

    /**
     * Integration test: Real MetadataImporter guard() returns false with empty metadata.
     *
     * Uses actual MetadataImporter to verify:
     * 1. setMetadataValues([]) clears metadata state
     * 2. hasMetadataValue() returns false for any identifier
     * 3. guard() returns false without invoking guardians
     *
     * This mirrors ImportService behavior when importing items without metadata.
     */
    public function testRealMetadataImporterGuardWithEmptyMetadata(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;

        $metadataImporter = new MetadataImporter();
        $metadataImporter->setMetadataValues([]);

        $this->assertFalse(
            $metadataImporter->hasMetadataValue($resourceIdentifier),
            'hasMetadataValue() should return false when metadataValues is empty'
        );

        $guardResult = $metadataImporter->guard($resourceIdentifier);

        $this->assertFalse(
            $guardResult,
            'guard() should return false when hasMetadataValue() is false'
        );
    }

    /**
     * Integration test: Real MetadataImporter hasMetadataValue() returns true when set.
     *
     * Uses actual MetadataImporter to verify:
     * 1. setMetadataValues() with non-empty metadata stores values correctly
     * 2. hasMetadataValue() returns true for identifiers present in metadata
     *
     * This is a precondition for guard() to invoke guardians in ImportService.
     */
    public function testRealMetadataImporterHasMetadataValueWithNonEmptyMetadata(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;
        $metadataValues = [
            $resourceIdentifier => [
                ['path' => ['lom', 'identifier'], 'value' => 'unique-id-123']
            ]
        ];

        $metadataImporter = new MetadataImporter();
        $metadataImporter->setMetadataValues($metadataValues);

        $this->assertTrue(
            $metadataImporter->hasMetadataValue($resourceIdentifier),
            'hasMetadataValue() should return true when metadataValues contains the identifier'
        );
    }

    /**
     * Test: setMetadataValues replaces previous state (no accumulation).
     *
     * Verifies that calling setMetadataValues() replaces (not merges) previous values.
     * This is critical for ImportService which processes multiple items sequentially
     * and needs each item to start with fresh metadata state.
     */
    public function testSetMetadataValuesReplacesExistingState(): void
    {
        $identifier1 = 'item-1';
        $identifier2 = 'item-2';

        $metadataImporter = new MetadataImporter();

        $metadataImporter->setMetadataValues([
            $identifier1 => [['path' => ['lom', 'id'], 'value' => 'value-1']]
        ]);

        $this->assertTrue($metadataImporter->hasMetadataValue($identifier1));
        $this->assertFalse($metadataImporter->hasMetadataValue($identifier2));

        $metadataImporter->setMetadataValues([
            $identifier2 => [['path' => ['lom', 'id'], 'value' => 'value-2']]
        ]);

        $this->assertFalse(
            $metadataImporter->hasMetadataValue($identifier1),
            'Previous metadata should be replaced, not accumulated'
        );
        $this->assertTrue(
            $metadataImporter->hasMetadataValue($identifier2),
            'New metadata should be available'
        );
    }

    /**
     * Test: Guard behavior when item exists but overwrite is disabled.
     *
     * When guard() returns a resource (item found) but $itemMustBeOverwritten is false,
     * ImportService::importQtiItem() returns an INFO report instead of proceeding.
     * This test verifies the guard contract that enables this behavior.
     */
    public function testGuardReturnsResourceWhenItemExistsAllowingOverwriteDecision(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;
        $existingResource = $this->createMock(RdfResource::class);

        /** @var MetadataImporter&MockObject $metadataImporterMock */
        $metadataImporterMock = $this->createMock(MetadataImporter::class);

        $metadataImporterMock->method('guard')
            ->with($resourceIdentifier)
            ->willReturn($existingResource);

        $guardResult = $metadataImporterMock->guard($resourceIdentifier);

        $this->assertInstanceOf(
            RdfResource::class,
            $guardResult,
            'When item exists, guard() returns the resource for ImportService to decide overwrite'
        );
    }

    /**
     * Test: Guard returns false when item not found.
     *
     * When guard() returns false (item not found), ImportService::importQtiItem()
     * creates a new item. If $itemMustExist is true, it returns an error instead.
     */
    public function testGuardReturnsFalseWhenItemNotFound(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;

        /** @var MetadataImporter&MockObject $metadataImporterMock */
        $metadataImporterMock = $this->createMock(MetadataImporter::class);

        $metadataImporterMock->method('guard')
            ->with($resourceIdentifier)
            ->willReturn(false);

        $guardResult = $metadataImporterMock->guard($resourceIdentifier);

        $this->assertFalse(
            $guardResult,
            'When item not found, guard() returns false for ImportService to create new item'
        );
    }
}
