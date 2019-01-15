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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\test\unit\model\qti\asset;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\qti\asset\handler\LocalAssetHandler;

class LocalAssetHandlerTest extends TaoPhpUnitTestRunner
{
    /**
     * @dataProvider testHandleProvider
     */
    public function testHandle($absolutePath, $relativePath, $safePath)
    {
        $mock = $this->getMockBuilder(LocalItemSource::class)
            ->disableOriginalConstructor()
            ->setMethods(array('add'))
            ->getMock();

        $mock->expects($this->once())
            ->method('add')
            ->with($absolutePath, basename($absolutePath), $safePath)
            ->willReturn('infoFixture');

        $localAssetHandlerFixture = new LocalAssetHandler(new LocalItemSource(array('item' => 'itemFixture', 'lang' => 'langFixture')));
        $reflectionClass = new \ReflectionClass(LocalAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('itemSource');
        $reflectionProperty->setAccessible(true);
        $reflectionProperty->setValue($localAssetHandlerFixture, $mock);

        $this->assertEquals('infoFixture', $localAssetHandlerFixture->handle($absolutePath, $relativePath));
    }

    public function testHandleProvider()
    {
        return [
            ['absoluteFixture', '.', ''],
            ['absoluteFixture', '../polop/test.txt', 'polop/'],
            ['absoluteFixture', '../polop/path/test.txt', 'polop/path/'],
        ];
    }

    public function testGetSetItemSource()
    {
        $itemSourceFixture= new LocalItemSource(array('lang' => 'en', 'item' => 'polop'));
        $localAssetHandler = new LocalAssetHandler();
        $this->assertInstanceOf(LocalAssetHandler::class, $localAssetHandler->setItemSource($itemSourceFixture));
        $this->assertEquals($itemSourceFixture, $localAssetHandler->getItemSource());
    }
}