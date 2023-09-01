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

namespace oat\taoQtiItem\model\portableElement\model;

use oat\oatbox\AbstractRegistry;
use oat\taoQtiItem\model\portableElement\exception\PortableModelMissing;

/**
 * Factory to create components implementation based on PortableElementModel
 *
 * Class PortableModelRegistry
 * @package oat\qtiItemPci\model\common
 */
class PortableModelRegistry extends AbstractRegistry
{
    /**
     * (non-PHPdoc)
     * @see \oat\oatbox\AbstractRegistry::getExtension()
     */
    protected function getExtension()
    {
        return \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
    }

    /**
     * (non-PHPdoc)
     * @see \oat\oatbox\AbstractRegistry::getConfigId()
     */
    protected function getConfigId()
    {
        return 'portableModels';
    }

    /**
     * Return model associated to the given string value
     *
     * @param string $modelId
     * @return PortableElementModel
     * @throws PortableElementInconsistencyModelException
     */
    public function getModel($modelId)
    {
        if (!$this->isRegistered($modelId)) {
            throw new PortableModelMissing($modelId);
        }
        return $this->getModelFromConfig($this->get($modelId));
    }

    /**
     * Register a new model to the registry
     *
     * @param PortableElementModel $model
     */
    public function register(PortableElementModel $model)
    {
        $this->set($model->getId(), [
            'class' => get_class($model)
        ]);
    }

    /**
     * Return all configured models
     *
     * @return PortableElementModel[]
     * @throws PortableElementInconsistencyModelException
     */
    public function getModels()
    {
        $models = $this->getMap();
        foreach ($models as $key => $config) {
            $models[$key] = $this->getModelFromConfig($config);
        }
        return $models;
    }

    /**
     * Helper to initialise the models
     *
     * @param array $config
     * @return PortableElementModel
     */
    protected function getModelFromConfig($config)
    {
        $implClass = $config['class'];
        return new $implClass();
    }
}
