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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 * @author Gabriel Felipe Soares <gabriel.felipe.soares@taotesting.com>
 */

namespace oat\taoQtiItem\install\scripts;

use oat\oatbox\extension\InstallAction;
use oat\oatbox\reporting\Report;
use oat\taoQtiItem\model\QtiCreator\ExtendedTextInteractionConfigurationRegistry;

class ExtendConfigurationRegistry extends InstallAction
{
    public function __invoke($params): Report
    {
        $registry = $this->propagate(new ExtendedTextInteractionConfigurationRegistry());
        $registry->setHasMath(false);

        $setValues = $registry->get(ExtendedTextInteractionConfigurationRegistry::ID);

        if ($setValues) {
            return Report::createSuccess(
                sprintf(
                    "Applied the following configuration to `%s`\n%s",
                    ExtendedTextInteractionConfigurationRegistry::class,
                    json_encode($setValues)
                )
            );
        }

        return Report::createError(
            sprintf('No values set to `%s`', ExtendedTextInteractionConfigurationRegistry::class)
        );
    }
}
