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
use oat\taoQtiItem\model\qti\asset\handler\AssetHandler;

class AssetHandlerTest extends TaoPhpUnitTestRunner
{
    /**
     * @var AssetHandler
     */
    protected $instance;

    public function setUp()
    {
        $assetHandlerName = 'AssetHandlerFixture' . uniqid();
        eval(
            'class '.$assetHandlerName.' extends '. AssetHandler::class
            . '{'
                . 'public function __construct ($itemSource) {}'
                . 'public function handle ($absolutePath, $relativePath) {}'
            . '}'
        );

        $this->instance = new $assetHandlerName('fixtureItemSource');
    }

    public function tearDown()
    {
        $this->instance = null;
    }

    public function testSetGet()
    {
        $this->assertInstanceOf(AssetHandler::class, $this->instance->set('fixture', 'polop'));
        $this->assertEquals('polop', $this->instance->get('fixture'));
    }

    public function testSetGetParameters()
    {
        $attributesFixture = array('fixture' => 'polop', 'fixture1' => 'polop1');
        $this->assertInstanceOf(AssetHandler::class, $this->instance->setParameters($attributesFixture));
        $this->assertEquals($attributesFixture, $this->instance->getParameters());

        $this->assertEquals('polop', $this->instance->get('fixture'));
        $this->assertInstanceOf(AssetHandler::class, $this->instance->set('fixture', 'polop1'));
        $this->assertEquals('polop1', $this->instance->get('fixture'));
    }
}