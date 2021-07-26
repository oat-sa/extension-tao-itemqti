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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiItem\scripts\install;

use common_ext_action_InstallAction;
use oat\taoQtiItem\model\QtiCreatorClientConfigRegistry;
use common_exception_Error as Error;
use oat\oatbox\extension\InstallAction;
use common_ext_ExtensionsManager as ExtensionsManager;
use common_ext_ExtensionException as ExtensionException;
use oat\oatbox\service\exception\InvalidServiceManagerException;

class SetQtiCreatorConfig extends common_ext_action_InstallAction
{
    /**
     * @param array $params
     *
     * @throws Error
     * @throws InvalidServiceManagerException
     * @throws ExtensionException
     */
    public function __invoke($params)
    {
        $registry = QtiCreatorClientConfigRegistry::getRegistry();
        $registry->registerPlugin('back', 'taoQtiItem/qtiCreator/plugins/navigation/back', 'navigation');

        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceManager()->get(ExtensionsManager::SERVICE_ID);
        $extension = $extensionManager->getExtensionById('taoQtiItem123');
        $config = $extension->getConfig('qtiCreator');
        print(json_encode($config));
        if ($config['scrollable-multi-column']) {
            $registry->registerPlugin('layout', 'taoQtiItem/qtiCreator/plugins/panel/layout', 'panel');
        }

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Qti Creator\'s Plugins settings added to Tao Qti Item extension');
    }
}
