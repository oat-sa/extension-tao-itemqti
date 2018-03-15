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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 * @author Ilya Yarkavets <ilya.yarkavets@1pt.com>
 */

namespace oat\taoQtiItem\scripts\cli;


use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\TaoOntology;
use \common_report_Report as Report;
use oat\taoDevTools\helper\DataGenerator;

/**
 * Class clearLanguageVersionsScript
 * command line sample `sudo -u www-data /usr/bin/php7.0-ts /home/empty/www/act/index.php 'oat\taoQtiItem\scripts\cli\clearLanguageVersionsScript' -h`
 *
 * @author Ilya Yarkavets <ilya.yarkavets@1pt.com>
 * @package oat\taoQtiItem\scripts\cli
 */
class ClearLanguageVersionsScript extends ScriptAction
{

    const REVISION_EXTENSION_NAME = 'taoRevision';
    const DEFAULT_LANG            = 'en-US';

    const ITEM_CONFIG_NAME        = 'defaultItemFileSource';
    const ITEM_CONTENT_DIR        = 'itemContent';

    CONST DIRECTORY_STATE_EXISTS        = true;
    CONST DIRECTORY_STATE_INEXISTENT    = false;
    CONST DIRECTORY_STATE_UNKNOWN       = 'undef.';

    /**
     * Provides the title of the script.
     *
     * @return string
     */
    protected function provideDescription()
    {
        $message = 'TAO - The script that checks which items have many language versions and clear them if needed' . PHP_EOL;

        return $message;
    }

    /**
     * Provides the possible options.
     *
     * @return array
     */
    protected function provideOptions()
    {
        return [
            'showTimer'     => [
                'prefix'        => 'st',
                'longPrefix'    => 'show-timer',
                'cast'          => 'boolean',
                'required'      => false,
                'description'   => 'Modifier whether to show timer message',
                'defaultValue'  => 1
            ],
            'dryRun'   => [
                'prefix'        => 'd',
                'longPrefix'    => 'dry-run',
                'cast'          => 'boolean',
                'required'      => false,
                'description'   => (
                'Analyses and shows report for actual state without clearing.'
                ),
                'defaultValue'  => 0
            ],
            'wetRun'     => [
                'prefix'        => 'w',
                'longPrefix'    => 'wet-run',
                'cast'          => 'boolean',
                'required'      => false,
                'description'   => (
                    'Clears and shows report'
                    . PHP_EOL . "\t\033[1;33m" .
                    'Warning: will work on actual data, unless `-fs 1` will be provided .'
                    . "\033[0m"
                ),
                'defaultValue'  => 0
            ],
            'test'          => [
                'prefix'        => 't',
                'longPrefix'    => 'test',
                'cast'          => 'integer',
                'required'      => false,
                'description'   => 'Creates test data',
                'defaultValue'  => 0
            ],
            'failSafe' => [
                'prefix'        => 'fs',
                'longPrefix'    => 'failsafe',
                'cast'          => 'boolean',
                'required'      => false,
                'description'   => 'Corrupted items will be copied to class `Backup of corrupted (Y-m-d H:i:s)`. Works only',
                'defaultValue'  => 0
            ],
            'itemUri' => [
                'prefix'        => 'i',
                'longPrefix'    => 'itemuri',
                'cast'          => 'string',
                'required'      => false,
                'description'   => 'Analysis and clearance will take place only for given itemUri',
                'defaultValue'  => ''
            ]
        ];
    }

    protected function provideUsage()
    {
        return [
            'prefix'        => 'h',
            'longPrefix'    => 'help',
            'description'   => 'Shows this message'
        ];
    }

    /**
     * If timer needs to be shown
     *
     * @return mixed
     */
    protected function showTime()
    {
        return $this->getOption('showTimer');
    }

