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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\model\Export\Extractor\Strategy;

use oat\taoQtiItem\model\Export\Extractor\HashEntry;

class ColumnStrategy implements Strategy
{
    /** @var array */
    private $dataArray = [];

    /** @var  string */
    private $column;

    /** @var  boolean */
    private $hasOnlyOneProperty;

    /** @var  int */
    private $keyOccurence;

    /**
     * @param bool $hasOnlyOneProperty
     * @param string $column
     */
    public function __construct($hasOnlyOneProperty, $column)
    {
        $this->hasOnlyOneProperty = $hasOnlyOneProperty;
        $this->column = $column;
        $this->keyOccurence = 1;
    }

    /**
     * @inheritdoc
     */
    public function addHashEntry(HashEntry $hashEntry)
    {
        $key = $hashEntry->getKey();
        if (array_key_exists($key, $this->dataArray)) {
            $newKeyName = $this->generateDuplicateName($key);
            $this->dataArray[$newKeyName] = $hashEntry->getValue();
        }else{
            $this->dataArray[$key] = $hashEntry->getValue();
        }
    }

    /**
     * @inheritdoc
     */
    public function toArray()
    {
        if (empty($this->dataArray)) {
            return [];
        }

        if ($this->hasOnlyOneProperty) {
            return $this->dataArray;
        }
        return [
            $this->column => $this->dataArray
        ];
    }

    /**
     * @param string $key
     * @return string
     */
    protected function generateDuplicateName($key)
    {
        $newKey = $key . ' ('.$this->keyOccurence.')';

        if (array_key_exists($newKey, $this->dataArray)) {
            $this->keyOccurence++;
            return $this->generateDuplicateName($key);
        }

        return $newKey;
    }
}