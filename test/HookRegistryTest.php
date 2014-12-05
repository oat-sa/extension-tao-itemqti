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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoQtiItem\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\HookRegistry;

/**
 *
 * @author lionel
 */
class HookRegistryTest extends TaoPhpUnitTestRunner
{
    /**
     * 
     * @author Lionel Lecaque, lionel@taotesting.com
     */
    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
    }

    /**
     *
     * @author Lionel Lecaque, lionel@taotesting.com
     */
    public function testGetInteractions()
    {
        $interactions = HookRegistry::getRegistry()->getMap();
        $this->assertEquals('oat\qtiItemPci\model\CreatorHook', $interactions['pciCreator']);
    }
    /**
     * 
     * @author Lionel Lecaque, lionel@taotesting.com
     */
    public function testGet()
    {
        $interactions = HookRegistry::getRegistry()->getMap();
        $this->assertEquals($interactions['pciCreator'],HookRegistry::getRegistry()->get('pciCreator'));
    }

    /**
     *
     * @author Lionel Lecaque, lionel@taotesting.com
     */
    public function testSet()
    {
        $customIntreactionMock = $this->getMockBuilder('oat\taoQtiItem\model\Hook')
            ->setMockClassName('FakeHook')
            ->getMock();
        
        HookRegistry::getRegistry()->set('fakeInteraction', 'FakeHook');
        $interactions = HookRegistry::getRegistry()->getMap();
        $this->assertEquals('FakeHook', $interactions['fakeInteraction']);
        
        
    }

    /**
     * @depends testSet
     * 
     * @author Lionel Lecaque, lionel@taotesting.com
     */
    public function testRemove()
    {
        $interactions = HookRegistry::getRegistry()->getMap();
        $this->assertTrue(isset($interactions['fakeInteraction']));
        HookRegistry::getRegistry()->remove('fakeInteraction');
        $interactions = HookRegistry::getRegistry()->getMap();
        $this->assertFalse(isset($interactions['fakeInteraction']));
    }
    

}

?>