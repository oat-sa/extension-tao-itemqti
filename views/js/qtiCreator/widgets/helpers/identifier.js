define(['lodash'], function(_) {

    var _updateChoiceIdentifierInResponse = function(response, oldId, newId) {

        var escapedOldId = oldId.replace(/([.-])/g, '\\$1'),
                regex = new RegExp('\\b(' + escapedOldId + ')\\b');//@todo: to be tested in presence of special chars

        for (var i in response.correctResponse) {
            response.correctResponse[i] = response.correctResponse[i].replace(regex, newId);
        }

        var mapEntries = {};
        _.forIn(response.mapEntries, function(value, mapKey) {
            mapKey = mapKey.replace(regex, newId);
            mapEntries[mapKey] = value;
        });
        response.mapEntries = mapEntries;
    };

    var _updateChoiceIdentifier = _.throttle(function(choice, newId, response) {

        var oldId = choice.id();

        if (oldId !== newId) {
            //need to update correct response and mapping values too !
            _updateChoiceIdentifierInResponse(response, oldId, newId);

            //finally, set the new identifier to the choice
            choice.id(newId);
        }
    }, 200);


    var _cache = [];

    var _setCache = function(cache, element, value) {
        if (!_cache[cache]) {
            _cache[cache] = {};
        }
        _cache[cache][element.getSerial()] = value;
    };

    var _getCache = function(cache, element) {
        var serial = element.getSerial();
        if (serial && _cache[cache] && _cache[cache][serial]) {
            return _cache[cache][serial];
        }
        return null;
    };

    return {
        updateChoiceIdentifier: function(choice, value) {
            var response = _getCache('responseFromChoice', choice);
            if (!response) {
                response = choice.getInteraction().getResponseDeclaration();
                _setCache('responseFromChoice', choice, response);
            }
            _updateChoiceIdentifier(choice, value, response);
        },
        updateResponseIdentifier: function(response, value) {
            throw 'to be implemented';
        }
    };

});


