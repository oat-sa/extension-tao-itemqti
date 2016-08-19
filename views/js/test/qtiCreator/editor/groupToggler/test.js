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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA
 **/
define([
    'jquery',
    'taoQtiItem/qtiCreator/editor/ckEditor/groupToggler'
], function ($, groupToggler){
    'use strict';

    QUnit.test('api', function(assert){
        assert.ok(typeof groupToggler === 'function', 'is a function');
        assert.ok(typeof  groupToggler().register === 'function', 'is a function');
    });

    QUnit.asyncTest('register/trigger', function(assert){

        var gpeToggler = groupToggler().on('error', function(){
            assert.ok(false, 'should not trigger an error');
        });
        var $trigger1 = $('#trigger1');
        var $trigger2 = $('#trigger2');
        var $trigger3 = $('#trigger3');

        gpeToggler.register($trigger1);
        gpeToggler.register($trigger2);
        gpeToggler.register($trigger3);

        assert.ok($trigger1.data('group-toggler-id'), 'group toggler id set');
        assert.ok($trigger2.data('group-toggler-id'), 'group toggler id set');
        assert.ok($trigger3.data('group-toggler-id'), 'group toggler id set');

        $trigger2.on('showanother.grouptoggler', function(){
            assert.ok(true, 'trigger 2 informed');
        }).on('show.grouptoggler', function(){
            assert.ok(false, 'should not be triggered 2');
        });

        $trigger3.on('showanother.grouptoggler', function(){
            assert.ok(true, 'trigger 3 informed');
        }).on('show.grouptoggler', function(){
            assert.ok(false, 'should not be triggered 3');
        });

        $trigger1.on('showanother.grouptoggler', function(){
            assert.ok(false, 'should not be triggered 1');
        }).on('show.grouptoggler', function(){
            assert.ok(true, 'trigger 1 triggered');
            QUnit.start();
        }).trigger('show.grouptoggler');

    });

    QUnit.asyncTest('multi-register/trigger', function(assert){

        var gpeToggler = groupToggler().on('error', function(){
            assert.ok(false, 'should not trigger an error');
        });
        var $trigger1 = $('#trigger1');
        var $trigger2 = $('#trigger2');
        var $trigger3 = $('#trigger3');

        //registering the same element multiple times has no impact on the outcome
        gpeToggler.register($trigger1);
        gpeToggler.register($trigger1);
        gpeToggler.register($trigger2);
        gpeToggler.register($trigger2);
        gpeToggler.register($trigger3);
        gpeToggler.register($trigger3);

        assert.ok($trigger1.data('group-toggler-id'), 'group toggler id set');
        assert.ok($trigger2.data('group-toggler-id'), 'group toggler id set');
        assert.ok($trigger3.data('group-toggler-id'), 'group toggler id set');

        $trigger2.on('showanother.grouptoggler', function(){
            assert.ok(true, 'trigger 2 informed');
        }).on('show.grouptoggler', function(){
            assert.ok(false, 'should not be triggered 2');
        });

        $trigger3.on('showanother.grouptoggler', function(){
            assert.ok(true, 'trigger 3 informed');
        }).on('show.grouptoggler', function(){
            assert.ok(false, 'should not be triggered 3');
        });

        $trigger1.on('showanother.grouptoggler', function(){
            assert.ok(false, 'should not be triggered 1');
        }).on('show.grouptoggler', function(){
            assert.ok(true, 'trigger 1 triggered');
            QUnit.start();
        }).trigger('show.grouptoggler');

    });

    QUnit.asyncTest('error', function(assert){
        var gpeToggler = groupToggler().on('error', function(){
            assert.ok(true, 'error triggered');
            QUnit.start();
        });
        var $trigger1 = $('#trigger-not-existing');

        gpeToggler.register($trigger1);
    });

});

