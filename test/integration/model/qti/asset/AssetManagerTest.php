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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\test\integration\model\qti\asset;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\qti\asset\AssetManager;
use oat\taoQtiItem\model\qti\asset\AssetManagerException;
use oat\taoQtiItem\model\qti\asset\handler\LocalAssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\SharedStimulusAssetHandler;
use oat\taoQtiItem\model\qti\Resource as QtiResource;

class AssetManagerTest extends TaoPhpUnitTestRunner
{
    /**
     * @var AssetManager
     */
    protected $instance;

    public function setUp(): void
    {
        $this->instance = new AssetManager();
    }

    public function tearDown(): void
    {
        $this->instance = null;
    }

    /**
     * @dataProvider loadAssetHandlerProvider
     */
    public function testLoadAssetHandler($itemSource, $expected, $exception = false)
    {
        if ($exception) {
            $this->expectException($exception);
        }

        $this->assertInstanceOf(AssetManager::class, $this->instance->loadAssetHandler($itemSource));


        if (!$exception) {
            $reflectionClass = new \ReflectionClass(AssetManager::class);
            $reflectionProperty = $reflectionClass->getProperty('assetHandlers');
            $reflectionProperty->setAccessible(true);
            $assetHandlers = $reflectionProperty->getValue($this->instance);
            $this->assertInstanceOf($expected, reset($assetHandlers));
        }
    }

    public function loadAssetHandlerProvider()
    {
        return [
            [new SharedStimulusAssetHandler(), SharedStimulusAssetHandler::class],
            [new \stdClass(), null, AssetManagerException::class],
            [
                new LocalAssetHandler(new LocalItemSource(['item' => 'itemFixture', 'lang' => 'langFixture'])),
                LocalAssetHandler::class,
            ],
        ];
    }

    public function testGetSetSource()
    {
        $sourceFixture = 'sourceFixture';
        $this->expectException(AssetManagerException::class);
        $this->instance->getSource();
        $this->assertInstanceOf(AssetManager::class, $this->instance->setSource($sourceFixture));
        $this->assertEquals($sourceFixture, $this->instance->getSource());
    }

    public function testGetSetItemContent()
    {
        $itemContentFixture = 'itemContentFixture';
        $this->assertInstanceOf(AssetManager::class, $this->instance->setItemContent($itemContentFixture));
        $this->assertEquals($itemContentFixture, $this->instance->getItemContent());
    }

    /**
     * @dataProvider getAbsolutePathProvider
     */
    public function testGetAbsolutePath($source, $pathFixture, $expected, $exception)
    {
        if ($source) {
            $this->instance->setSource($source);
        }

        if ($exception) {
            $this->expectException($exception);
        }

        $reflectionClass = new \ReflectionClass(AssetManager::class);
        $reflectionMethod = $reflectionClass->getMethod('getAbsolutePath');
        $reflectionMethod->setAccessible(true);

        if ($exception) {
            $reflectionMethod->invoke($this->instance, $pathFixture);
        } else {
            $this->assertEquals($expected, $reflectionMethod->invoke($this->instance, $pathFixture));
        }
    }

    public function getAbsolutePathProvider()
    {
        return [
            [
                'root/',
                'polop/polop/polop',
                'root/' . 'polop' . DIRECTORY_SEPARATOR . 'polop' . DIRECTORY_SEPARATOR . 'polop',
                false,
            ],
            ['root/', 'polop', 'root/' . 'polop', false],
            [false, 'pathFixture', null, AssetManagerException::class],
        ];
    }

    /**
     * @dataProvider getRelativePathProvider
     */
    public function testGetRelativePath($path1, $path2, $expected)
    {
        $reflectionClass = new \ReflectionClass(AssetManager::class);
        $reflectionMethod = $reflectionClass->getMethod('getRelativePath');
        $reflectionMethod->setAccessible(true);
        $expected = str_replace(DIRECTORY_SEPARATOR, '/', $expected);
        $this->assertEquals($expected, $reflectionMethod->invokeArgs($this->instance, [$path1, $path2]));
    }

    public function getRelativePathProvider()
    {
        $ds = DIRECTORY_SEPARATOR;
        return [
            [
                "{$ds}path{$ds}to{$ds}absolute{$ds}path",
                "{$ds}path{$ds}to{$ds}absolute{$ds}path{$ds}in{$ds}package{$ds}polop.txt",
                'path' . $ds . 'in' . $ds . 'package' . $ds . 'polop.txt',
            ],
            [
                "{$ds}path{$ds}to{$ds}absolute{$ds}path",
                "{$ds}path{$ds}to{$ds}in{$ds}package{$ds}polop.txt",
                '..' . $ds . 'in' . $ds . 'package' . $ds . 'polop.txt',
            ],
        ];
    }

    /**
     * @dataProvider importAuxiliaryFilesProvider
     */
    public function testImportAuxiliaryFiles($source, $qtiFile, $auxiliaryFilesFixtures, $expectedCalls)
    {
        $assetManagerMock = $this->getMockBuilder(AssetManager::class)
            ->setMethods(['importAsset'])
            ->getMock();

        $qtiResourceMock = $this->getMockBuilder(QtiResource::class)
            ->disableOriginalConstructor()
            ->setMethods(['getAuxiliaryFiles', 'getFile'])
            ->getMock();

        if (!$source) {
            $this->expectException(AssetManagerException::class);
        } else {
            $assetManagerMock
                ->expects($this->exactly(count($auxiliaryFilesFixtures)))
                ->method('importAsset')
                ->withConsecutive($expectedCalls);

            $qtiResourceMock
                ->expects($this->once())
                ->method('getFile')
                ->willReturn($qtiFile);

            $qtiResourceMock
                ->expects($this->once())
                ->method('getAuxiliaryFiles')
                ->willReturn($auxiliaryFilesFixtures);

            $assetManagerMock->setSource($source);
        }
        $this->assertInstanceOf(AssetManager::class, $assetManagerMock->importAuxiliaryFiles($qtiResourceMock));
    }

