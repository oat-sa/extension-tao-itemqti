<?php
/*
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
 */
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title><?=get_data('title')?></title>

        <!-- user CSS -->
        <?foreach(get_data('stylesheets') as $stylesheet):?>
            <link rel="stylesheet" type="text/css" href="<?=$stylesheet['href']?>" media="<?=$stylesheet['media']?>" />
        <?endforeach?>

        <script id="initQtiRunner" type="text/javascript">
            (function(){
                window.tao = window.tao || {};
                window.tao.qtiRunnerContext = {
                    ctx : <?=json_encode(get_data('runtimeContext'))?>,
                    itemData : <?=json_encode(get_data('itemData'))?>,
                    variableElements : <?=json_encode(get_data('contentVariableElements'))?>,
                    userVars : <?=json_encode(get_data('js_variables'))?>,
                    customScripts : <?=json_encode(get_data('javascripts'))?>
                };
            }());
        </script>

        <?if(tao_helpers_Mode::is('production')):?>
            <script type="text/javascript" src="<?=get_data('ctx_base_www')?>js/runtime/qtiLoader.min.js"></script>
        <?else:?>
            <script type="text/javascript" 
                    src="<?=get_data('ctx_taobase_www')?>js/lib/require.js"
                    data-main="<?=get_data('ctx_base_www')?>js/runtime/qtiLoader">
            </script>
        <?endif;?>

    </head>
    <body>
        <div id="qti_item"></div>
        <div class="qti_control tao-scope">
            <button 
                href="#" 
                id="qti-submit-response" 
                class="btn-info"
                <?if(get_data('ctx_raw_preview')):?>style="visibility:hidden;"<?endif?>
                >
                    <?=__("Submit");?>
            </button>
        </div>
    </body>
</html>
