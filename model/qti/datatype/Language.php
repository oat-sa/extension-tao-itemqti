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
 * Copyright (c) 2013-2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiItem\model\qti\datatype;

/**
 * @access public
 * @author Sam, <sam@taotesting.com>
 * @package taoQTI
 */
class Language extends Datatype
{
    public static function validate($value): bool
    {
        return preg_match(
            '/^[a-z]{2}$|^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[a-zA-Z]{2,3}|-\d{3})(?:(?:-x)?-[a-zA-Z\d]{1,8})?$/',
            $value
        );
    }

    public static function fix($value)
    {
        $languages = self::getLanguageMap();

        if (isset($languages[$value])) {
            $value = $languages[$value];
        }

        return self::validate($value) ? $value : null;
    }

    private static function getLanguageMap()
    {
        return [
            'EN' => 'en-US',
            'DE' => 'de-DE',
            'FR' => 'fr-FR',
            'ES' => 'es-ES',
            'ar-arb' => 'ar-ARB',
        ];
    }
}