    /**
     * Runs the script
     *
     * @return Report
     */
    protected  function run()
    {
        if ($this->getOption('test') > 0) {
            $result = DataGenerator::generateMultilanguageItems($this->getOption('test'));

            if (!empty($result)) {
                $filePath = $this->createGenerationReport($this->getOption('test'), $result);

                $msg = 'Succesfully generated ' . $this->getOption('test') . ' problematic items.' . PHP_EOL;
                $msg .= 'You can see the report in ' . $filePath;
                return new Report(Report::TYPE_SUCCESS, $msg);
            } else {
                $msg = 'Nothing was generated';
                return new Report(Report::TYPE_ERROR, $msg);
            }
        }

        if ($this->getOption('dryRun')) {

            try {
                $analyzeResults = $this->analyze();

                $fPath = $this->createAnalyzeReport($analyzeResults['analyzeResult']);

                return new Report(Report::TYPE_SUCCESS, 'Analysis completed. See report - ' . $fPath);
            } catch (\Exception $e) {
                $msg = 'There was an error during analyzing. Error message: ' . $e->getMessage() . '. Logs may contain more info.';
                return new Report(Report::TYPE_ERROR, $msg);
            }
        }

        if ($this->getOption('wetRun')) {

            try {
                $analyzeResults = $this->analyze();
                $analyzeFPath = $this->createAnalyzeReport($analyzeResults['analyzeResult']);

                $clearanceResults = $this->clear($analyzeResults);

                $fPath = $this->createClearanceReport($analyzeResults, $clearanceResults);

                $msg = 'Analysis and clearance completed. See reports: ' . PHP_EOL;
                $msg .= $analyzeFPath . '(analyze report).' . PHP_EOL;
                $msg .= $fPath . '(clearance report).' . PHP_EOL;

                return new Report(Report::TYPE_SUCCESS, $msg);
            } catch (\Exception $e) {
                $msg = 'There was an error during analyzing and/or clearing. Error message: ' . $e->getMessage() . '. Logs may contain more info.';
                return new Report(Report::TYPE_ERROR, $msg);
            }
        }
    }

    /**
     * Analyze the situation with language versions
     *
     * @return array
     *
     * @throws \Exception
     */
    private function analyze()
    {
        $results = $this->queryForCorruptedItems();

        $filtered = $this->filterResults($results, true, true);

        if ($this->getOption('failSafe') && $this->getOption('wetRun')) {
            $this->failsafe($filtered);

            $filteredSubjects = [];
            foreach (array_keys($filtered) as $itemUri) {
                $filteredSubjects[] = $itemUri;
            }
            unset($results, $filtered);

            $results = $this->queryForCorruptedItems($filteredSubjects);

            $filtered = $this->filterResults($results, true, true);
        }

        $allLangFiles = [];

        if (!$this->isTaoRevisionInstalled()) {
            $filteredCopy = $filtered;

            foreach ($filteredCopy as $key => &$itemInfo) {
                $this->checkDirsExistence($itemInfo['uri'], $itemInfo['langs']);
            }

            foreach ($filteredCopy as $key => $itemInfo) {

                $langFiles = [];

                if ($itemInfo['langs'][self::DEFAULT_LANG]['fs'] === self::DIRECTORY_STATE_EXISTS) {
                    $langFiles[self::DEFAULT_LANG] = $this->getDirectoryFiles($itemInfo['uri'], self::DEFAULT_LANG);
                }

                foreach ($itemInfo['langs'] as $langInfo) {
                    if (
                        $langInfo['fs'] === self::DIRECTORY_STATE_INEXISTENT
                        || $langInfo['fs'] === self::DIRECTORY_STATE_UNKNOWN
                        || $langInfo['key'] === self::DEFAULT_LANG
                    ) {
                        continue;
                    }

                    $langFiles[$langInfo['key']] = $this->getDirectoryFiles($itemInfo['uri'], $langInfo['key']);
                }

                $allLangFiles[$itemInfo['uri']]['files'] = $langFiles;

                $report = $this->analyzeDifferences($langFiles);
                $allLangFiles[$itemInfo['uri']]['report'] = $report;
            }
        } else {
            throw new \Exception('Not implemented yet');
        }

        return [
            'fetchedData' => $filteredCopy,
            'analyzeResult' => $allLangFiles
        ];

    }

