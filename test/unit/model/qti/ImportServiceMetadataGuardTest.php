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

use core_kernel_classes_Class as RdfClass;
use core_kernel_classes_Resource as RdfResource;
use oat\generis\test\ServiceManagerMockTrait;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\qti\metadata\importer\MetadataImporter;
use oat\taoQtiItem\model\qti\metadata\MetadataGuardianResource;
use oat\taoQtiItem\model\qti\Resource;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Lock\LockInterface;

/**
 * Unit tests for ImportService guard behavior with MetadataImporter.
 *
 * These tests invoke ImportService::importQtiItem() with mocked dependencies
 * and verify observable outcomes based on guard() results and $itemMustBeOverwritten flag.
 *
 * @see \oat\taoQtiItem\model\qti\ImportService::importQtiItem() lines 509-544
 */
class ImportServiceMetadataGuardTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const RESOURCE_IDENTIFIER = 'item-resource-123';

    /**
     * Test: ImportService returns INFO report when guard finds item and overwrite disabled.
     *
     * Invokes ImportService::importQtiItem() with:
     * - $enableMetadataGuardians = true
     * - $itemMustBeOverwritten = false
     * - MetadataImporter mock where guard() returns existing resource
     *
     * Verifies:
     * - setMetadataValues() is called with provided metadata
     * - guard() is called with resource identifier
     * - Report type is INFO (item already exists, not overwritten)
     * - Report data contains MetadataGuardianResource with the found item
     */
    public function testImportQtiItemReturnsInfoReportWhenGuardFindsItemAndOverwriteDisabled(): void
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

        $importService = $this->createImportServiceWithMetadataImporter($metadataImporterMock);
        $qtiResource = $this->createQtiResourceMock($resourceIdentifier);
        $itemClass = $this->createMock(RdfClass::class);

        $sharedFiles = [];
        $createdClasses = [];
        $overwrittenItems = [];

        $report = $importService->importQtiItem(
            '/tmp/test/',
            $qtiResource,
            $itemClass,
            $sharedFiles,
            [],
            $metadataValues,
            $createdClasses,
            true,
            false,
            false,
            false,
            $overwrittenItems
        );

        $this->assertSame(
            Report::TYPE_INFO,
            $report->getType(),
            'ImportService should return INFO report when guard finds existing item and overwrite is disabled'
        );

        $reportData = $report->getData();
        $this->assertInstanceOf(
            MetadataGuardianResource::class,
            $reportData,
            'Report data should contain MetadataGuardianResource'
        );
    }

    /**
     * Test: ImportService returns ERROR report when guard finds no item but itemMustExist is true.
     *
     * Invokes ImportService::importQtiItem() with:
     * - $enableMetadataGuardians = true
     * - $itemMustExist = true
     * - MetadataImporter mock where guard() returns false (item not found)
     *
     * Verifies:
     * - setMetadataValues() is called
     * - guard() is called and returns false
     * - Report type is ERROR (item must exist but was not found)
     */
    public function testImportQtiItemReturnsErrorReportWhenGuardFindsNoItemButMustExist(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;
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
            ->willReturn(false);

        $importService = $this->createImportServiceWithMetadataImporter($metadataImporterMock);
        $qtiResource = $this->createQtiResourceMock($resourceIdentifier);
        $itemClass = $this->createMock(RdfClass::class);

        $sharedFiles = [];
        $createdClasses = [];
        $overwrittenItems = [];

        $report = $importService->importQtiItem(
            '/tmp/test/',
            $qtiResource,
            $itemClass,
            $sharedFiles,
            [],
            $metadataValues,
            $createdClasses,
            true,
            false,
            true,
            false,
            $overwrittenItems
        );

        $this->assertSame(
            Report::TYPE_ERROR,
            $report->getType(),
            'ImportService should return ERROR report when guard finds no item but itemMustExist is true'
        );

        $this->assertStringContainsString(
            $resourceIdentifier,
            $report->getMessage(),
            'Error message should reference the resource identifier'
        );
    }

    /**
     * Test: ImportService calls setMetadataValues before guard when guardians enabled.
     *
     * This test verifies the correct call sequence in ImportService::importQtiItem().
     * The MetadataImporter mock tracks call order to ensure setMetadataValues()
     * is invoked before guard().
     */
    public function testImportQtiItemCallsSetMetadataValuesBeforeGuard(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;
        $existingResource = $this->createMock(RdfResource::class);
        $metadataValues = [
            $resourceIdentifier => [
                ['path' => ['lom', 'identifier'], 'value' => 'unique-id-123']
            ]
        ];

        $callOrder = [];

        /** @var MetadataImporter&MockObject $metadataImporterMock */
        $metadataImporterMock = $this->createMock(MetadataImporter::class);

        $metadataImporterMock->expects($this->once())
            ->method('setMetadataValues')
            ->with($metadataValues)
            ->willReturnCallback(function () use (&$callOrder) {
                $callOrder[] = 'setMetadataValues';
            });

        $metadataImporterMock->expects($this->once())
            ->method('guard')
            ->with($resourceIdentifier)
            ->willReturnCallback(function () use (&$callOrder, $existingResource) {
                $callOrder[] = 'guard';
                return $existingResource;
            });

        $importService = $this->createImportServiceWithMetadataImporter($metadataImporterMock);
        $qtiResource = $this->createQtiResourceMock($resourceIdentifier);
        $itemClass = $this->createMock(RdfClass::class);

        $sharedFiles = [];
        $createdClasses = [];
        $overwrittenItems = [];

        $importService->importQtiItem(
            '/tmp/test/',
            $qtiResource,
            $itemClass,
            $sharedFiles,
            [],
            $metadataValues,
            $createdClasses,
            true,
            false,
            false,
            false,
            $overwrittenItems
        );

        $this->assertSame(
            ['setMetadataValues', 'guard'],
            $callOrder,
            'ImportService must call setMetadataValues() before guard()'
        );
    }

    /**
     * Test: ImportService skips guard when metadata guardians are disabled.
     *
     * Verifies that when $enableMetadataGuardians = false, ImportService
     * does not call setMetadataValues() or guard() on MetadataImporter.
     */
    public function testImportQtiItemSkipsGuardWhenGuardiansDisabled(): void
    {
        $resourceIdentifier = self::RESOURCE_IDENTIFIER;

        /** @var MetadataImporter&MockObject $metadataImporterMock */
        $metadataImporterMock = $this->createMock(MetadataImporter::class);

        $metadataImporterMock->expects($this->never())
            ->method('setMetadataValues');

        $metadataImporterMock->expects($this->never())
            ->method('guard');

        $metadataImporterMock->method('classLookUp')->willReturn(false);

        $importService = $this->createImportServiceWithMetadataImporter($metadataImporterMock);
        $qtiResource = $this->createQtiResourceMock($resourceIdentifier);
        $itemClass = $this->createMock(RdfClass::class);

        $sharedFiles = [];
        $createdClasses = [];
        $overwrittenItems = [];

        try {
            $importService->importQtiItem(
                '/tmp/test/',
                $qtiResource,
                $itemClass,
                $sharedFiles,
                [],
                [],
                $createdClasses,
                false,
                false,
                false,
                false,
                $overwrittenItems
            );
        } catch (\PHPUnit\Framework\ExpectationFailedException $e) {
            throw $e;
        } catch (\Throwable $e) {
            // Expected - method will fail later due to missing file, but guard methods weren't called
        }

        // Mock expectations (expects never) are verified by PHPUnit after test completes
        $this->addToAssertionCount(1);
    }

    /**
     * Test: Real MetadataImporter state management.
     *
     * Uses actual MetadataImporter to verify:
     * 1. setMetadataValues() correctly stores/clears metadata
     * 2. hasMetadataValue() and guard() behave correctly based on state
     */
    public function testRealMetadataImporterStateManagement(): void
    {
        $identifier1 = 'item-1';
        $identifier2 = 'item-2';

        $metadataImporter = new MetadataImporter();

        $metadataImporter->setMetadataValues([
            $identifier1 => [['path' => ['lom', 'id'], 'value' => 'value-1']]
        ]);
        $this->assertTrue($metadataImporter->hasMetadataValue($identifier1));
        $this->assertFalse($metadataImporter->guard($identifier1));

        $metadataImporter->setMetadataValues([
            $identifier2 => [['path' => ['lom', 'id'], 'value' => 'value-2']]
        ]);
        $this->assertFalse(
            $metadataImporter->hasMetadataValue($identifier1),
            'Previous metadata should be replaced by setMetadataValues()'
        );
        $this->assertTrue($metadataImporter->hasMetadataValue($identifier2));

        $metadataImporter->setMetadataValues([]);
        $this->assertFalse(
            $metadataImporter->hasMetadataValue($identifier2),
            'Empty setMetadataValues() should clear all metadata'
        );
        $this->assertFalse($metadataImporter->guard($identifier2));
    }

    /**
     * Creates an ImportService with injected MetadataImporter mock.
     */
    private function createImportServiceWithMetadataImporter(
        MetadataImporter $metadataImporter
    ): ImportService {
        $lockMock = $this->createMock(LockInterface::class);
        $lockMock->method('acquire')->willReturn(true);
        $lockMock->method('release');

        $importService = new class ($metadataImporter, $lockMock) extends ImportService {
            private MetadataImporter $injectedMetadataImporter;
            private LockInterface $injectedLock;

            public function __construct(MetadataImporter $metadataImporter, LockInterface $lock)
            {
                $this->injectedMetadataImporter = $metadataImporter;
                $this->injectedLock = $lock;
            }

            protected function getMetadataImporter(): MetadataImporter
            {
                return $this->injectedMetadataImporter;
            }

            public function createLock($resource, $ttl = 300.0, $autoRelease = true): LockInterface
            {
                return $this->injectedLock;
            }
        };

        return $importService;
    }

    /**
     * Creates a QTI Resource mock with the given identifier.
     */
    private function createQtiResourceMock(string $identifier): Resource
    {
        $resource = $this->createMock(Resource::class);
        $resource->method('getIdentifier')->willReturn($identifier);
        $resource->method('getFile')->willReturn('item.xml');
        return $resource;
    }
}
