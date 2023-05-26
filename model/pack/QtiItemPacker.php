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
 *
 */

namespace oat\taoQtiItem\model\pack;

use oat\oatbox\filesystem\Directory;
use oat\taoItems\model\pack\ItemPack;
use oat\taoItems\model\pack\ItemPacker;
use oat\taoQtiItem\model\pack\QtiAssetPacker\PackedAsset;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Parser as QtiParser;
use oat\taoQtiItem\model\qti\AssetParser;
use core_kernel_classes_Resource;
use InvalidArgumentException;
use common_Exception;
use oat\taoQtiItem\model\qti\XIncludeLoader;
use oat\taoItems\model\media\ItemMediaResolver;
use oat\taoQtiItem\model\qti\Service;
use Throwable;

/**
 * This class pack a QTI Item. Packing instead of compiling, aims
 * to extract the only data of an item. Those data are used by the
 * item runner to render the item.
 *
 * @package taoQtiItem
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class QtiItemPacker extends ItemPacker
{
    /**
     * The item type identifier
     * @var string
     */
    protected static $itemType = 'qti';

    /**
     * XInclude expressions are replaced and not treated as assets
     * @var boolean
     */
    protected $replaceXinclude = true;

    /** @var QtiParser|null */
    private $qtiParser;

    public function setQtiParser(QtiParser $parser): void
    {
        $this->qtiParser = $parser;
    }

    /**
     * packItem implementation for QTI
     * @inheritdoc
     * @see {@link ItemPacker}
     * @throws InvalidArgumentException
     * @throws common_Exception
     */
    public function packItem(core_kernel_classes_Resource $item, $lang, Directory $directory)
    {
        //use the QtiParser to transform the QTI XML into an assoc array representation
        $content = $this->getXmlByItem($item, $lang);
        //load content
        $qtiParser = $this->qtiParser ?? new QtiParser($content);

        if ($this->skipValidation === false && !$qtiParser->validate()) {
            throw new common_Exception('Invalid QTI content : ' . $qtiParser->displayErrors(false));
        }

        //parse
        $qtiItem = $qtiParser->load();

        return $this->packQtiItem($item, $lang, $qtiItem, $directory);
    }

    /**
     * @param core_kernel_classes_Resource $item the item to pack
     * @param string $lang
     * @param Item $qtiItem
     * @param \oat\oatbox\filesystem\Directory $directory
     * @return ItemPack $itemPack
     * @throws common_Exception
     */
    public function packQtiItem($item, $lang, $qtiItem, Directory $directory)
    {
        //use the QtiParser to transform the QTI XML into an assoc array representation
        try {
            //build the ItemPack from the parsed data
            $resolver = new ItemMediaResolver($item, $lang);
            if ($this->replaceXinclude) {
                $xincludeLoader = new XIncludeLoader($qtiItem, $resolver);
                $xincludeLoader->load(true);
            }

            $itemPack = new ItemPack(self::$itemType, $qtiItem->toArray());

            $itemPack->setAssetEncoders($this->getAssetEncoders());

            $assetParser = new AssetParser($qtiItem, $directory);
            $assetParser->setDeepParsing($this->isNestedResourcesInclusion());
            $assetParser->setGetXinclude(!$this->replaceXinclude);

            $storageDirectory = new \tao_models_classes_service_StorageDirectory(
                $item->getUri(),
                $directory->getFileSystemId(),
                $directory->getPrefix() . '/' . $lang
            );
            $storageDirectory->setServiceLocator($directory->getServiceLocator());

            foreach ($assetParser->extract($itemPack) as $type => $assets) {
                $itemPack->setAssets($type, $this->resolveAsset($assets, $resolver), $storageDirectory, true);
            }
        } catch (common_Exception $e) {
            throw new common_Exception('Unable to pack item ' . $item->getUri() . ' : ' . $e->getMessage());
        }

        return $itemPack;
    }

    /**
     * @param $item
     * @param $qtiItem
     * @param Directory $directory
     * @param PackedAsset[] $packedAssets
     * @return ItemPack
     * @throws common_Exception
     */
    public function createQtiItemPackWithAssets($item, $qtiItem, array $packedAssets): ItemPack
    {
        try {
            $itemPack = new ItemPack(self::$itemType, $qtiItem->toArray());
            $itemPack->setAssetEncoders($this->getAssetEncoders());

            /** @var PackedAsset $packedAsset */
            foreach ($packedAssets as $packedAsset) {
                if ($packedAsset->getType() != 'xinclude') {
                    $itemPack->setAsset($packedAsset->getType(), $packedAsset->getMediaAsset());
                }
            }
        } catch (Throwable $e) {
            throw new common_Exception('Unable to pack item ' . $item->getUri() . ' : ' . $e->getMessage());
        }

        return $itemPack;
    }

    /**
     * @param string[] $assets
     * @param ItemMediaResolver $resolver
     * @return string[]
     */
    private function resolveAsset($assets, ItemMediaResolver $resolver)
    {
        foreach ($assets as &$asset) {
            $asset = $resolver->resolve($asset);
        }
        return $assets;
    }

    /**
     * @param boolean $replaceXinclude
     */
    public function setReplaceXinclude($replaceXinclude)
    {
        $this->replaceXinclude = $replaceXinclude;
    }

    /**
     * @param core_kernel_classes_Resource $item
     * @param string $lang
     * @return string
     */
    protected function getXmlByItem(core_kernel_classes_Resource $item, $lang = '')
    {
        return Service::singleton()->getXmlByRdfItem($item, $lang);
    }
}