    /**
     * Will clear database and filesystem from unneded data
     *
     * @param array $analyzeResults
     *
     * @return array
     */
    private function clear(array $analyzeResults = [])
    {
        $clearanceResults = [];
        foreach ($analyzeResults['analyzeResult'] as $itemUri => $analyzeResult) {
            if ($analyzeResult['report']['STATUS'] === 'copy') {
                $fetchedData = $analyzeResults['fetchedData'][LOCAL_NAMESPACE . '#' . $itemUri];

                if ($this->needsCleanup($analyzeResult['report']['RECENT'], $fetchedData)) {
                    $this->cleanFs($itemUri, $analyzeResult['report']['RECENT'], $fetchedData, $this->getOption('failSafe'), $this->getOption('failSafe'));
                    $clearanceResults[$itemUri]['fs_status'] = 'Filesystem cleared from unneeded languages.';
                } else {
                    $clearanceResults[$itemUri]['fs_status'] = 'Filesystem does not need to be cleared.';
                }
                if ($this->needsCleanup($analyzeResult['report']['RECENT'], $fetchedData, 'db')) {
                    $this->cleanStorage($itemUri, $fetchedData, self::DEFAULT_LANG);
                    $clearanceResults[$itemUri]['storage_status'] = 'Storage cleared from unneeded languages';
                } else {
                    $clearanceResults[$itemUri]['storage_status'] = 'Storage does not need to be cleared.';
                }
            } else {
                $clearanceResults[$itemUri]['RESULT'] = 'Nothing to copy/remove and/or no data for language versions. Result from analyzer: '
                    . $analyzeResult['report']['RESULT'] . '. Possibly item has some warnings and/or errors';
                continue;
            }
        }


        return $clearanceResults;
    }

