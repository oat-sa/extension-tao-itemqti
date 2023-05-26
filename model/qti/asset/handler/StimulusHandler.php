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

/**
 * Class StimulusHandler
 *
 * The purpose of this handler is to extract xml stimulus from item to copy them
 * If the included stimulus includes images, they should be encoded to avoid file dependencies
 *
 * @package oat\taoQtiItem\model\qti\asset\handler
 */
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
     * Applicable to all items that contain <xinclude> tag
     *
     * @param $relativePath
     * @return bool
     * @throws \common_exception_MissingParameter
     */
    public function isApplicable($relativePath)
    {
        $xincluded = [];
        /** @var Element $xincludeElement */
        foreach ($this->getQtiItem()->getComposingElements('oat\taoQtiItem\model\qti\Xinclude') as $xincludeElement) {
            $xincluded[] = $xincludeElement->attr('href');
            \common_Logger::i("Xinclude component found in resource '" .
                $this->getQtiItem()->getIdentifier() . "' with href '" . $xincludeElement->attr('href') . "'.");
        }

        return in_array($relativePath, $xincluded);
    }

    /**
     * Store locally, in a safe directory
     * Encoded all stimulus images to avoid file dependencies
     *
     * @param $absolutePath
     * @param $relativePath
     * @return array|mixed
     * @throws \common_Exception
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
     * Remove ../ to secure path
     *
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
     * Walk into stimulus file to transform images from path to base64encoded data:image
     *
     * @param $absolutePath
     * @throws \common_Exception
     */
    protected function encodeStimulusImages($absolutePath)
    {
        if (!is_readable($absolutePath) || !is_writable($absolutePath)) {
            throw new \common_Exception('Stimulus cannot be imported, asset file is not readable/writable.');
        }
        $dom = new \DOMDocument('1.0', 'UTF-8');
        $dom->loadXML(file_get_contents($absolutePath));
        $images = $dom->getElementsByTagName('img');

        for ($i = 0; $i < $images->length; $i++) {
            $imageFile = dirname($absolutePath) . DIRECTORY_SEPARATOR
                . ltrim($images->item($i)->getAttribute('src'), DIRECTORY_SEPARATOR);

            if (is_readable($imageFile)) {
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
        if (!isset($this->$attribute)) {
            throw new \common_exception_MissingParameter($attribute, 'stimulusImporter');
        }
    }
}
