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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiItem\model\themes;

use oat\tao\model\ThemeNotFoundException;
use oat\tao\model\ThemeRegistry;

trait ItemThemeInstaller
{

    /**
     * @var
     */
    private $extensionId;


    /**
     * @param $themes
     * @param $currentTheme
     *
     * @return \common_report_Report
     */
    public function install($themes, $currentTheme) {

        $extensionId = $this->getExtensionId();

        // avoid collision with homonymous themes from other extensions
        $currentTheme = $extensionId . ucfirst($currentTheme);

        // this helps when running the script multiple times during debugging
        try {
            ThemeRegistry::getRegistry()->unregisterTheme($currentTheme);
        } catch (ThemeNotFoundException $e) {
            \common_Logger::d('theme ' . $currentTheme . ' is not registered, cannot unregister');
        }

        $this->addThemes($themes);
        $this->setDefault($currentTheme);

        // TAO theme would usually be removed from the stack if custom themes are used
        // Make sure another theme has been set to default in this case.
        try {
            ThemeRegistry::getRegistry()->unregisterTheme('tao');
        } catch (ThemeNotFoundException $e) {
            \common_Logger::d('tao theme is not registered, cannot unregister');
        }

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Item themes registered');
    }

    public function addThemes($themes) {
        $extensionId = $this->getExtensionId();

        foreach($themes as $themeId => $label) {
            ThemeRegistry::getRegistry()->registerTheme(
                $extensionId . ucfirst($themeId),
                $label,
                implode(DIRECTORY_SEPARATOR, array($extensionId, 'views', 'css', 'themes', 'items', $themeId, 'theme.css')),
                array('items')
            );
        }
    }

    /**
     * Set the current theme
     *
     * @param $currentTheme
     */
    public function setDefault($currentTheme) {
        ThemeRegistry::getRegistry()->setDefaultTheme('items', $currentTheme);
    }

    /**
     * extract extension from calling class
     *
     * @return string
     */
    protected function getExtensionId() {
        if(is_null($this->extensionId)) {
            strtok(get_class($this), '\\');
            $this->extensionId = strtok('\\');
        }
        return $this->extensionId;
    }
}