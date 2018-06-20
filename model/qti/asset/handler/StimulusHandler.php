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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\qti\asset\handler;

use oat\taoItems\model\media\LocalItemSource;
use oat\taoQtiItem\model\qti\Element;
use oat\taoQtiItem\model\qti\Item;

class StimulusHandler implements AssetHandler
{
    /**
     * The object representation of qti item
     *
     * @var Item
     */
    protected $qtiItem;

    /**
     * The destination of the item directory
     *
     * @var LocalItemSource
     */
    protected $itemSource;

    /**
     * @param $relativePath
     * @return bool
     * @throws \common_exception_MissingParameter
     */
    public function isApplicable($relativePath)
    {
        $xincluded = array();
        /** @var Element $xincludeElement */
        foreach ($this->getQtiItem()->getComposingElements('oat\taoQtiItem\model\qti\Xinclude') as $xincludeElement) {
            $xincluded[] = $xincludeElement->attr('href');
            \common_Logger::i("Xinclude component found in resource '" .
                $this->getQtiItem()->getIdentifier() . "' with href '" . $xincludeElement->attr('href') . "'.");
        }

        if(in_array($relativePath, $xincluded)) {
            return true;
        }

        return false;
    }

    /**
     * Store locally, in a safe directory
     * Encoded all stimulus images to avoid file dependencies
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array|mixed
     * @throws \common_Exception
     * @throws \common_exception_MissingParameter
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function handle($absolutePath, $relativePath)
    {
        $safePath = $this->safePath($relativePath);
        $this->encodeStimulusImages($absolutePath);

        $info = $this->getItemSource()->add($absolutePath, basename($absolutePath), $safePath);
        \common_Logger::i('Stimulus file \'' . $absolutePath . '\' copied.');

        return $info;
    }

    /**
     * @param $path
     * @return string
     */
    protected function safePath($path)
    {
        $safePath = '';
        if (dirname($path) !== '.') {
            $safePath = str_replace('../', '', dirname($path)) . '/';
        }
        return $safePath;
    }

    /**
     * @param $absolutePath
     */
    protected function encodeStimulusImages($absolutePath)
    {
        $dom = new \DOMDocument('1.0', 'UTF-8');
        $dom->loadXML(file_get_contents($absolutePath));
        $images = $dom->getElementsByTagName('img');

        for($i=0 ; $i<$images->length ; $i++) {
            $imageFile = dirname($absolutePath) . DIRECTORY_SEPARATOR . ltrim($images->item($i)->getAttribute('src'), DIRECTORY_SEPARATOR);
            if (file_exists($imageFile)) {
                $encodedSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($imageFile));
                $images->item($i)->setAttribute('src', $encodedSrc);
            }
        }
        if (isset($encodedSrc)) {
            file_put_contents($absolutePath, $dom->saveXML());
        }
    }

    public function finalize()
    {
        // Nothing to do
    }

    /**
     * @param LocalItemSource $itemSource
     * @return $this
     */
    public function setItemSource(LocalItemSource $itemSource)
    {
        $this->itemSource = $itemSource;
        return $this;
    }

    /**
     * @param Item $qtiItem
     * @return $this
     */
    public function setQtiItem(Item $qtiItem)
    {
        $this->qtiItem = $qtiItem;
        return $this;
    }

    /**
     * @return LocalItemSource
     * @throws \common_exception_MissingParameter
     */
    protected function getItemSource()
    {
        $this->assertAttribute('itemSource');
        return $this->itemSource;
    }

    /**
     * @return Item
     * @throws \common_exception_MissingParameter
     */
    protected function getQtiItem()
    {
        $this->assertAttribute('qtiItem');
        return $this->qtiItem;
    }

    /**
     * @param $attribute
     * @throws \common_exception_MissingParameter
     */
    private function assertAttribute($attribute)
    {
        $attributes = get_object_vars($this);
        if (!isset($attributes[$attribute])) {
            throw new \common_exception_MissingParameter($attribute, 'stimulusImporter');
        }
    }
}