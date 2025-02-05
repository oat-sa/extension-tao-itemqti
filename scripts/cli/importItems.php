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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiItem\scripts\cli;

use common_exception_Error;
use common_report_Report;
use common_report_Report as Report;
use core_kernel_classes_Class;
use Exception;
use helpers_TimeOutHelper;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\action\Action;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use oat\taoQtiItem\model\qti\ImportService;
use oat\taoQtiItem\model\tasks\ImportQtiItem;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * Class importItems
 *
 * php index.php '\oat\taoQtiItem\scripts\cli\importItems' path_to_the_item_package
 * php index.php '\oat\taoQtiItem\scripts\cli\importItems' -p path_to_the_item_package -c class_name
 * php index.php '\oat\taoQtiItem\scripts\cli\importItems' -p path_to_the_item_package -c class_name -r -n
 *
 * @package oat\taoQtiItem\scripts\cli
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class importItems implements Action, ServiceLocatorAwareInterface
{
    use OntologyAwareTrait;
    use ServiceLocatorAwareTrait;

    protected $rollbackOnError = false;
    protected $rollbackOnWarning = false;
    protected $recurse = false;
    protected $directoryToClass = false;
    protected $processed = 0;
    protected $async = false;

    /**
     * @param array $params
     * @return Report
     * @throws \common_Exception
     */
    public function __invoke($params = [])
    {
        $fileName = null;
        $className = null;

        $showHelp = !count($params);

        while (count($params) && !$showHelp) {
            $param = array_shift($params);

            switch ($param) {
                case '-p':
                    $fileName = array_shift($params);
                    break;

                case '-c':
                    $className = array_shift($params);
                    break;

                case '-h':
                    $showHelp = true;
                    break;

                case '-e':
                    $this->rollbackOnError = true;
                    break;

                case '-r':
                    $this->recurse = true;
                    break;

                case '-n':
                    $this->directoryToClass = true;
                    break;

                case '-w':
                    $this->rollbackOnWarning = true;
                    break;

                case '-a':
                    $this->async = true;
                    break;

                default:
                    if (file_exists($param)) {
                        $fileName = $param;
                    }
            }
        }

        if ($showHelp) {
            return Report::createSuccess(
                "Import items\n"
                . "\n"
                . "Usage:\n"
                . "\tphp index.php '" . __CLASS__ . "' [PACKAGE] [OPTIONS]\n\n"
                . "Options:\n"
                . "\t -c <class>\t The name of the class in which import the items\n"
                . "\t -p <package>\t The path of a ZIP containing the items to import\n"
                . "\t -r\t\t Recurse in subdirectories\n"
                . "\t -n\t\t Create classes from directories names\n"
                . "\t -e\t\t Rollback on error\n"
                . "\t -w\t\t Rollback on warning\n"
                . "\t -h\t\t Show this help\n"
                . "\t -a\t\t Async import\n"
            );
        }

        if (!$fileName || !file_exists($fileName)) {
            throw new \common_Exception(
                "You must provide the path of an items package. "
                    . (isset($fileName) ? $fileName . " does not exists." : "Nothing provided!")
            );
        }

        $class = $this->getItemClass($className);

        $report = $this->importPath($fileName, $class);
        $report->setMessage($this->processed . ' packages processed');

        return $report;
    }

    /**
     * @param string $className
     * @param string $parentClass
     * @return core_kernel_classes_Class|null
     */
    protected function getItemClass($className = null, $parentClass = TaoOntology::ITEM_CLASS_URI)
    {
        $parentClass = $this->getClass($parentClass);

        if ($className) {
            $subClass = null;
            $className = str_replace('_', ' ', $className);

            $subClasses = $parentClass->getSubClasses();
            foreach ($subClasses as $instance) {
                if ($instance->getLabel() == $className) {
                    $subClass = $instance;
                    $this->showMessage("Loaded class: $className\n");
                    break;
                }
            }

            if (!$subClass) {
                $subClass = $parentClass->createSubClass($className);
                $this->showMessage("Created class: $className\n");
            }

            return $subClass;
        }

        return $parentClass;
    }

    /**
     * @param $message
     * @param array $params
     * @param string $type
     */
    protected function showMessage($message, $params = [], $type = Report::TYPE_SUCCESS)
    {
        if ($params) {
            $message .= "\n";
            foreach ($params as $key => $value) {
                $message .= "\t${key}: ${value}\n";
            }
        }

        $this->showReport(new Report($type, $message));
    }

    /**
     * @param common_report_Report $report
     */
    protected function showReport($report)
    {
        echo \tao_helpers_report_Rendering::renderToCommandline($report);
    }

    /**
     * @param string $path
     * @return array
     */
    protected function listPackages($path)
    {
        $packages = array_map(function ($fileName) use ($path) {
            $file = null;
            if ($fileName != '.' && $fileName != '..') {
                $fullPath = $path . DIRECTORY_SEPARATOR . $fileName;
                $info = pathinfo($fileName);

                if ((isset($info['extension']) && $info['extension'] == 'zip') || is_dir($fullPath)) {
                    $file = [
                        'path' => $fullPath,
                        'name' => $info['filename'],
                    ];
                }
            }
            return $file;
        }, scandir($path));

        return array_filter($packages, function ($file) {
            return $file != null;
        });
    }

    /**
     * @param string $path
     * @param core_kernel_classes_Class $class
     * @return common_report_Report
     * @throws common_exception_Error
     */
    protected function importPath($path, $class)
    {

        if (is_dir($path)) {
            $packages = $this->listPackages($path);

            if (count($packages)) {
                $finalReport = new Report(Report::TYPE_SUCCESS);

                foreach ($packages as $package) {
                    if ($this->directoryToClass) {
                        $packageClass = $this->getItemClass($package['name'], $class);
                    } else {
                        $packageClass = $class;
                    }

                    if (is_dir($package['path'])) {
                        if ($this->recurse) {
                            $report = $this->importPath($package['path'], $packageClass);
                        } else {
                            $report = null;
                        }
                    } else {
                        $report = $this->importPackage($package['path'], $packageClass);
                    }

                    if ($report && $report->getType() != Report::TYPE_SUCCESS) {
                        $finalReport->setType($report->getType());
                    }
                }

                return $finalReport;
            } else {
                return new Report(Report::TYPE_ERROR, 'No package to import!');
            }
        } else {
            return $this->importPackage($path, $class);
        }
    }

    /**
     * @param string $fileName
     * @param core_kernel_classes_Class $class
     * @return common_report_Report
     */
    protected function importPackage($fileName, $class)
    {
        $this->showMessage("Importing the items from $fileName");

        //the zip extraction is a long process that can exceed the 30s timeout
        helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);

        try {
            $importService = ImportService::singleton();
            if (!$this->async) {
                $report = $importService->importQTIPACKFile(
                    $fileName,
                    $class,
                    true,
                    $this->rollbackOnError,
                    $this->rollbackOnWarning,
                    true,
                    true,
                    false,
                    false,
                    true
                );
            } else {
                $task = ImportQtiItem::createTask(
                    $fileName,
                    $class,
                    $this->getServiceLocator(),
                    true,
                    true,
                    false,
                    false,
                    true
                );

                $report = new Report(Report::TYPE_INFO, printf('Task %s created', $task->getId()));
            }
        } catch (ExtractException $e) {
            $report = common_report_Report::createFailure(
                __('The ZIP archive containing the IMS QTI Item cannot be extracted.')
            );
        } catch (ParsingException $e) {
            $report = common_report_Report::createFailure(
                __('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.')
            );
        } catch (Exception $e) {
            $report = common_report_Report::createFailure(
                __("An unexpected error occured during the import of the IMS QTI Item Package.")
            );
        }

        helpers_TimeOutHelper::reset();

        $this->showReport($report);
        $this->processed++;

        return new Report($report->getType());
    }
}
