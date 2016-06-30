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

namespace oat\taoQtiItem\test\model\qti\asset;

use oat\qtiItemPci\model\common\parser\PortableElementItemParser;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\asset\handler\PortableAssetHandler;
use oat\taoQtiItem\model\qti\Item;

class PortableAssetHandlerTest extends TaoPhpUnitTestRunner
{
    /**
     * @var PortableAssetHandler
     */
    protected $instance;

    public function setUp()
    {
        $this->instance = new PortableAssetHandler();
    }

    public function tearDown()
    {
        $this->instance = null;
    }

    public function testConstruct()
    {
        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $this->assertInstanceOf(PortableElementItemParser::class, $reflectionProperty->getValue($this->instance));
    }

    /**
     * @dataProvider isApplicableProvider
     */
    public function testIsApplicable($isPciFixture, $isPciFileFixture, $expected)
    {
        $relPathFixture = 'polop/polop/fixture.txt';

        $mock = $this->getMockBuilder(PortableElementItemParser::class)
            ->setMethods(array('isPci', 'isPciAsset'))
            ->getMock();

        $mock->expects($this->once())
            ->method('isPci')
            ->willReturn($isPciFixture);

        $mock->expects($this->any())
            ->method('isPciAsset')
            ->with($relPathFixture)
            ->willReturn($isPciFileFixture);

        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $reflectionProperty->setValue($this->instance, $mock);

        $this->instance->setQtiModel(new Item());
        $this->assertEquals($expected, $this->instance->isApplicable($relPathFixture));
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
        $modelFixture = 'polopModel';

        $mock = $this->getMockBuilder(PortableElementItemParser::class)
            ->setMethods(array('setQtiModel', 'importPciFile'))
            ->getMock();

        $mock->expects($this->once())
            ->method('setQtiModel')
            ->with($modelFixture);

        $mock->expects($this->once())
            ->method('importPciFile')
            ->with($absolutePath, $relativePath);

        $reflectionClass = new \ReflectionClass(PortableAssetHandler::class);
        $reflectionProperty = $reflectionClass->getProperty('portableItemParser');
        $reflectionProperty->setAccessible(true);
        $reflectionProperty->setValue($this->instance, $mock);

        $this->instance->setQtiModel($modelFixture);
        $this->instance->handle($absolutePath, $relativePath);
    }

    public function testSetGetQtiModel()
    {
        $fixture = 'polop';
        $this->assertInstanceOf(PortableAssetHandler::class, $this->instance->setQtiModel($fixture));
        $this->assertEquals($fixture, $this->instance->getQtiModel());
    }
}