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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 *
 */
namespace oat\taoQtiItem\test\update;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiItem\scripts\update\ItemUpdateInlineFeedback;

/**
 * Description of ItemUpdateInlineFeedback
 *
 * @author sam
 */
class ItemUpdateInlineFeedbackTest extends TaoPhpUnitTestRunner
{
    /**
     * tests initialization
     * load qti service
     */
    public function setUp(){
        TaoPhpUnitTestRunner::initTest();
    }

    public function testProcess(){
        $itemUpdater = new ItemUpdateInlineFeedback(ROOT_PATH . 'taoQtiItem/test/update/samples/itemData');
        $itemUpdater->process();
        $checkedFiles = $itemUpdater->getCheckedFiles();
        $modifiedFiles = array_keys(array_filter($checkedFiles, function($v){return $v;}));

        var_dump($checkedFiles, $modifiedFiles);
        
        $this->assertEquals(1, count($modifiedFiles));
        $this->assertTrue(strpos($modifiedFiles[0], 'taoQtiItem/test/update/samples/itemData/i1452699358831159_hasModal_willChange/itemContent/en-US/qti.xml') > 0);
    }
}