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

namespace oat\taoQtiItem\model\portableElement\common;

use oat\taoQtiItem\model\portableElement\common\exception\PortableElementInconsistencyModelException;
use oat\taoQtiItem\model\portableElement\common\model\PortableElementModel;

trait PortableElementModelTrait
{
    /**
     * @var PortableElementModel
     */
    protected $model;

    /**
     * @return PortableElementModel
     * @throws PortableElementInconsistencyModelException
     */
    public function getModel()
    {
        if (! $this->hasModel()) {
            throw new PortableElementInconsistencyModelException('Portable element model is not set.');
        }
        return $this->model;
    }

    /**
     * @param PortableElementModel $model
     */
    public function setModel(PortableElementModel $model)
    {
        $this->model = $model;
    }

    /**
     * @return bool
     */
    public function hasModel()
    {
        return !empty($this->model);
    }

    public function getModelName()
    {
        if (!$this->hasModel()) {
            throw new PortableElementInconsistencyModelException('Portable element model is not set.');
        }
        return get_class($this->model);
    }

    public function resetModel()
    {
        $class = $this->getModelName();
        $this->model = new $class();
    }

    /**
     * @param array $data
     * @return PortableElementModel
     * @throws PortableElementInconsistencyModelException
     */
    public function getModelFromArray(array $data)
    {
        $class = $this->getModelName();
        $this->model = new $class();
        return $this->model->exchangeArray($data);
    }
}