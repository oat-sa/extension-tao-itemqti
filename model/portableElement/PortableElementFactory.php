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

namespace oat\taoQtiItem\model\portableElement;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\common\exception\PortableElementParserException;
use oat\taoQtiItem\model\portableElement\common\parser\implementation\PortableElementDirectoryParser;
use oat\taoQtiItem\model\portableElement\common\parser\PortableElementPackageParser;

/**
 * Factory to create components implementation based on PortableElementModel
 *
 * Class PortableElementFactory
 * @package oat\qtiItemPci\model\common
 */
class PortableElementFactory extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiItem/PortableElementFactory';

    /**
     * Return model associated to the given string value
     *
     * @param string $model
     * @return PortableElement
     * @throws PortableElementInconsistencyModelException
     */
    public function getModel($model)
    {
        if ($this->hasOption($model)
            && ($implementation = $this->getOption($model)) instanceof PortableElement
        ) {
            return $implementation;
        }

        throw new PortableElementInconsistencyModelException('Portable element "' . $model . '" not found. ' .
            'Maybe you should install the associated extension?');
    }

    /**
     * Return all configured models
     *
     * @return PortableElement[]
     * @throws PortableElementInconsistencyModelException
     */
    public function getModels()
    {
        $models = $this->getOptions();

        if (empty($models)) {
            throw new PortableElementInconsistencyModelException('Portable elements not found. ' .
                'Maybe you should install associated extensions?');
        }

        foreach ($models as $model) {
            if (! $model instanceof PortableElement) {
                throw new PortableElementInconsistencyModelException('Configured models are not correctly set. ' .
                    'Portable model has to inherit PortableElement');
            }
        }
        return $models;
    }

    /**
     * Return all directory parsers from configuration
     *
     * @return PortableElementDirectoryParser
     */
    public function getDirectoryParsers()
    {
        $parsers = array();
        $models = $this->getModels();
        foreach ($models as $model) {
            $parsers[] = $model->getDirectoryParser();
        }
        return $parsers;
    }
}