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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

/**
 * Generate sample items
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
require_once dirname(__FILE__) .'/../../../tao/includes/raw_start.php';

use common_report_Report as Report;
use oat\taoQtiItem\scripts\import\ItemGenerator;
use oat\oatbox\service\ServiceManager;

$options = getopt('', [
    'level',
    'level-class',
    'items',
    'root-class-uri',
    'help'
]);

if(isset($options['help'])){

    echo helpers_Report::renderToCommandline(new Report(Report::TYPE_INFO, "
Usage
$> php {$argv[0]}

    --level          (optional)   int      how deep the class structure is, default to 4
    --level-class    (optional)   int      how many class per level, default to 4
    --items          (optional)   int      how many items per class, default to 50
    --root-class-uri (optional)   string   URI of the class that contains the structure, default to the root item class
    --verbose        (optional)            display more infos and logs, default is false
    "));
} else {

    $action = new ItemGenerator();
    $action->setServiceLocator(ServiceManager::getServiceManager());

    $report = $action($options);

    echo helpers_Report::renderToCommandline($report);

}
