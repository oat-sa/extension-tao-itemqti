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

namespace oat\taoQtiItem\test\unit\model\qti\scale;

use core_kernel_classes_Resource;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystem;
use oat\taoQtiItem\model\qti\scale\ScaleStorageService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use taoItems_models_classes_ItemsService;

class ScaleStorageServiceTest extends TestCase
{
    private ScaleStorageService $subject;
    private taoItems_models_classes_ItemsService|MockObject $itemsServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->itemsServiceMock = $this->createMock(taoItems_models_classes_ItemsService::class);
        $this->subject = new ScaleStorageService($this->itemsServiceMock);
    }

    public function testGenerateRelativePathIncludesScalesDirectory(): void
    {
        $path = $this->subject->generateRelativePath('Score Identifier');

        $this->assertStringStartsWith('scales/', $path);
        $this->assertStringEndsWith('.json', $path);
    }

    public function testIsScalePathValidatesStructure(): void
    {
        $this->assertTrue($this->subject->isScalePath('scales/example.json'));
        $this->assertFalse($this->subject->isScalePath('scale/example.json'));
        $this->assertFalse($this->subject->isScalePath('scales/example.txt'));
    }

    /**
     * @dataProvider traversalPathProvider
     */
    public function testIsScalePathRejectsTraversalAttempts(string $maliciousPath): void
    {
        // Path traversal attempts should not be recognized as valid scale paths
        $this->assertFalse($this->subject->isScalePath($maliciousPath));
    }

    public function traversalPathProvider(): array
    {
        return [
            'repeated parent traversal' => ['scales/../../evil.json'],
            'windows separators' => ['scales\\..\\..\\evil.json'],
            'absolute path attempt' => ['/etc/passwd'],
            'null byte injection' => ["scales/evil.json\0.txt"],
        ];
    }

    /**
     * @dataProvider safePathProvider
     */
    public function testStoreScaleDataSanitizesPathsSafely(string $inputPath, string $expectedBasename): void
    {
        $item = $this->createMockItem();
        $payload = ['test' => 'data'];

        $fileMock = $this->createMock(File::class);
        $fileMock->expects($this->once())
            ->method('put')
            ->with($this->isType('string'));

        $directoryMock = $this->createMockDirectory($fileMock, $expectedBasename);
        $this->setupItemsServiceMock($item, $directoryMock);

        $result = $this->subject->storeScaleData($item, $inputPath, $payload);

        // Verify the path was sanitized and is safe
        $this->assertStringStartsWith('scales/', $result);
        $this->assertStringNotContainsString('..', $result);
        $this->assertStringNotContainsString('\\', $result);
    }

    public function safePathProvider(): array
    {
        return [
            'simple filename' => ['my_scale', 'my_scale'],
            'with dots in name' => ['scale....name', 'scale_name'],
            'with forward slashes' => ['scales/subscale/name', 'scales_subscale_name'],
        ];
    }

    private function createMockItem(): core_kernel_classes_Resource|MockObject
    {
        return $this->createMock(core_kernel_classes_Resource::class);
    }

    private function createMockDirectory(File $fileMock, string $expectedBasename): Directory|MockObject
    {
        $directoryMock = $this->createMock(Directory::class);
        $directoryMock->method('exists')->willReturn(true);
        $directoryMock->expects($this->once())
            ->method('getFile')
            ->with($this->callback(function ($filename) use ($expectedBasename) {
                $this->assertIsString($filename);
                $basename = basename($filename);

                // Verify the filename doesn't contain path traversal and is a valid JSON file
                $this->assertStringNotContainsString('..', $filename);
                $this->assertStringNotContainsString('\\', $filename);
                $this->assertStringEndsWith('.json', $basename);

                // Ensure the generated filename matches the expected base name (prefix) before the hash
                $this->assertTrue(
                    str_starts_with($basename, $expectedBasename),
                    sprintf('Expected filename to start with "%s", got "%s"', $expectedBasename, $basename)
                );

                return true;
            }))
            ->willReturn($fileMock);

        return $directoryMock;
    }

    private function setupItemsServiceMock(
        core_kernel_classes_Resource $item,
        Directory $scalesDirectory
    ): void {
        $itemDirectory = $this->createMock(Directory::class);
        $itemDirectory->method('getDirectory')
            ->with('scales')
            ->willReturn($scalesDirectory);

        $fileSystemMock = $this->createMock(FileSystem::class);

        if ($scalesDirectory instanceof MockObject) {
            $scalesDirectory->method('exists')->willReturn(true);
            $scalesDirectory->method('getFileSystem')->willReturn($fileSystemMock);
        }

        $this->itemsServiceMock->method('getItemDirectory')
            ->with($item)
            ->willReturn($itemDirectory);
    }
}
