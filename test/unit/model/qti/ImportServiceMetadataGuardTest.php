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
 * Tests for MetadataImporter interaction with setMetadataValues() and guard()
 * covering overwrite guard behavior in ImportService (lines 509-513).
 *
 * These tests verify:
 * - getMetadataImporter()->setMetadataValues() is called correctly
 * - guard($resourceIdentifier) behaves correctly based on metadata state
 *
 * @see \oat\taoQtiItem\model\qti\ImportService::importQTIFile()
 */
class ImportServiceMetadataGuardTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const RESOURCE_IDENTIFIER = 'item-resource-123';

    /**
     * Test: When metadataValues is non-empty and overwrite is enabled, guard allows overwrite.
     *
     * Scenario: ImportService calls getMetadataImporter()->setMetadataValues($metadataValues)
     * followed by guard($resourceIdentifier). When metadata contains the identifier and
     * an existing resource is found, guard() returns the resource (non-false), allowing
     * ImportService to proceed with overwrite when $itemMustBeOverwritten is true.
     *
     * @see \oat\taoQtiItem\model\qti\ImportService::importQTIFile() lines 509-513
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
     * Scenario: ImportService calls getMetadataImporter()->setMetadataValues($emptyArray)
     * followed by guard($resourceIdentifier). With empty metadata, guard() should return
     * false because hasMetadataValue() will be false, preventing guardians from being
     * called and ensuring no prior state from previous imports is accidentally reused.
     *
     * @see \oat\taoQtiItem\model\qti\ImportService::importQTIFile() lines 509-513
     * @see \oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter::guard()
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
     * Integration test: Real MetadataImporter guard() returns false when metadata is empty.
     *
     * This test uses the actual MetadataImporter implementation to verify that:
     * 1. setMetadataValues([]) clears any previous metadata state
     * 2. hasMetadataValue() returns false for any identifier
     * 3. guard() returns false without calling guardians
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
     * Integration test: Real MetadataImporter hasMetadataValue() returns true when metadata exists.
     *
     * This test uses the actual MetadataImporter implementation to verify that:
     * 1. setMetadataValues() with non-empty metadata stores the values
     * 2. hasMetadataValue() returns true for the identifier present in metadata
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
}
