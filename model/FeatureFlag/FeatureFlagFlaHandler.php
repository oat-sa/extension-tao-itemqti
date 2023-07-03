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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA;
 *
 * @author Sergei Mikhailov <sergei.mikhailov@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiItem\model\FeatureFlag;

use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\featureFlag\FeatureFlagConfigHandlerInterface;

class FeatureFlagFlaHandler implements FeatureFlagConfigHandlerInterface
{
    private FeatureFlagCheckerInterface $featureFlagChecker;

    public function __construct(FeatureFlagCheckerInterface $featureFlagChecker)
    {
        $this->featureFlagChecker = $featureFlagChecker;
    }

    public function __invoke(array $configs): array
    {
        // TODO Once `FEATURE_FLAG_FLA` removed, include `taoQtiItem/creator/interaction/media/property/fla` visibility
        //  flag to [SHOW_IF_IS_TAO_ADVANCE](https://github.com/oat-sa/extension-tao-deliver-connect/blob/3a2120942dd91a6baf4d3eeea5f2ba6613ec487a/model/FeatureFlag/FeatureFlagClientConfigHandler.php#L69-L71).
        $configs['services/features']['visibility']['taoQtiItem/creator/interaction/media/property/fla'] =
            $this->featureFlagChecker->isEnabled('FEATURE_FLAG_FLA') ? 'show' : 'hide';

        return $configs;
    }
}
