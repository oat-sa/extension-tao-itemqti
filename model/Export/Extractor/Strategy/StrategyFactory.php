<?php

/**
 * Created by PhpStorm.
 * User: ionut
 * Date: 04/10/17
 * Time: 14:39
 */

namespace oat\taoQtiItem\model\Export\Extractor\Strategy;

class StrategyFactory
{
    /**
     * @param array $config
     * @param string $column
     * @param array $metaDataProperties
     * @return Strategy
     */
    public static function create(array $config, $column, array $metaDataProperties)
    {
        if (static::isFormatAsColumns($config)) {
            return new ColumnStrategy(count($metaDataProperties) === 1, $column);
        }

        return new DefaultStrategy($column);
    }


    /**
     * @param array $config
     * @return bool
     */
    protected static function isFormatAsColumns(array $config)
    {
        return isset($config['valuesAsColumns']) && $config['valuesAsColumns'] === true;
    }
}
