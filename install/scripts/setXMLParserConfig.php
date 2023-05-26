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
 * Copyright (c) 2017 Open Assessment Technologies, S.A.
 */

namespace oat\taoQtiItem\install\scripts;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\ValidationService;

class setXMLParserConfig extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');

        $ext->setConfig('XMLParser', [
            'preserveWhiteSpace' => false,
            'formatOutput'       => true,
            'validateOnParse'    => false,
        ]);

        return new \common_report_Report(
            \common_report_Report::TYPE_SUCCESS,
            'XML Parser config has been succesfully set up'
        );
    }
}
