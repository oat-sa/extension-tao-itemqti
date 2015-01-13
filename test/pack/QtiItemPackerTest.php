<?php
/*  
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */
namespace oat\taoItems\test\pack;

use \core_kernel_classes_Resource;
use oat\taoQtiItem\model\pack\QtiItemPacker;
use oat\taoItems\model\pack\Packable;
use oat\taoItems\model\pack\ItemPack;
use oat\tao\test\TaoPhpUnitTestRunner;
 

/**
 * Test the class {@link ItemPack}
 *  
 * @author Bertrand Chevrier, <taosupport@tudor.lu>
 * @package taoItems
 */
class QtiItemPackerTest extends TaoPhpUnitTestRunner
{

    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }

    /**
     * Test creating a QtiItemPacker
     */
    public function testConstructor(){
        $itemPacker = new QtiItemPacker(); 
        $this->assertInstanceOf('oat\taoItems\model\pack\Packable', $itemPacker);
    }

    /**
     * Test the exception when a wrong content type is given
     * 
     * @expectedException \InvalidArgumentException
     */
    public function testWrongContentTypeToPack(){
        
        $itemPacker = new QtiItemPacker();
        $itemPacker->packItem(new core_kernel_classes_Resource('foo'), null); 
    }
    
    /**
     * Test the exception when a wrong content is given to the parser
     * 
     * @expectedException \common_Exception
     */
    public function testWrongContentToPack(){
        
        $itemPacker = new QtiItemPacker();
        $itemPacker->packItem(new core_kernel_classes_Resource('foo'), 'toto'); 
    }
    
    /**
     * Test packing a simple item (choice.xml from the samples) that has no assets.
     */
    public function testPackingSimpleItem(){

        $sample = dirname(__FILE__).'/../samples/xml/qtiv2p1/choice.xml';
    
        $this->assertTrue(file_exists($sample));
    
        $content = file_get_contents($sample);

        $itemPacker = new QtiItemPacker();
        $itemPack = $itemPacker->packItem(new core_kernel_classes_Resource('foo'), $content); 

        $this->assertInstanceOf('oat\taoItems\model\pack\ItemPack', $itemPack);
        $this->assertEquals('qti', $itemPack->getType());

        $data = $itemPack->getData();

        $this->assertEquals('assessmentItem', $data['qtiClass']);
        $this->assertEquals('choice', $data['identifier']);

        $this->assertEquals(array(), $itemPack->getAssets('js'));
        $this->assertEquals(array(), $itemPack->getAssets('css'));
        $this->assertEquals(array(), $itemPack->getAssets('img'));
        $this->assertEquals(array(), $itemPack->getAssets('font'));
    }

    /**
     * Test packing an item where QTI content isn't valid
     * @expectedException \common_Exception
     */
    public function testPackingInvalidQtiItem(){

        $sample = dirname(__FILE__).'/../samples/wrong/notvalid_associate.xml';
    
        $this->assertTrue(file_exists($sample));
    
        $content = file_get_contents($sample);

        $itemPacker = new QtiItemPacker();
        $itemPacker->packItem(new core_kernel_classes_Resource('foo'), $content); 
    }
}
