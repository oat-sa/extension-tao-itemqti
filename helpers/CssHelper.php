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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */


namespace oat\taoQtiItem\helpers;


use Sabberworm\CSS\Parser;

class CssHelper{

    public static function save($cssArr){
        $css = arrayToCss($cssArr);
        // ItemsService::getItemFolder() . '/my.css'
    }


    /**
     * Convert incoming CSS to CSS array
     *
     * @param $css
     * @return mixed
     */
    public static function cssToArray($css){
        $cssParser = new Parser($css);

        return $cssParser -> parse();
    }

    /**
     * Convert incoming CSS array to proper CSS
     *
     * @param $array
     * @return string
     */
    public static function arrayToCss($array){
        $css = '';

        // rebuild CSS
        foreach($array as $key1 => $value1){
            $css .= $key1 . '{';

            foreach($value1 as $key2 => $value2){
                // in the case that the code is embedded in a media query
                if(is_array($value2)){
                    foreach($value2 as $value3){
                        $css .= $key2 . '{';
                        foreach($value3 as $mProp){
                            $css .= $mProp . ':' . $value3 . ';';
                        }
                        $css .= '}';
                    }
                }
                // regular selectors
                else{
                    $css .= $key2 . ':' . $value2 . ';';
                }
            }
            $css .= "}\n";
        }
        return $css;
    }

    public static function loadCssFile() {
//        // example file
//        // @TODO use ItemsService::getItemFolder() . '/my.css'
//        $cssFile = dirname(dirname(__DIR__)) . '/tao/views/scss/css/_choice.css';
//
//        $css = file_get_contents($cssFile);
//
//        $cssParser = new Parser($css);
//        $parseResult = $cssParser -> parse();
//
//
//        return print_r( ($parseResult->));
//
//        return print_r($cssParser, 1);
    }


} 