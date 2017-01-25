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

use oat\oatbox\log\LoggerAwareTrait;
use oat\tao\model\ThemeRegistry;

/**
 * Class ItemThemeInstaller
 *
 * Item themes are usually stored in /extensionName/views/css/themes/items/name-of-the-theme.
 * For the usage of this class it's assumed that you are using this very setup.
 * For all other setups please use ThemeRegistry directly. *
 *
 * Let's say you start with a regular setup and 'tao' as the default theme. You want to remove 'tao'
 * and install two of your own themes. The registry should eventually look like this.
 *
 * <code>
 * 'available' => [
 *      [
 *          'id' => 'taoFooDefault',
 *          'name' => 'TAO',
 *          'path' => '/taoFoo/views/css/themes/items/default/theme.css'
 *      ],
 *      [
 *          'id' => 'taoFooOther',
 *          'name' => 'The other one',
 *          'path' => '/taoFoo/views/css/themes/items/other/theme.css'
 *      ]
 * ],
 * 'default' => 'taoFooOther' // note the prefix
 * </code>
 *
 * The code for installs and updates is - apart from the themes - identical. All theme ids
 * will be prefixed with your extension id to avoid collisions. If you add the extension
 * prefix yourself it won't be doubled. The 'tao' theme is never prefixed.
 *
 * <code>
 * $themes = [
 *      'default' => 'The default theme', // equivalent to 'taoFooDefault' => 'The default theme'
 *      'other' => 'The other one'
 * ];
 *
 * $itemThemeInstaller = new ItemThemeInstaller('taoFoo'); // 'taoFoo' is the id of your extension
 * $itemThemeInstaller->add($themes);
 * </code>
 *
 *
 * Now you need to set a default theme, again there will be no prefix duplication
 *
 * <code>
 * $itemThemeInstaller->setDefault('default');
 * </code>
 *
 * Eventually you may want to remove the 'tao' theme. Note that ItemThemeInstaller::remove() also accepts
 * an array of ids as argument.
 *
 * <code>
 * $itemThemeInstaller->remove('tao');
 * // with array
 * $itemThemeInstaller->remove(['tao', 'foo', 'bar']);
 * </code>
 *
 * What if the label - the name under which the theme appears in the preview or during delivery - needs to be changed?
 *
 * <code>
 * $themes = [
 *      'default' => 'The new label'
 * ];
 * $itemThemeInstaller->update($themes);
 * </code>
 *
 * Finally you can also restore the defaults. This affects the current item extension only, themes from other extensions
 * stay registered. 'tao' however will be re-installed and set as default.
 *
 * <code>
 * $itemThemeInstaller->reset();
 * </code>
 *
 * During development you often have situations where you want to run the installer/updater multiple times. You can do
 * this for all methods without risking errors.
 *
 * @package oat\taoQtiItem\model\themes
 */
class ItemThemeInstaller
{

    use LoggerAwareTrait;

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
     * @return bool
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
        $this->logInfo('Item themes removed: ' . implode(',', $themeIds));
        return true;
    }


    /**
     * @param array $themes
     *
     * @return bool
     */
    public function add(array $themes) {

        foreach($themes as $themeId => $label) {
            $prefixedId =  $this->getPrefixedThemeId($themeId);
            if($this->themeExists($prefixedId)) {
                continue;
            }
            $this->register($themeId, $label);
        }

        $this->logInfo('Item themes registered: ' . implode(',', array_keys($themes)));
        return true;
    }


    /**
     * @param array $themes
     *
     * @return bool
     */
    public function update(array $themes) {
        foreach($themes as $themeId => $label) {
            $this->remove($themeId);
            $this->register($themeId, $label);
        }
        $this->logInfo('Item themes updated: ' . implode(',', array_keys($themes)));
        return true;
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
            $this->logInfo($themeId . ' not installed, could not set to default');
            return false;
        }
        $this->registry->setDefaultTheme('items', $prefixedId);

        $this->logInfo('Default item theme set to ' . $themeId);
        return true;
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

        $this->logInfo('Removed ' . $this->extensionId . ' themes, restored TAO default');
        return true;
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
