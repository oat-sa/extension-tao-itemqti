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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */
namespace oat\taoQtiItem\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\tao\model\media\MediaAsset;
use oat\taoMediaManager\model\MediaSource;
use oat\taoQtiItem\model\qti\Parser;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\XIncludeLoader;
use oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction;

/**
 *
 * @author Sam, <sam@taotesting.com>
 * @package taoQtiItem
 
 */
class XIncludeLoaderTest extends TaoPhpUnitTestRunner
{
    
    
    /**
     * tests initialization
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
    }
    
    public function testLoadxincludeInBody(){
        
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/xinclude/associate_include.xml';
        $href1 = 'stimulus.xml';
        $file1 = dirname(__FILE__).'/samples/xml/qtiv2p1/xinclude/stimulus.xml';
        
        $mediaSource1 = $this->prophesize('oat\taoMediaManager\model\MediaSource');
        $mediaSource1->download($href1)->willReturn($file1);
        $asset1 = $this->prophesize('oat\tao\model\media\MediaAsset');
        $asset1->getMediaSource()->willReturn($mediaSource1->reveal());
        $asset1->getMediaIdentifier()->willReturn($href1);
        $asset1Revealed = $asset1->reveal();
        
        $resolver = $this->prophesize('oat\taoItems\model\media\ItemMediaResolver');
        $resolver->resolve($href1)->willReturn($asset1Revealed);
        
        $this->assertEquals($asset1Revealed->getMediaSource()->download($asset1Revealed->getMediaIdentifier()), $file1);
        
        $qtiParser = new Parser($file);
        $item = $qtiParser->load();
        $this->assertTrue($item instanceof Item);
        
        $xincludeLoader = new XIncludeLoader($item, $resolver->reveal());
        $xincludes = $xincludeLoader->load();
        
        $this->assertEquals(count($xincludes), 1);
    }
    
    public function testLoadxincludeInPci(){
        
        $file = dirname(__FILE__).'/samples/xml/qtiv2p1/xinclude/pci_include.xml';
        $href1 = 'stimulus.xml';
        $file1 = dirname(__FILE__).'/samples/xml/qtiv2p1/xinclude/stimulus.xml';
        
        $mediaSource1 = $this->prophesize('oat\taoMediaManager\model\MediaSource');
        $mediaSource1->download($href1)->willReturn($file1);
        $asset1 = $this->prophesize('oat\tao\model\media\MediaAsset');
        $asset1->getMediaSource()->willReturn($mediaSource1->reveal());
        $asset1->getMediaIdentifier()->willReturn($href1);
        $asset1Revealed = $asset1->reveal();
        
        $resolver = $this->prophesize('oat\taoItems\model\media\ItemMediaResolver');
        $resolver->resolve($href1)->willReturn($asset1Revealed);
        
        $qtiParser = new Parser($file);
        $item = $qtiParser->load();
        $this->assertTrue($item instanceof Item);
        
        $xincludeLoader = new XIncludeLoader($item, $resolver->reveal());
        $xincludes = $xincludeLoader->load();
        
        $this->assertEquals(count($xincludes), 1);
        
        $pci = null;
        foreach($item->getComposingElements() as $element){
            if($element instanceof PortableCustomInteraction){
                $pci = $element;
                break;
            }
        }
        $this->assertNotNull($pci);
//        var_dump($pci->getMarkup());
    }
}