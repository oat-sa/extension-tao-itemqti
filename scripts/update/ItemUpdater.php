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

namespace oat\taoQtiItem\scripts\update;

use oat\taoQtiItem\model\qti\ParserFactory;
use \RecursiveIteratorIterator;
use \RecursiveDirectoryIterator;

abstract class ItemUpdater
{
    protected $itemPath     = '';
    protected $checkedFiles = array();

    public function __construct($itemRootPath)
    {
        $this->itemPath = $itemRootPath;
    }

    public function process($changeItemContent = false)
    {
        $returnValue = array();
        $itemPath    = ROOT_PATH.'data/taoItems/itemData';
        $objects     = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($itemPath), RecursiveIteratorIterator::SELF_FIRST);

        foreach ($objects as $itemFile => $cursor) {

            $this->checkedFiles[$itemFile] = false;

            if (basename($itemFile) === 'qti.xml') {

                $xml = new \DOMDocument();
                $xml->load($itemFile);

                $parser = new ParserFactory($xml);
                $item   = $parser->load();

                if ($this->processItem($item)) {
                    $this->checkedFiles[$itemFile] = true;
                    $returnValue[$itemFile]        = $item;
                    if ($changeItemContent) {
                        file_put_contents($itemFile, $item->toXML());
                    }
                }
            }
        }

        return $returnValue;
    }

    abstract protected function processItem($item);
}