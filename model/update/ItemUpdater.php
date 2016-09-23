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

namespace oat\taoQtiItem\model\update;

use oat\taoQtiItem\model\qti\ParserFactory;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\Item;

/**
 * Class ItemUpdater
 * @package oat\taoQtiItem\model\update
 */
abstract class ItemUpdater
{
    /**
     * @var \Traversable
     */
    protected $iterator;

    /**
     * @var string
     */
    protected $itemRootDir;

    /**
     * @var array
     */
    protected $checkedFiles = [];

    /**
     * Init the item updater with the item directory path
     * 
     * @param string|Directory $itemRootDir directory to recursive search qti.xml files.
     * @throws \common_Exception
     */
    public function __construct($itemRootDir)
    {
        $this->itemRootDir = $itemRootDir;
        $serviceLocator = ServiceManager::getServiceManager();

        if (is_string($itemRootDir)) {
            $fsm = $serviceLocator->get(FileSystemService::SERVICE_ID);
            $itemUpdaterFs = $fsm->createFileSystem('itemUpdater', '/');
            $itemUpdaterFs->getAdapter()->setPathPrefix('');
            $this->itemRootDir = new Directory('itemUpdater', $itemRootDir);
            $this->itemRootDir->setServiceLocator($serviceLocator);

        } else if ($itemRootDir instanceof Directory) {
            $this->itemRootDir = $itemRootDir;
        }
    }

    /**
     * Update all the item files found within the $itemRootPath
     * @param boolean $changeItemContent - tells if the item files will be written with the updated content or not
     * @return array of modified item instances
     */
    public function update($changeItemContent = false)
    {
        $returnValue = array();
        $i = 0;
        $fixed = 0;

        $iterator = $this->itemRootDir->getFlyIterator(Directory::ITERATOR_FILE|Directory::ITERATOR_RECURSIVE);
        foreach ($iterator as $itemFile) {
            /** @var File $itemFile */
            $filePath = $itemFile->getPrefix();

            $this->checkedFiles[$filePath] = false;
            if ($itemFile->getBasename() === 'qti.xml') {

                $i++;
                $xml = new \DOMDocument();
                $xml->loadXML($itemFile->read());

                $parser = new ParserFactory($xml);
                $item   = $parser->load();
                \common_Logger::i('checking item #'.$i.' id:'.$item->attr('identifier').' file:'.$filePath);

                if ($this->updateItem($item, $filePath)) {
                    $this->checkedFiles[$filePath] = true;
                    $returnValue[$filePath]        = $item;
                    \common_Logger::i('fixed required for #'.$i.' id:'.$item->attr('identifier').' file:'.$filePath);
                    if ($changeItemContent) {
                        $fixed++;
                        \common_Logger::i('item fixed #'.$i.' id:'.$item->attr('identifier').' file:'.$filePath);
                        $itemFile->update($item->toXML());
                    }
                }
            }
        }

        \common_Logger::i('total item fixed : '.$fixed);
        return $returnValue;
    }

    /**
     * Get the list of checked files 
     * @return array
     */
    public function getCheckedFiles()
    {
        return $this->checkedFiles;
    }

    /**
     * Try updating an single item instance,
     * Returns true if the content has been changed, false otherwise
     *
     * @param Item $item
     * @param string $itemFile
     * @return boolean
     */
    abstract protected function updateItem(Item $item, $itemFile);
}