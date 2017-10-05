<?php
/**
 * Created by PhpStorm.
 * User: ionut
 * Date: 04/10/17
 * Time: 14:39
 */

namespace oat\taoQtiItem\model\Export\Extractor\Strategy;

use oat\taoQtiItem\model\Export\Extractor\HashEntry;
use oat\taoQtiItem\model\flyExporter\extractor\OntologyExtractor;

class ColumnStrategy implements Strategy
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
        return [
            $this->column => implode(OntologyExtractor::DEFAULT_PROPERTY_DELIMITER, $this->dataArray)
        ];
    }
}