    /**
     * Query for all the corrupted items
     *
     * @param array $previousResults
     *
     * @return mixed
     *
     * @throws \Exception
     */
    private function queryForCorruptedItems(array $previousResults = [])
    {
        $qb = $this->getQueryBuilder();
        $qb->select('DISTINCT(s0_.id) AS dbId, s0_.subject AS itemUri, s0_.l_language AS itemLang, s0_.object AS object, s1_.object as itemName');
        $qb->from('statements', 's0_');

        $qb->innerJoin('s0_', 'statements', 's1_', 's1_.subject = s0_.subject AND s1_.predicate = :predicate')
            ->setParameter('predicate', 'http://www.w3.org/2000/01/rdf-schema#label');

        $qb->where('s0_.predicate = :predicateVal')
            ->setParameter('predicateVal', 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemContent');

        if ($this->getOption('itemUri') !== '') {
            $qb->andWhere('s0_.subject = :itemUri')
                ->setParameter('itemUri', $this->getOption('itemUri'));
        }

        if (!empty($previousResults)) {

            foreach ($previousResults as $key => &$val) {
                $val = $qb->expr()->literal($val);
            }

            $qb->andWhere($qb->expr()->notIn('s0_.subject', $previousResults));
        }

        $query = $qb->getSQL();
        $params = $qb->getParameters();

        $result = $this->getPersistence()->query($query, $params);

        if (!$result) {
            throw new \Exception('Error while fetching from storage');
        }

        $results = $result->fetchAll(\PDO::FETCH_ASSOC);

        if (empty($results)) {
            throw new \Exception('Nothing found in db, so nothing to analyze.');
        }

        return $results;
    }

    /**
     * Doctrines' query builder getter
     *
     * @return \Doctrine\DBAL\Query\QueryBuilder
     */
    private function getQueryBuilder()
    {
        return $this->getPersistence()->getPlatForm()->getQueryBuilder();
    }

    /**
     * Copies all fetched corrupted items to a backup class to lately operate on them, not on actual data
     *
     * @param array $results
     */
    private function failsafe(array $results = [])
    {
        $topClass = new \core_kernel_classes_Class(TaoOntology::ITEM_CLASS_URI);
        $class = $topClass->createSubClass('Backup of corrupted (' . (new \DateTime())->format('Y-m-d H:i:s') . ')');

        foreach (array_keys($results) as $itemUri) {
            $uri = $itemUri;
            $instance = new \core_kernel_classes_Resource($uri);
            \taoItems_models_classes_ItemsService::singleton()->cloneInstance($instance, $class);
        }
    }

    /**
     * Check if cleanup is needed
     *
     * @param $mostRecentLanguage
     * @param $fetchedItemData
     * @param string $type `fs` or `db`
     *
     * @return bool
     */
    private function needsCleanup($mostRecentLanguage, $fetchedItemData, $type = 'fs')
    {
        $isMostRecentLangDefault = $mostRecentLanguage === self::DEFAULT_LANG;

        if ($isMostRecentLangDefault && count($fetchedItemData['langs']) === 1) {
            return false;
        }

        $isOtherVersionsExistent = false;
        foreach ($fetchedItemData['langs'] as $langKey => $langData) {
            if ($langKey === self::DEFAULT_LANG) continue;

            if ($langData[$type]) {
                $isOtherVersionsExistent = true;
            }
        }

        return !$isMostRecentLangDefault || $isOtherVersionsExistent;
    }

    /**
     * Clean filesystem from unneeded files
     *
     * @param $itemUri
     * @param $mostRecentLanguage
     * @param array $fetchedItemData
     * @param bool $archiveBeforeCleaning
     * @param bool $failSafe
     */
    private function cleanFs($itemUri, $mostRecentLanguage, array $fetchedItemData, $archiveBeforeCleaning = false, $failSafe = true)
    {
        $itemDir = $this->getSingleItemDir($itemUri);

        $handler = opendir($itemDir);

        while (false !== ($fHandler = readdir($handler))) {
            if (
                in_array($fHandler, ['.', '..'])
                || (is_dir($itemDir . $fHandler) && $fHandler === $mostRecentLanguage)
            ) {
                continue;
            } else {
                if ($archiveBeforeCleaning && $fHandler === 'archive.zip') {
                    continue;
                } else {
                    $this->rrmdir($itemDir . $fHandler);
                }
            }
        }

        closedir($handler);

        if ($mostRecentLanguage !== self::DEFAULT_LANG) {
            rename($itemDir . $mostRecentLanguage, $itemDir . self::DEFAULT_LANG);
        }
    }

    /**
     * Do a cleanup in item folder
     *
     * @param $path
     * @param $folderToLeave
     * @param bool $needRename
     * @param string $newName
     * @param bool $leaveArchive
     */
    private function cleanupItemFolder($path, $folderToLeave, $needRename = false, $newName = '', $leaveArchive = false)
    {
        $handler = opendir($path);

        while (false !== ($fHandler = readdir($handler))) {
            if (
                in_array($fHandler, ['.', '..'])
                || (is_dir($path . $fHandler) && $fHandler === $folderToLeave)
            ) {
                continue;
            } else {
                if ($leaveArchive && $fHandler === 'archive.zip') {
                    continue;
                } else {
                    $this->rrmdir($path . $fHandler);
                }
            }
        }

        closedir($handler);

        if ($needRename) {
            rename($path . $folderToLeave, $path . $newName);
        }
    }

    /**
     * Recursively remove directory
     *
     * @param $dir
     */
    private function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (filetype($dir."/".$object) == "dir"){
                        $this->rrmdir($dir."/".$object);
                    }else{
                        unlink($dir."/".$object);
                    }
                }
            }
            reset($objects);
            rmdir($dir);
        }
    }

    /**
     * Cleans database storage (statements table) from unneeded data
     *
     * @param $itemUri
     * @param $fetchedData
     * @param $languageToLeave
     * @param bool $needRename
     * @param string $newName
     *
     * @throws \Exception
     */
    private function cleanStorage($itemUri, $fetchedData, $languageToLeave, $needRename = false, $newName = '')
    {
        foreach ($fetchedData['langs'] as $lang => $langData) {
            if ($lang === $languageToLeave) continue;

            $contentRecordId = $langData['id'];
            $contentObject   = $langData['obj'];
            $langObject      = $itemUri . DIRECTORY_SEPARATOR . self::ITEM_CONTENT_DIR . DIRECTORY_SEPARATOR . $lang;

            $qb = $this->getQueryBuilder();

            $qb->select('DISTINCT(s0_.subject) AS deletionSubject');

            $qb->from('statements', 's0_');

            $qb->where('s0_.object = :langObject')
                ->setParameter('langObject', $qb->expr()->literal($langObject));

            $result = $this->getPersistence()->query($qb->getSQL(), $qb->getParameters());

            if (!$result) {
                throw new \Exception('Error while fetching from storage');
            }

            $results = $result->fetchAll(\PDO::FETCH_COLUMN);
            unset($qb);

            $deletionQb = $this->getQueryBuilder();

            $deletionQb->delete('statements', 's0_');
            $deletionQb->where('s0_.id = :contentRecordId')->setParameter('contentRecordId', $contentRecordId);
            $deletionQb->orWhere('s0_.subject = :contentObject')->setParameter('contentObject', $contentObject);

            if (!empty($results)) {

                foreach ($results as $key => &$val) {
                    $val = $deletionQb->expr()->literal($val);
                }

                $deletionQb->orWhere($deletionQb->expr()->in('s0_.subject', $results));
            }

            $this->getPersistence()->query($deletionQb->getSQL(), $deletionQb->getParameters());
        }

    }

    /**
     * Copy a file, or recursively copy a folder and its contents
     *
     * @param string $source Source path
     * @param string $dest Destination path
     * @param int $permissions New folder creation permissions
     *
     * @return bool Returns true on success, false on failure
     */
    private function rCopy($source, $dest, $permissions = 0755)
    {
        // Check for symlinks
        if (is_link($source)) {
            return symlink(readlink($source), $dest);
        }

        // Simple copy for a file
        if (is_file($source)) {
            return copy($source, $dest);
        }

        // Make destination directory
        if (!is_dir($dest)) {
            mkdir($dest, $permissions);
        }

        // Loop through the folder
        $dir = dir($source);
        while (false !== $entry = $dir->read()) {
            // Skip pointers
            if ($entry == '.' || $entry == '..') {
                continue;
            }

            // Deep copy directories
            $this->rCopy("$source/$entry", "$dest/$entry", $permissions);
        }

        // Clean up
        $dir->close();
        return true;
    }

    /**
     * Returns the access to default persistence
     *
     * @return \common_persistence_Persistence
     */
    private function getPersistence()
    {
        /** @var \common_persistence_SqlPersistence $persistence */
        return \common_persistence_Manager::getPersistence('default');
    }

    /**
     * Filter database results
     *
     * @param array $dataset
     * @param bool $initial
     * @param bool $deep
     *
     * @return array
     */
    private function filterResults(array $dataset = [], $initial = true, $deep = false)
    {
        if (empty($dataset)) {
            return $dataset;
        }

        if ($initial) {
            $filtered = [];
            foreach ($dataset as $value) {
                $key = $value['itemLang'];// === self::DEFAULT_LANG ? 'default' : count($filtered[$value['itemUri']]['langs']);
                if (array_key_exists($value['itemUri'], $filtered)) {
                    $filtered[$value['itemUri']]['langs'][$key] = [
                        'key'   => $value['itemLang'],
                        'db'    => self::DIRECTORY_STATE_EXISTS,
                        'fs'    => self::DIRECTORY_STATE_UNKNOWN,
                        'id'    => $value['dbId'],
                        'obj'   => $value['object'],
                        'name'  => $value['itemName']
                    ];
                } else {
                    $filtered[$value['itemUri']] = [
                        'uri'       => \tao_helpers_Uri::getUniqueId($value['itemUri']),
                        'langs'     => [
                            $key => [
                                'key'   => $value['itemLang'],
                                'db'    => self::DIRECTORY_STATE_EXISTS,
                                'fs'    => self::DIRECTORY_STATE_UNKNOWN,
                                'id'    => $value['dbId'],
                                'obj'   => $value['object'],
                                'name'  => $value['itemName']
                            ]
                        ]
                    ];
                }
            }

            unset($dataset);
        } else {
            $filtered = $dataset;
            unset($dataset);
        }

        if ($deep) {
            foreach ($filtered as $key => $value) {
                if (count($value['langs']) === 1 && array_key_exists(self::DEFAULT_LANG, $value['langs'])) {
                    unset($filtered[$key]);
                }
            }
        }

        return $filtered;
    }

    /**
     * Get items data root directory
     *
     * @return string
     */
    private function getItemsDataDir()
    {
        return $this->getItemsDataDirObject()->getFileSystem()->getAdapter()->getPathPrefix();
    }

    /**
     * Get items data root directory object
     *
     * @return Directory
     */
    private function getItemsDataDirObject()
    {
        $filesystemId = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById('taoItems')
            ->getConfig(self::ITEM_CONFIG_NAME);

        return $this->getServiceLocator()
            ->get(FileSystemService::SERVICE_ID)
            ->getDirectory($filesystemId);
    }

    /**
     * Check if language version dir existent
     *
     * @param $itemUri
     * @param array $languageInfo
     */
    private function checkDirsExistence($itemUri, array &$languageInfo)
    {
        $pathPrefix = $this->getItemsDataDir() . $itemUri . DIRECTORY_SEPARATOR . self::ITEM_CONTENT_DIR;

        foreach ($languageInfo as $key => $value) {
            $langPath = $pathPrefix . DIRECTORY_SEPARATOR . $value['key'];
            $languageInfo[$key]['fs'] = is_dir($langPath);
        }
    }

    /**
     * Get list of directory files with paths
     *
     * @param $itemUri
     * @param string $languageWith
     *
     * @return array
     */
    private function getDirectoryFiles($itemUri, $languageWith = self::DEFAULT_LANG)
    {
        $path = $this->getItemsDataDir() . $itemUri
            . DIRECTORY_SEPARATOR . self::ITEM_CONTENT_DIR . DIRECTORY_SEPARATOR
            . $languageWith;

        $fileList  = $this->scan($path);

        return $fileList;

    }

    /**
     * Just returns single item directory
     *
     * @param $itemUri
     *
     * @return string
     */
    private function getSingleItemDir($itemUri)
    {
        return $this->getItemsDataDir() . $itemUri
            . DIRECTORY_SEPARATOR . self::ITEM_CONTENT_DIR . DIRECTORY_SEPARATOR;
    }

    /**
     * Recursively scan directory
     *
     * @param $path
     * @param int $lvl recursion level
     * @param array $files
     *
     * @return array an array of files
     */
    private function scan($path, &$lvl = 0, array &$files = [])
    {
        $handler = opendir($path);

        $files = [];
        while (false !== ($fHandler = readdir($handler))) {
            if (in_array($fHandler, ['.', '..'])) {
                continue;
            }
            if (is_dir($path . '/' . $fHandler)) {
                $lvl++;
                $result = $this->scan($path . '/' . $fHandler, $lvl, $files);
                $lvl--;
                if (!empty($result)) {
                    array_merge($files, $result);
                }
                continue;
            }

            if ($fHandler === 'qti.xml') {
                if ($lvl > 0) {
                    $files['additional']['main'][] = [
                        'modificationTime' => filemtime($path . '/' . $fHandler),
                        'path'  => $path,
                        'name'  => $fHandler
                    ];
                } else {
                    $files['main'] = [
                        'modificationTime' => filemtime($path . '/' . $fHandler),
                        'path'  => $path,
                        'name'  => $fHandler
                    ];
                }
            } else {
                $files['additional'][] = [
                    'modificationTime' => filemtime($path . '/' . $fHandler),
                    'path'  => $path,
                    'name'  => $fHandler
                ];
            }
        }

        closedir($handler);

        return $files;
    }

    /**
     * Analyzes differences between language versions
     *
     * @param array $itemFilesInfo
     *
     * @return array
     */
    private function analyzeDifferences(array $itemFilesInfo)
    {
        $differences = [];
        $mTimes = [];
        foreach ($itemFilesInfo as $lang => $filesInfo) {
            if (!array_key_exists('main', $filesInfo)) {
                if (
                    array_key_exists('additional', $filesInfo)
                    && array_key_exists('main', $filesInfo['additional'])
                    && !empty($filesInfo['additional']['main'])
                ) {
                    if (count($filesInfo['additional']['main']) > 1) {
                        $differences['ERROR'][] = 'Language version for `' . $lang . '` contains several item XMLs (not stored in root dir)';
                        continue;
                    } else {
                        $differences['WARNING'][] = 'Item XML for `' . $lang . '` version is not in the root directory.';
                        $mTimes[$lang] = $filesInfo['additional']['main'][0]['modificationTime'];
                    }
                } else {
                    $differences['ERROR'][] = 'Language version for `' . $lang . '` misses item XML';
                    continue;
                }
            } else {
                if (
                    array_key_exists('additional', $filesInfo)
                    && array_key_exists('main', $filesInfo['additional'])
                    && !empty($filesInfo['additional']['main'])
                ) {
                    $differences['ERROR'][] = 'Language version for `' . '` contains several item XMLs';
                    continue;
                }
                $mTimes[$lang] = $filesInfo['main']['modificationTime'];
            }
        }

        $differences['RECENTS'] = $mTimes;
        if (array_key_exists('ERROR', $differences) && !empty($differences['ERROR'])) {
            $differences['RESULT'] = 'The item won\'t be processed through this script as it contains errors. Merge it by hands';
            $differences['STATUS'] = 'leave';
        } else {
            if (count($mTimes) === 1) {
                $differences['RESULT'] = 'The item has XML only for `' . (array_keys($mTimes)[0]) . '` lang version. So it is the most recent';
                $differences['STATUS'] = 'copy';
                $differences['RECENT'] = array_keys($mTimes)[0];
            } elseif (count($mTimes) === 0) {
                $differences['RESULT'] = 'Item contains no `qti.xml` for any language version';
                $differences['ERROR'][] = 'Item contains no `qti.xml` for any language version';
                $differences['STATUS'] = 'leave';
            } else {
                $mostRecentLanguageVersion = array_flip($mTimes)[max($mTimes)];
                $differences['RESULT'] = 'The most recent version is `' . $mostRecentLanguageVersion . '`. So it will be copied over '
                    . self::DEFAULT_LANG . ' version (with all its files)';
                $differences['STATUS'] = 'copy';
                $differences['RECENT'] = $mostRecentLanguageVersion;
            }
        }

        return $differences;
    }

    /**
     * Creates report after analyzing filesystem and storage
     *
     * @param array $analyzeResults
     *
     * @return string
     *
     * @throws \Exception
     */
    private function createAnalyzeReport(array $analyzeResults)
    {
        $reportArray = [];
        foreach ($analyzeResults as $itemUri => $data) {
            $reportArray[$itemUri] = [
                $itemUri,
                implode('|', array_keys($data['files']))
            ];

            $reportData  = $data['report'];
            $hasWarnings = array_key_exists('WARNING', $reportData) && !empty($reportData['WARNING']);
            $hasErrors   = array_key_exists('ERROR', $reportData) && !empty($reportData['ERROR']);

            foreach ($reportData['RECENTS'] as $lang => $mTime) {
                $reportArray[$itemUri][] = $lang . ': ' . (new \DateTime('@' .(int)$mTime))->format('Y-m-d H:i:s');
            }

            if ($hasWarnings) {
                $reportArray[$itemUri][] = 'WARNING: ' . current($reportData['WARNING']);
            }

            if ($hasErrors) {
                $reportArray[$itemUri][] = 'ERROR: ' . current($reportData['ERROR']);
            }

            $reportArray[$itemUri][] = 'STATUS: ' . $reportData['RESULT'] . ($hasWarnings ? 'See warnings' : '');

            $reportArray[$itemUri][] = 'Files overview: ' . json_encode($data['files']);
        }

        try {
            $filePath = FILES_PATH . 'tmp/language-versions';
            if (!is_dir($filePath)) {
                mkdir($filePath);
            }
            $fileName = 'analyzeReport.csv';
            $fHandler = fopen($filePath . DIRECTORY_SEPARATOR . $fileName, 'w');
            foreach ($reportArray as $data) {
                fputcsv($fHandler, $data, ';');
            }

            fclose($fHandler);

            return $filePath . DIRECTORY_SEPARATOR . $fileName;
        } catch (\Exception $e) {
            throw new \Exception('Analyze report could not be written to filesystem. Actual error: ' . $e->getMessage());
        }
    }

    /**
     * Debugging function - just saves array of data to json
     *
     * @param array $dumped
     *
     * @throws \Exception
     */
    private function saveDumpData(array $dumped = [])
    {
        try {
            $filePath = FILES_PATH . 'tmp/language-versions';
            if (!is_dir($filePath)) {
                mkdir($filePath);
            }
            $fileName = 'dump.json';
            $fHandler = fopen($filePath . DIRECTORY_SEPARATOR . $fileName, 'w');
            fwrite($fHandler, json_encode($dumped));
            fclose($fHandler);
        } catch (\Exception $e) {
            throw new \Exception('Data could not be dumped to filesystem. Actual error: ' . $e->getMessage());
        }
    }

    /**
     * Creates report on generating test data
     *
     * @param $count
     * @param array $generationData
     *
     * @return string
     *
     * @throws \Exception
     */
    private function createGenerationReport($count, array $generationData)
    {
        try {
            $filePath = FILES_PATH . 'tmp/language-versions';
            $fileName = 'generation-report.csv';
            if (!is_dir($filePath)) {
                mkdir($filePath);
            }
            $fHandler = fopen($filePath . DIRECTORY_SEPARATOR . $fileName, 'w');
            foreach ($generationData as &$data) {
                $data['langs'] = implode('|', $data['langs']);
                fputcsv($fHandler, $data, ';');
            }

            fclose($fHandler);
        } catch (\Exception $e) {
            throw new \Exception('Generation report could not be written to filesystem. Actual error: ' . $e->getMessage());
        }

        return $filePath . DIRECTORY_SEPARATOR . $fileName;
    }

    /**
     * Create report after clearing filesystem and storage took place
     *
     * @param array $analyzeResults
     * @param array $clearanceResults
     *
     * @return string
     *
     * @throws \Exception
     */
    private function createClearanceReport(array $analyzeResults, array $clearanceResults)
    {
        $reportArray = [];
        foreach ($clearanceResults as $itemUri => $data) {
            $itemFullUri = LOCAL_NAMESPACE . '#' . $itemUri;

            $fetchedData = $analyzeResults['fetchedData'][$itemFullUri];
            $analyzeData = $analyzeResults['analyzeResult'][$itemUri];

            $itemName = array_key_exists(self::DEFAULT_LANG, $fetchedData['langs']) ? $fetchedData['langs'][self::DEFAULT_LANG]['name'] : 'No name';

            $reportArray[$itemUri] = [
                $itemName,
                $itemUri,
            ];

            if (array_key_exists('RECENTS', $analyzeData['report'])) {
                foreach ($analyzeData['report']['RECENTS'] as $lang => $modificationTime) {
                    $reportArray[$itemUri][] = $lang . ': ' . (new \DateTime('@' . (int)$modificationTime))->format('Y-m-d H:i:s');
                }
                $reportArray[$itemUri][] = 'Analyze result: ' . $analyzeData['report']['RESULT'];
            } else {
                $reportArray[$itemUri][] = 'Nothing recent was found. Analyze result: ' . $analyzeData['report']['RESULT'];
            }

            $clearanceResult = array_key_exists('RESULT', $data)
                ? $data['RESULT']
                : (
                    (array_key_exists('fs_status', $data) ? $data['fs_status'] . PHP_EOL : '')
                    . (array_key_exists('storage_status', $data) ? $data['storage_status'] . PHP_EOL : '')
                )
            ;
            $reportArray[$itemUri][] = 'Clearance result: ' . PHP_EOL . $clearanceResult;
        }

        try {
            $filePath = FILES_PATH . 'tmp/language-versions';
            $fileName = 'clearance-report.csv';
            if (!is_dir($filePath)) {
                mkdir($filePath);
            }
            $fHandler = fopen($filePath . DIRECTORY_SEPARATOR . $fileName, 'w');
            foreach ($reportArray as &$data) {
                fputcsv($fHandler, $data, ';');
            }

            fclose($fHandler);

            return $filePath;
        } catch (\Exception $e) {
            throw new \Exception('Clearance report could not be written to filesystem. Actual error: ' . $e->getMessage());
        }
    }

}