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
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiItem\model\portableElement\common\helper;

use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;

class Manifest
{

    /**
     * Adjust file resource entries from {QTI_NS}/xxx/yyy.js to ./xxx/yyy.js
     *
     * @param PortableElementModel $model
     * @param array $keys
     */
    public static function replaceAliasesToPath(PortableElementModel &$model, array $keys = [])
    {
        if (empty($keys)) {
            $keys = ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon'];
        }

        foreach ($keys as $key) {
            if ($model->hasRuntimeKey($key)) {
                $model->setRuntimeKey(
                    $key, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getRuntimeKey($key))
                );
            }
            if($model->hasCreatorKey($key)) {
                $model->setCreatorKey(
                    $key, preg_replace('/^'.$model->getTypeIdentifier().'/', '.', $model->getCreatorKey($key))
                );
            }
        }
    }

    /**
     * Adjust file resource entries from ./xxx/yyy.js to {QTI_NS}/xxx/yyy.js
     *
     * @param PortableElementModel $model
     * @param array $keys
     */
    public static function replacePathToAliases(PortableElementModel &$model, array $keys = [])
    {
        if (empty($keys)) {
            $keys = ['hook', 'libraries', 'stylesheets', 'mediaFiles', 'icon'];
        }

        foreach ($keys as $key) {
            if ($model->hasRuntimeKey($key)) {
                $model->setRuntimeKey(
                    $key, preg_replace('/^(.\/)(.*)/', $model->getTypeIdentifier() . "/$2", $model->getRuntimeKey($key))
                );
            }
            if($model->hasCreatorKey($key)) {
                $model->setCreatorKey(
                    $key, preg_replace('/^(.\/)(.*)/', $model->getTypeIdentifier() . "/$2", $model->getCreatorKey($key))
                );
            }
        }
    }
}