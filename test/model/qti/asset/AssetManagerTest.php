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

namespace oat\taoQtiItem\test\model\qti\asset;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\qti\asset\AssetManager;
use oat\taoQtiItem\model\qti\asset\AssetManagerException;
use oat\taoQtiItem\model\qti\asset\handler\LocalAssetHandler;
use oat\taoQtiItem\model\qti\asset\handler\SharedStimulusAssetHandler;
use oat\taoQtiItem\model\qti\Resource as QtiResource;
use Prophecy\Argument;

class AssetManagerTest extends TaoPhpUnitTestRunner
{
    /**
     * @var AssetManager
     */
    protected $instance;

    public function setUp()
    {
        $this->instance = new AssetManager();
    }

    public function tearDown()
    {
        $this->instance = null;
    }

    /**
     * @dataProvider loadAssetHandlerProvider
     */
    public function testLoadAssetHandler($itemSource, $expected, $exception=false)
    {
        if ($exception) {
            $this->setExpectedException($exception);
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
            [new LocalAssetHandler(new LocalItemSource(array('item' => 'itemFixture', 'lang' => 'langFixture'))), LocalAssetHandler::class],
        ];
    }

    public function testGetSetSource()
    {
        $sourceFixture = 'sourceFixture';
        $this->setExpectedException(AssetManagerException::class);
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
            $this->setExpectedException($exception);
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
            ['root/', 'polop/polop/polop', 'root/' . 'polop' . DIRECTORY_SEPARATOR . 'polop' . DIRECTORY_SEPARATOR . 'polop', false],
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

        $this->assertEquals($expected, $reflectionMethod->invokeArgs($this->instance, [$path1, $path2]));
    }

    public function getRelativePathProvider()
    {
        $ds = DIRECTORY_SEPARATOR;
        return [
            ['/path/to/absolute/path', '/path/to/absolute/path/in/package/polop.txt', 'path' . $ds . 'in' . $ds . 'package' . $ds . 'polop.txt'],
            ['/path/to/absolute/path', '/path/to/in/package/polop.txt', '..' . $ds . 'in' . $ds . 'package' . $ds . 'polop.txt'],
        ];
    }

    /**
     * @dataProvider importAuxiliaryFilesProvider
     */
    public function testImportAuxiliaryFiles($source, $qtiFile, $auxiliaryFilesFixtures, $expectedCalls)
    {
        $assetManagerMock = $this->getMockBuilder(AssetManager::class)
            ->setMethods(array('importAsset'))
            ->getMock();

        $qtiResourceMock = $this->getMockBuilder(QtiResource::class)
            ->disableOriginalConstructor()
            ->setMethods(array('getAuxiliaryFiles', 'getFile'))
            ->getMock();

        if (!$source) {
            $this->setExpectedException(AssetManagerException::class);
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
                '/source/fixture/', 'qti/file/fixture.txt', ['path1', 'path2', 'path3'],
                ['/source/fixture/path1', '../../path1'], ['/source/fixture/path2', '../../path2'], ['/source/fixture/path3', '../../path3'],
            ],
            [
                null, null, null, null
            ]
        ];
    }

    /**
     * @dataProvider importDependencyFilesProvider
     */
    public function testImportDependencyFiles($source, $qtiFile, $fileFixtures, $expectedCalls, $dependencies, $expectedImportCallCount)
    {
        $assetManagerMock = $this->getMockBuilder(AssetManager::class)
            ->setMethods(array('importAsset'))
            ->getMock();

        $qtiResourceMock = $this->getMockBuilder(QtiResource::class)
            ->disableOriginalConstructor()
            ->setMethods(array('getDependencies', 'getFile'))
            ->getMock();

        if (!$source) {
            $this->setExpectedException(AssetManagerException::class);
        } else {
            $assetManagerMock
                ->expects($this->exactly($expectedImportCallCount))
                ->method('importAsset')
                ->withConsecutive($this->returnValueMap($expectedCalls));

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
        $this->assertInstanceOf(AssetManager::class, $assetManagerMock->importDependencyFiles($qtiResourceMock, $dependencies));
    }

    public function importDependencyFilesProvider()
    {
        $mock = $this->getMockBuilder(QtiResource::class)
            ->disableOriginalConstructor()
            ->setMethods(array('getFile'))
            ->getMock();
        $mock
            ->expects($this->any())
            ->method('getFile')
            ->willReturn('path4');

        return [
            [
                '/source/fixture/', 'qti/file/fixture.txt', ['path1', 'path2', 'path3'],
                [[$this->equalTo('/source/fixture/path1'), $this->equalTo('../../path1')]],//, ['/source/fixture/path2', '../../path2'], ['/source/fixture/path3', '../../path3']],
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
    public function testImportAsset($assetHandlers, $absPath, $relPath, $exception=null, $uri=null)
    {
        $reflectionClass = new \ReflectionClass(AssetManager::class);

        $reflectionProperty = $reflectionClass->getProperty('assetHandlers');
        $reflectionProperty->setAccessible(true);
        $reflectionProperty->setValue($this->instance, $assetHandlers);

        $reflectionClass = new \ReflectionClass(AssetManager::class);
        $reflectionMethod = $reflectionClass->getMethod('importAsset');
        $reflectionMethod->setAccessible(true);

        if ($exception) {
            $this->setExpectedException($exception);
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

    protected function getAssetHandler($type='success', $relPath='pathFixture', $absPath='pathFixture', $uri='polop')
    {
        $mock = $this->getMockBuilder(LocalAssetHandler::class)
            ->setMethods(array('isApplicable', 'handle'))
            ->getMock();

        if ($type == 'success') {
            $mock->expects($this->once())
                ->method('isApplicable')
                ->with($relPath)
                ->will($this->returnValue(true));

            $mock->expects($this->once())
                ->method('handle')
                ->with($absPath, $relPath)
                ->will($this->returnValue(array('uri'=> $uri)));
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