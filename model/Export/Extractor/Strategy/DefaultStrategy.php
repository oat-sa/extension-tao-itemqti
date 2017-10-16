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
use oat\taoQtiItem\model\flyExporter\extractor\OntologyExtractor;

class DefaultStrategy implements Strategy
{
    /** @var array  */
    private $dataArray = [];


    /** @var  string */
    private $column;

    /**
     * @param string $column
     */
    public function __construct($column)
    {
        $this->column = $column;
    }

    /**
     * @inheritdoc
     */
    public function addHashEntry(HashEntry $hashEntry)
    {
        $value = $hashEntry->getValue();
        if (!empty($value)) {
            $this->dataArray[] = $value;
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

        return [
            $this->column => implode(OntologyExtractor::DEFAULT_PROPERTY_DELIMITER, $this->dataArray)
        ];
    }
}