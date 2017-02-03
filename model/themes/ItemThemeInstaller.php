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

use oat\tao\model\ThemeRegistry;

\console::setMode('file' , 'theme-installer.log');

class ItemThemeInstaller
{

    private $extensionId;

    private $registry;

    /**
     * ItemThemeInstaller constructor.
     *
     * @param $extensionId
     */
    public function __construct($extensionId) {
        $this->extensionId = $extensionId;
        $this->registry = ThemeRegistry::getRegistry();
    }

    /**
     * Remove themes from the configuration
     *
     * @param array|string $themeIds
     *
     * @return \common_report_Report
     */
    public function remove($themeIds) {
        $themeIds = (array)$themeIds;
        foreach($themeIds as $themeId) {
            $prefixedId = $this->getPrefixedThemeId($themeId);
            if(!$this->themeExists($prefixedId)) {
                continue;
            }
            $this->registry->unregisterTheme($prefixedId);
        }
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Item themes removed: ' . implode(',', $themeIds));
    }


    /**
     * @param array $themes
     *
     * @return \common_report_Report
     */
    public function add(array $themes) {

        foreach($themes as $themeId => $label) {
            $prefixedId =  $this->getPrefixedThemeId($themeId);
            if($this->themeExists($prefixedId)) {
                continue;
            }
            $this->register($themeId, $label);
        }

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Item themes registered: ' . implode(',', array_keys($themes)));
    }


    /**
     * @param array $themes
     *
     * @return \common_report_Report
     */
    public function update(array $themes) {
        foreach($themes as $themeId => $label) {
            $this->remove($themeId);
            $this->register($themeId, $label);
        }
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Item themes updated: ' . implode(',', array_keys($themes)));
    }


    /**
     * Set the current theme
     *
     * @param $themeId
     *
     * @return boolean|\common_report_Report
     */
    public function setDefault($themeId) {
        $prefixedId =  $this->getPrefixedThemeId($themeId);
        if(!$this->themeExists($prefixedId)) {
            return new \common_report_Report(\common_report_Report::TYPE_ERROR, $themeId . ' not installed, could not set to default');
        }
        $this->registry->setDefaultTheme('items', $prefixedId);
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Default item theme set to ' . $themeId);
    }


    /**
     * Reset the item theme registry to its initial values
     *
     * @return bool|\common_report_Report
     */
    public function reset() {
        $map = $this->registry->getMap();
        if(empty($map['items']['available'])) {
            return false;
        }
        foreach($map['items']['available'] as $theme) {
            // exclude themes that don't belong to this customer
            if($theme['id'] === 'tao' || 0 !== strpos($theme['id'], $this->extensionId)) {
                continue;
            }
            $this->registry->unregisterTheme($theme['id']);
        }
        // get the now updated map
        $map = $this->registry->getMap();

        $taoTheme = array(
            'id' => 'tao',
            'name' => 'TAO',
            'path' => $this->getStylesheetPath('tao')
        );

        if(!$this->themeExists('tao')) {
            array_unshift($map['items']['available'], $taoTheme);
        }

        $this->registry->set('items', array(
            'base'  => $map['items']['base'],
            // potential other themes have not been removed
            'available' => $map['items']['available'],
            'default' => 'tao'
        ));

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Removed ' . $this->extensionId . ' themes, restored TAO default');
    }

    /**
     * Is a theme already registered?
     *
     * @param $themeId
     *
     * @return bool
     */
    public function themeExists($themeId) {
        // while this seem to be obsolete in most cases
        // it can be useful when the function is called from the outside
        $prefixedId = $this->getPrefixedThemeId($themeId);
        $map = $this->registry->getMap();
        if(empty($map['items']['available'])) {
            return false;
        }
        foreach($map['items']['available'] as $theme) {
            if($theme['id'] === $prefixedId) {
                return true;
            }
        }
        return false;
    }


    /**
     * Prefix theme id base on extension id from calling class. Pass through if already prefixed
     *
     * @param $themeId
     *
     * @return string
     */
    protected function getPrefixedThemeId($themeId) {
        if($themeId === 'tao') {
            return $themeId;
        }
        if(preg_match('~^' . $this->extensionId . '[A-Z]~', $themeId)) {
            return $themeId;
        }
        return $this->extensionId . ucfirst($themeId);
    }

    /**
     * @param $themeId
     *
     * @return string
     */
    protected function getStylesheetPath($themeId) {
        return $themeId === 'tao'
            ? 'taoQtiItem/views/css/themes/default.css'
            : sprintf('%s/views/css/themes/items/%s/theme.css', $this->extensionId, $themeId);
    }

    /**
     * @param $themeId
     * @param $label
     */
    protected function register($themeId, $label) {
        $this->registry->registerTheme(
            $this->getPrefixedThemeId($themeId),
            $label,
            $this->getStylesheetPath($themeId),
            array('items')
        );
    }
}
