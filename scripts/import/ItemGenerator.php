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

namespace oat\taoQtiItem\scripts\import;

use common_report_Report as Report;
use core_kernel_class_Class;
use helpers_Report;
use oat\oatbox\action\Action;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\service\ConfigurableService;


/**
 * Import NCCER items.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class ItemGenerator extends ConfigurableService implements Action
{

    /**
     * @var Report the report we keep and display
     */
    private $report;

    private $level = 4;

    private $levelClass = 4;

    private $items = 50;

    private $verbose = false;

    private $rootClassUri = TAO_ITEM_CLASS;

    public function __construct()
    {
        //manually load dependency...
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoMediaManager')->load();

        parent::__construct();
    }

    /**
     * Parse the input parameters to class members.
     * Only a very first verification and transformation are done.
     *
     * @param array $params the input parameters (see the _invoke method for details)
     */
    private function parseParams($params)
    {
        if (isset($params['level'])) {
            $this->level = (int) $params['level'];
        }

        if (isset($params['level-class'])) {
            $this->levelClass = (int) $params['level-class'];
        }

        if (isset($params['items'])) {
            $this->items = (int) $params['items'];
        }

        if (isset($params['root-class-uri']) && strlen(trim($params['root-class-uri'])) > 0 ) {
            $this->rootClassUri = trim($params['root-class-uri']);
        }

        if (isset($params['verbose'])) {
            $this->verbose = true;
        }
    }

    /**
     * Action entry point
     *
     * @param array $params the script arguments
     *                      => level how deep is the hierarchy
     *                      => level-class number of class per level
     *                      => items number of item per class
     *                      => verbose mode
     *
     * @return Report the action report
     *
     * @see \oat\oatbox\action\Action::__invoke()
     */
    public function __invoke($params)
    {
        $this->parseParams($params);

        if ( $this->level <= 0 || $this->items <= 0 || $this->levelClass <= 0 ){
            $this->err('Wrong level or items number to generate');
        } else {

            $totalItems = $this->level * $this->levelClass * $this->items;
            $totalClass = $this->level * $this->levelClass;
            $this->info("{$totalItems} items distributed over {$totalClass} classes and {$this->level} levels");

            $this->generate();

            $this->ok('🚀 one 🚀');
        }

        return $this->report;
    }

    protected function generate()
    {
        $rootClasses = [new \core_kernel_classes_Class($this->rootClassUri)];
        $i = 0;
        do {
            $classes = [];
            foreach($rootClasses as $rootClass){
                $classes = array_merge($classes, $this->createLevelClasses($rootClass, $i));
            }
            $this->info(count($classes) . ' classes generated for level ' . $i);

            if($i == $this->level - 1){
                $items = [];
                foreach($classes as $class){
                    $items[] = array_merge($items, $this->createItems($class));
                }
                $this->info(count($items) . ' items generated for level ' . $i);
            }

            $rootClasses = $classes;

            $i++;
        } while($i < $this->level);
    }

    private function createLevelClasses($rootClass, $level)
    {
        $classes = [];
        for ($i = 0; $i < $this->levelClass; $i++){
            $classes[] = $rootClass->createSubClass('structure-' . $level . '-' . $i);
        }
        return $classes;
    }

    private function createItems($class)
    {
        $items = [];
        for ($i = 0; $i < $this->items; $i++){
            $items[] = $class->createInstance('Item ' . $i);
        }
        return $items;
    }

    /**
     * Convenience method to print/accumulate the reports
     *
     * @param string $type    the report level
     * @param string $message the report content
     */
    private function out($type, $message)
    {
        $report = new Report($type, $message);
        if ($this->verbose == true) {
            echo helpers_Report::renderToCommandline($report);
        } else {
            if (is_null($this->report)) {
                $this->report = $report;
            } else {
                $this->report->add($report);
            }
        }
    }

    /**
     * Reports success
     *
     * @param string $message the report content
     */
    private function ok($message)
    {
        $this->out(Report::TYPE_SUCCESS, $message);
    }

    /**
     * Reports errors
     *
     * @param string $message the report content
     */
    private function err($message)
    {
        $this->out(Report::TYPE_ERROR, $message);
    }

    /**
     * Reports warnings
     *
     * @param string $message the report content
     */
    private function warn($message)
    {
        $this->out(Report::TYPE_WARNING, $message);
    }

    /**
     * Reports infos
     *
     * @param string $message the report content
     */
    private function info($message)
    {
        $this->out(Report::TYPE_INFO, $message);
    }
}
