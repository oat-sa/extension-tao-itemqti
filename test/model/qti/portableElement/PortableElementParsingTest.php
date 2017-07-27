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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */
namespace oat\taoQtiItem\test\model\qti\portableElement;

use common_ext_ExtensionsManager;
use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\model\qti\Parser;

/**
 *
 * @author Bertrand Chevrier, <taosupport@tudor.lu>
 * @package taoQTI

 */
class PortableElementParsingTest extends TaoPhpUnitTestRunner {

	/**
	 * tests initialization
	 */
	public function setUp(){
		TaoPhpUnitTestRunner::initTest();
        common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
	}

	/**
	 * test qti file parsing: validation and loading in a non-persistant context
	 */
	public function _testParsePci(){

		$files = glob(dirname(__FILE__).'/samples/**/*.xml');

		//check if samples are loaded
		foreach($files as $file){
			$qtiParser = new Parser($file);

			$qtiParser->validate();
			if(!$qtiParser->isValid()){
				echo $qtiParser->displayErrors();
			}

			$item = $qtiParser->load();
			$this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

		}
	}

	public function testParseOatPci(){
		$qtiParser = new Parser(dirname(__FILE__).'/samples/oat/version_and_assets.xml');

		$qtiParser->validate();
		if(!$qtiParser->isValid()){
			echo $qtiParser->displayErrors();
		}

		$item = $qtiParser->load();
		$this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

		$pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\PortableCustomInteraction');
		$this->assertEquals(1, count($pcis));

		/**
		 * @var $pci \oat\taoQtiItem\model\qti\interaction\PortableCustomInteraction
		 */
		$pci = array_pop($pcis);

		$this->assertEquals('likertScaleInteraction', $pci->getTypeIdentifier());
		$this->assertEquals('1.0.0', $pci->getVersion());
		$this->assertEquals(['IMSGlobal/jquery_2_1_1', 'likertScaleInteraction/runtime/renderer'], $pci->getLibraries());
		$this->assertEquals(['level' => '5', 'label-min' => 'min', 'label-max' => 'max'], $pci->getProperties());
		$this->assertEquals(['likertScaleInteraction/style/base.css', 'likertScaleInteraction/style/renderer.css'], $pci->getStylesheets());
	}

	public function testParseImsPci(){

		$qtiParser = new Parser(dirname(__FILE__).'/samples/ims/likert.xml');
		$qtiParser = new Parser(dirname(__FILE__).'/samples/ims/likert-inline-ns.xml');

		$qtiParser->validate();
		if(!$qtiParser->isValid()){
			echo $qtiParser->displayErrors();
		}

		$item = $qtiParser->load();
		$this->assertInstanceOf('\\oat\\taoQtiItem\\model\\qti\\Item',$item);

		$pcis = $item->getComposingElements('\\oat\\taoQtiItem\\model\\qti\\interaction\\ImsPortableCustomInteraction');
		$this->assertEquals(1, count($pcis));

		/**
		 * @var $pci \oat\taoQtiItem\model\qti\interaction\ImsPortableCustomInteraction
		 */
		$pci = array_pop($pcis);

		$this->assertEquals('likertScaleInteraction', $pci->getTypeIdentifier());
//		$this->assertEquals(['IMSGlobal/jquery_2_1_1', 'likertScaleInteraction/runtime/renderer'], $pci->getLibraries());
		$this->assertEquals(['level' => '5', 'label-min' => 'min', 'label-max' => 'max'], $pci->getProperties());
	}
}