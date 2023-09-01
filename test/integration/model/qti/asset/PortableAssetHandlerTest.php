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

namespace oat\taoQtiItem\test\integration\model\qti\asset;

use oat\taoQtiItem\model\portableElement\parser\itemParser\PortableElementItemParser;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\asset\handler\PortableAssetHandler;
use oat\taoQtiItem\model\qti\Item;

class PortableAssetHandlerTest extends TaoPhpUnitTestRunner
{
    /**
     * @return PortableAssetHandler
     */
    public function getPortableAssetHandler($item)
    {
        return new PortableAssetHandler($item, '', '');
    }

    public function testConstruct()
    {
        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $this->assertInstanceOf(
            PortableElementItemParser::class,
            $reflectionProperty->getValue($this->getPortableAssetHandler(new Item()))
        );
    }

    /**
     * @dataProvider isApplicableProvider
     */
    public function testIsApplicable($isPciFixture, $isPciFileFixture, $expected)
    {
        $relPathFixture = 'polop/polop/fixture.txt';

        $mock = $this->getMockBuilder(PortableElementItemParser::class)
            ->setMethods(['isPortableElementAsset','hasPortableElement'])
            ->getMock();

        $mock->expects($this->any())
            ->method('isPortableElementAsset')
            ->with($relPathFixture)
            ->willReturn($isPciFileFixture);

        $mock->expects($this->once())
            ->method('hasPortableElement')
            ->willReturn($isPciFixture);

        $instance = $this->getPortableAssetHandler(new Item());
        $this->setInaccessibleProperty($instance, 'portableItemParser', $mock);
        $this->assertEquals($expected, $instance->isApplicable($relPathFixture));
    }

    public function isApplicableProvider()
    {
        return [
            [true, false, false],
            [false, false, false],
            [false, true, false],
            [true, true, true],
        ];
    }

    public function testHandle()
    {
        $absolutePath = 'fixture1';
        $relativePath = 'fixture2';

        $mock = $this->getMockBuilder(PortableElementItemParser::class)
            ->setMethods(['importPortableElementFile'])
            ->getMock();

        $mock->expects($this->once())
            ->method('importPortableElementFile')
            ->with($absolutePath, $relativePath);

        $instance = $this->getPortableAssetHandler(new Item());
        $this->setInaccessibleProperty($instance, 'portableItemParser', $mock);

        $instance->handle($absolutePath, $relativePath);
    }
}
