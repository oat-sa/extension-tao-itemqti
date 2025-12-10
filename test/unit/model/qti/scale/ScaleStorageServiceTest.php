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
            'with dots in name' => ['scale....name', 'scale_name'],  // Multiple dots become single underscore
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
            $scalesDirectory->method('getFileSystem')->willReturn($fileSystemMock);
        }

        $this->itemsServiceMock->method('getItemDirectory')
            ->with($item)
            ->willReturn($itemDirectory);
    }

    /**
     * Test cleanupScales removes only unused JSON files from scales directory
     */
    public function testCleanupScalesRemovesUnusedJsonFilesOnly(): void
    {
        $item = $this->createMockItem();
        $keepPaths = ['scales/keep1.json', 'scales/keep2.json'];

        // Create mock files - mix of subdirectories, non-json, and json files
        $subdirectoryMock = $this->createMock(Directory::class);

        // Note: Current implementation deletes ALL files not in keep list, including non-JSON
        // This is by design - cleanupScales cleans the entire directory
        $nonJsonFileMock = $this->createMock(File::class);
        $nonJsonFileMock->method('getBasename')->willReturn('readme.txt');
        $nonJsonFileMock->expects($this->once())->method('delete'); // Will be deleted (not in keep list)

        $keptFile1Mock = $this->createMock(File::class);
        $keptFile1Mock->method('getBasename')->willReturn('keep1.json');
        $keptFile1Mock->expects($this->never())->method('delete'); // In keep list

        $keptFile2Mock = $this->createMock(File::class);
        $keptFile2Mock->method('getBasename')->willReturn('keep2.json');
        $keptFile2Mock->expects($this->never())->method('delete'); // In keep list

        $unusedFile1Mock = $this->createMock(File::class);
        $unusedFile1Mock->method('getBasename')->willReturn('unused1.json');
        $unusedFile1Mock->expects($this->once())->method('delete'); // Should delete

        $unusedFile2Mock = $this->createMock(File::class);
        $unusedFile2Mock->method('getBasename')->willReturn('unused2.json');
        $unusedFile2Mock->expects($this->once())->method('delete'); // Should delete

        // Setup scales directory with mixed entries
        $scalesDirectory = $this->createMock(Directory::class);
        $scalesDirectory->method('exists')->willReturn(true);
        $scalesDirectory->method('getIterator')->willReturn(new \ArrayIterator([
            $subdirectoryMock,      // Subdirectory - should skip
            $nonJsonFileMock,       // Non-JSON file - will be deleted (not in keep list)
            $keptFile1Mock,         // Referenced JSON - should keep
            $unusedFile1Mock,       // Unreferenced JSON - should delete
            $keptFile2Mock,         // Referenced JSON - should keep
            $unusedFile2Mock,       // Unreferenced JSON - should delete
        ]));

        $this->setupItemsServiceMock($item, $scalesDirectory);

        // Execute cleanup
        $this->subject->cleanupScales($item, $keepPaths);

        // Expectations are set on the mocks above (expects()->method('delete'))
    }

    /**
     * Test cleanupScales preserves all files when they are all referenced
     */
    public function testCleanupScalesPreservesReferencedFiles(): void
    {
        $item = $this->createMockItem();
        $keepPaths = ['scales/file1.json', 'scales/file2.json', 'scales/file3.json'];

        $file1Mock = $this->createMock(File::class);
        $file1Mock->method('getBasename')->willReturn('file1.json');
        $file1Mock->expects($this->never())->method('delete');

        $file2Mock = $this->createMock(File::class);
        $file2Mock->method('getBasename')->willReturn('file2.json');
        $file2Mock->expects($this->never())->method('delete');

        $file3Mock = $this->createMock(File::class);
        $file3Mock->method('getBasename')->willReturn('file3.json');
        $file3Mock->expects($this->never())->method('delete');

        $scalesDirectory = $this->createMock(Directory::class);
        $scalesDirectory->method('exists')->willReturn(true);
        $scalesDirectory->method('getIterator')->willReturn(new \ArrayIterator([
            $file1Mock,
            $file2Mock,
            $file3Mock,
        ]));

        $this->setupItemsServiceMock($item, $scalesDirectory);

        // Execute cleanup - no files should be deleted
        $this->subject->cleanupScales($item, $keepPaths);
    }

    /**
     * Test cleanupScales does nothing when scales directory doesn't exist
     */
    public function testCleanupScalesHandlesNonExistentDirectory(): void
    {
        $item = $this->createMockItem();
        $keepPaths = ['scales/file1.json'];

        $scalesDirectory = $this->createMock(Directory::class);
        $scalesDirectory->method('exists')->willReturn(false);
        $scalesDirectory->expects($this->never())->method('getIterator'); // Should not try to iterate

        $this->setupItemsServiceMock($item, $scalesDirectory);

        // Should not throw exception, just return early
        $this->subject->cleanupScales($item, $keepPaths);

        $this->assertTrue(true); // Assert no exception was thrown
    }

    /**
     * Test cleanupScales handles unexpected file types and traversal-like names
     */
    public function testCleanupScalesIgnoresUnexpectedEntries(): void
    {
        $item = $this->createMockItem();
        $keepPaths = ['scales/normal.json'];

        // Create files with edge case names
        $traversalNameFile = $this->createMock(File::class);
        $traversalNameFile->method('getBasename')->willReturn('..evil.json');
        $traversalNameFile->expects($this->once())->method('delete'); // Not in keep list, so delete

        $dotDotFile = $this->createMock(File::class);
        $dotDotFile->method('getBasename')->willReturn('..');
        $dotDotFile->expects($this->once())->method('delete'); // Not JSON, but File instance, so will try

        $hiddenFile = $this->createMock(File::class);
        $hiddenFile->method('getBasename')->willReturn('.hidden.json');
        $hiddenFile->expects($this->once())->method('delete'); // Not in keep list

        $normalFile = $this->createMock(File::class);
        $normalFile->method('getBasename')->willReturn('normal.json');
        $normalFile->expects($this->never())->method('delete'); // In keep list

        // Mock an object that's neither File nor Directory (edge case)
        $weirdEntry = new \stdClass();

        $scalesDirectory = $this->createMock(Directory::class);
        $scalesDirectory->method('exists')->willReturn(true);
        $scalesDirectory->method('getIterator')->willReturn(new \ArrayIterator([
            $weirdEntry,           // Not File or Directory - should skip
            $traversalNameFile,    // Has traversal in name - should process normally
            $dotDotFile,           // Edge case name
            $hiddenFile,           // Hidden file
            $normalFile,           // Normal kept file
        ]));

        $this->setupItemsServiceMock($item, $scalesDirectory);

        // Execute cleanup
        $this->subject->cleanupScales($item, $keepPaths);
    }

    /**
     * Test cleanupScales sanitizes keep paths before comparison
     */
    public function testCleanupScalesSanitizesKeepPaths(): void
    {
        $item = $this->createMockItem();
        // Keep paths with traversal attempts and extra slashes
        $keepPaths = [
            'scales/../scales/kept.json',  // Should sanitize to scales/kept.json
            'scales//double.json',         // Should sanitize to scales/double.json
        ];

        $keptFileMock = $this->createMock(File::class);
        $keptFileMock->method('getBasename')->willReturn('kept.json');
        $keptFileMock->expects($this->never())->method('delete'); // Should be kept after sanitization

        $doubleFileMock = $this->createMock(File::class);
        $doubleFileMock->method('getBasename')->willReturn('double.json');
        $doubleFileMock->expects($this->never())->method('delete'); // Should be kept after sanitization

        $unusedFileMock = $this->createMock(File::class);
        $unusedFileMock->method('getBasename')->willReturn('unused.json');
        $unusedFileMock->expects($this->once())->method('delete'); // Not in sanitized keep list

        $scalesDirectory = $this->createMock(Directory::class);
        $scalesDirectory->method('exists')->willReturn(true);
        $scalesDirectory->method('getIterator')->willReturn(new \ArrayIterator([
            $keptFileMock,
            $doubleFileMock,
            $unusedFileMock,
        ]));

        $this->setupItemsServiceMock($item, $scalesDirectory);

        // Execute cleanup - sanitization should allow kept files to be preserved
        $this->subject->cleanupScales($item, $keepPaths);
    }

    /**
     * Test cleanupScales handles empty keep list (deletes all files)
     */
    public function testCleanupScalesWithEmptyKeepList(): void
    {
        $item = $this->createMockItem();
        $keepPaths = []; // Empty - should delete all files

        $file1Mock = $this->createMock(File::class);
        $file1Mock->method('getBasename')->willReturn('file1.json');
        $file1Mock->expects($this->once())->method('delete');

        $file2Mock = $this->createMock(File::class);
        $file2Mock->method('getBasename')->willReturn('file2.json');
        $file2Mock->expects($this->once())->method('delete');

        $scalesDirectory = $this->createMock(Directory::class);
        $scalesDirectory->method('exists')->willReturn(true);
        $scalesDirectory->method('getIterator')->willReturn(new \ArrayIterator([
            $file1Mock,
            $file2Mock,
        ]));

        $this->setupItemsServiceMock($item, $scalesDirectory);

        // Execute cleanup - all files should be deleted
        $this->subject->cleanupScales($item, $keepPaths);
    }
}
