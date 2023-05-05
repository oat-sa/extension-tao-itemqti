<?php

/*
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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung
 *                         (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor
 *                         (under the project TAO-SUSTAIN & TAO-DEV);
 *               2013-2015 (update and modification) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiItem\model\Export;

use tao_helpers_form_FormContainer;
use tao_helpers_form_xhtml_Form;
use tao_helpers_form_xhtml_TagWrapper;
use tao_helpers_form_FormFactory;
use taoItems_models_classes_ItemsService;
use core_kernel_classes_Resource;
use tao_helpers_Display;
use core_kernel_classes_Class;
use tao_helpers_Uri;
use oat\taoQtiItem\model\ItemModel;

/**
 * Export form for APIP packages
 *
 * @access public
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiItem

 */
class ApipExportForm extends ExportForm
{
    protected function getFormGroupName()
    {
        return __('Export APIP 1.0 Package');
    }
}
