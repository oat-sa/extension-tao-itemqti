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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 *
 */

namespace oat\taoQtiItem\controller;

use tao_actions_CommonModule;
use oat\taoQtiItem\helpers\CssHelper;
use tao_helpers_Request;
use common_exception_IsAjaxAction;
use common_exception_MissingParameter;
use common_exception_InvalidArgumentType;



/**
 * Class QtiCssAuthoring
 *
 * @package oat\taoQtiItem\controller
 */
class QtiCssAuthoring extends tao_actions_CommonModule {

    /**
     * Save custom CSS as file
     *
     * @throws \common_exception_IsAjaxAction
     */
    public function save() {
        if (!tao_helpers_Request::isAjax()) {
            throw new common_exception_IsAjaxAction(__CLASS__.'::'.\Context::getInstance()->getActionName());
        }
        CssHelper::save($this -> getCssArray());
    }

    /**
     * Load the custom styles as JSON
     *
     * @throws \common_exception_IsAjaxAction
     * @throws \common_exception_MissingParameter
     */
    public function load() {

        if (!tao_helpers_Request::isAjax()) {
            throw new common_exception_IsAjaxAction(__CLASS__.'::'.\Context::getInstance()->getActionName());
        }

        if (!$this->hasRequestParameter('stylesheetUri')) {
            throw new common_exception_MissingParameter('stylesheetUri', __CLASS__.'::'.\Context::getInstance()->getActionName());
        }

        $cssJson = CssHelper::loadCssFile();
        echo $cssJson;
    }

    /**
     * Convert CSS JSON to array
     *
     * @return mixed
     * @throws \common_exception_MissingParameter
     * @throws \common_exception_InvalidArgumentType
     */
    private function getCssArray() {
        if (!$this->hasRequestParameter('cssJson')) {
            throw new common_exception_MissingParameter('cssJson', __CLASS__.'::'.\Context::getInstance()->getActionName());
        }
        $cssArr = json_decode($_POST['cssJson'], true);
        if(!is_array($cssArr)) {
            throw new common_exception_InvalidArgumentType(__CLASS__,\Context::getInstance()->getActionName(), 0, 'json encoded array');
        }
        return $cssArr;

    }

    /**
     * Download custom styles
     */
    public function download(){
        $cssArr = $this -> getCssArray();
        header('Set-Cookie: fileDownload=true'); //used by jquery file download to find out the download has been triggered ...
        setcookie('fileDownload','true', 0, '/');
        header('Content-type: application/octet-stream');
        header('Content-Disposition: attachment; filename=tao-custom-styles.css');
        echo CssHelper::arrayToCss($cssArr);
    }

}
