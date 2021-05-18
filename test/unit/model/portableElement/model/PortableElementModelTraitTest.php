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
 * Copyright (c) 2013-2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\test\unit\model\portableElement\model;

use oat\generis\test\TestCase;
use oat\taoQtiItem\model\portableElement\model\PortableElementModel;
use oat\taoQtiItem\model\portableElement\model\PortableElementModelTrait;
use oat\generis\test\MockObject;

class PortableElementModelTraitTest extends TestCase
{
    /**
     * @var PortableElementModelTrait
     */
    protected $instance;

    public function setUp(): void
    {
        $this->instance = $this->getMockForTrait(PortableElementModelTrait::class);
    }

    public function tearDown(): void
    {
        $this->instance = null;
    }

    /**
     * @return PortableElementModel|MockObject
     */
    public function getPortableElementModelMock()
    {
        return $this->getMockBuilder(PortableElementModel::class)->getMock();
    }

    public function testSetGet()
    {
        $mock = $this->getPortableElementModelMock();
        $this->instance->setModel($mock);

        $this->assertEquals($mock, $this->instance->getModel());
    }

    public function testGetNoModel()
    {
        $this->assertNull($this->instance->getModel());
    }
}