    public function importAuxiliaryFilesProvider()
    {
        return [
            [
                __DIR__  . '/../samples/auxiliaryFiles/',
                'qti/file/fixture.txt',
                ['qti/file/path1', 'qti/file/path2', 'qti/file/path3'],
                [__DIR__  . '/../samples/auxiliaryFiles/qti/file/path1', 'path1'],
                [__DIR__  . '/../samples/auxiliaryFiles/qti/file/path2', 'path2'],
                [__DIR__  . '/../samples/auxiliaryFiles/qti/file/path3', 'path3'],
            ],
            [
                null, null, null, null
            ]
        ];
    }

    /**
     * @dataProvider importDependencyFilesProvider
     */
    public function testImportDependencyFiles(
        $source,
        $qtiFile,
        $fileFixtures,
        $expectedCalls,
        $dependencies,
        $expectedImportCallCount
    ) {
        $assetManagerMock = $this->getMockBuilder(AssetManager::class)
            ->setMethods(['importAsset'])
            ->getMock();

        $qtiResourceMock = $this->getMockBuilder(QtiResource::class)
            ->disableOriginalConstructor()
            ->setMethods(['getDependencies', 'getFile'])
            ->getMock();

        if (!$source) {
            $this->expectException(AssetManagerException::class);
        } else {
            $assetManagerMock
                ->expects($this->exactly($expectedImportCallCount))
                ->method('importAsset')
                ->withConsecutive($expectedCalls);

            $qtiResourceMock
                ->expects($this->once())
                ->method('getFile')
                ->willReturn($qtiFile);

            $qtiResourceMock
                ->expects($this->once())
                ->method('getDependencies')
                ->willReturn($fileFixtures);

            $assetManagerMock->setSource($source);
        }
        $this->assertInstanceOf(
            AssetManager::class,
            $assetManagerMock->importDependencyFiles($qtiResourceMock, $dependencies)
        );
    }

    public function importDependencyFilesProvider()
    {
        $mock = $this->getMockBuilder(QtiResource::class)
            ->disableOriginalConstructor()
            ->setMethods(['getFile'])
            ->getMock();
        $mock
            ->expects($this->any())
            ->method('getFile')
            ->willReturn('path4');

        return [
            [
                '/source/fixture/',
                'qti/file/fixture.txt',
                ['path1', 'path2', 'path3'],
                # [
                #     [$this->equalTo('/source/fixture/path1'), $this->equalTo('../../path1')]
                # ],
                ['/source/fixture/path4', '../../path4'],
                ['path1' => $mock, 'path3' => $mock], 2
            ],
            [
                null, null, null, null, null, 0
            ]
        ];
    }

    /**
     * @dataProvider importAssetProvider
     */
    public function testImportAsset($assetHandlers, $absPath, $relPath, $exception = null, $uri = null)
    {
        $reflectionClass = new \ReflectionClass(AssetManager::class);

        $reflectionProperty = $reflectionClass->getProperty('assetHandlers');
        $reflectionProperty->setAccessible(true);
        $reflectionProperty->setValue($this->instance, $assetHandlers);

        $reflectionClass = new \ReflectionClass(AssetManager::class);
        $reflectionMethod = $reflectionClass->getMethod('importAsset');
        $reflectionMethod->setAccessible(true);

        if ($exception) {
            $this->expectException($exception);
        }

        if ($uri) {
            $this->instance->setItemContent($relPath . '/polop.txt');
        }

        $reflectionMethod->invokeArgs($this->instance, [$absPath, $relPath]);

        if ($uri) {
            $this->assertEquals($uri . '/polop.txt', $this->instance->getItemContent());
        }
    }

    public function importAssetProvider()
    {
        return [
            [
                [
                    $this->getAssetHandler('fail', 'failure/path'),
                    $this->getAssetHandler('fail', 'failure/path')
                ],
                'other/path', 'failure/path', AssetManagerException::class
            ],
            [
                [
                    $this->getAssetHandler('fail', 'success/path'),
                    $this->getAssetHandler('success', 'success/path', 'other/path')
                ],
                'other/path', 'success/path'
            ],
            [
                [
                    $this->getAssetHandler('fail', 'success/path'),
                    $this->getAssetHandler('success', 'success/path', 'other/path', 'polop/way'),
                    $this->getAssetHandler('never')
                ],
                'other/path', 'success/path', null, 'polop/way'
            ]
        ];
    }

    protected function getAssetHandler(
        $type = 'success',
        $relPath = 'pathFixture',
        $absPath = 'pathFixture',
        $uri = 'polop'
    ) {
        $mock = $this->getMockBuilder(LocalAssetHandler::class)
            ->setMethods(['isApplicable', 'handle'])
            ->getMock();

        if ($type == 'success') {
            $mock->expects($this->once())
                ->method('isApplicable')
                ->with($relPath)
                ->will($this->returnValue(true));

            $mock->expects($this->once())
                ->method('handle')
                ->with($absPath, $relPath)
                ->will($this->returnValue(['uri' => $uri]));
        }

        if ($type == 'fail') {
            $mock->expects($this->once())
                ->method('isApplicable')
                ->with($relPath)
                ->will($this->returnValue(false));

            $mock->expects($this->never())
                ->method('handle');
        }

        if ($type == 'never') {
            $mock->expects($this->never())
                ->method('isApplicable');

            $mock->expects($this->never())
                ->method('handle');
        }

        return $mock;
    }
}
