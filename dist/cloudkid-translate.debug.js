!function(window, $, undefined) {
    var Translate = {};
    Translate.VERSION = "1.0.5";
    var _dict = null, _current = null, _locale = null, _fallbackLocale = null, _slice = Array.prototype.slice;
    Translate.load = function(dict, langOrCallback, callback) {
        var lang = null;
        if ("function" == typeof langOrCallback ? callback = langOrCallback : "string" == typeof langOrCallback && (lang = langOrCallback), 
        "string" == typeof dict) {
            var onLoaded = function(data) {
                Translate.load(data, lang), callback && callback();
            };
            $.get(dict, onLoaded, "json");
        } else _dict = _dict || {}, lang ? (_dict[lang] = dict, _locale = lang) : $.extend(_dict, dict), 
        refresh();
        return Translate;
    }, Translate.fileSeparator = "_", Translate.reset = function() {
        return _dict = _locale = _fallbackLocale = _current = null, Translate;
    }, Translate.autoDetect = function(useCountryLocale) {
        var lang = window.navigator.userLanguage || window.navigator.language;
        useCountryLocale = useCountryLocale === undefined ? !0 : useCountryLocale;
        var langOnly = lang.substr(0, 2);
        return _locale = useCountryLocale ? [ lang, langOnly ] : langOnly, refresh(), _locale;
    }, Object.defineProperty(Translate, "fallbackLocale", {
        set: function(locale) {
            _fallbackLocale = locale, refresh();
        },
        get: function() {
            return _fallbackLocale;
        }
    }), Object.defineProperty(Translate, "locale", {
        set: function(locale) {
            _locale = locale, refresh();
        },
        get: function() {
            return _locale;
        }
    });
    var refresh = function() {
        if (_locale && _dict) {
            _current = {};
            for (var locales = getLocales(), i = locales.length - 1; i >= 0; i--) {
                var lang = locales[i];
                $.extend(_current, _dict[lang] || {});
            }
            $("[data-localize]")._t(), $("[data-localize-file]")._f();
        }
    }, getLocales = function() {
        var locales = "string" == typeof _locale ? [ _locale ] : _locale.slice(0);
        return _fallbackLocale && -1 == locales.indexOf(_fallbackLocale) && locales.push(_fallbackLocale), 
        locales;
    }, translateString = function(key) {
        if (!_current) throw "Must call Translate.load() before getting the translation";
        if (!_current.hasOwnProperty(key)) throw "No translation string found matching '" + key + "'";
        return key = _current[key], args = _slice.call(arguments), args[0] = key, printf.apply(null, args);
    }, translateFile = function(file) {
        if (!_locale) return file;
        for (var url, lang, locales = getLocales(), index = file.lastIndexOf("."), http = new XMLHttpRequest(), i = 0, len = locales.length; len > i; i++) if (lang = locales[i], 
        url = file.substring(0, index) + Translate.fileSeparator + lang + file.substring(index, file.length), 
        http.open("HEAD", url, !1), http.send(), 404 != http.status) return url;
        return file;
    }, printf = function(str, args) {
        return arguments.length < 2 ? str : (args = $.isArray(args) ? args : _slice.call(arguments, 1), 
        str.replace(/([^%]|^)%(?:(\d+)\$)?s/g, function(p0, p, position) {
            return position ? p + args[parseInt(position) - 1] : p + args.shift();
        }).replace(/%%s/g, "%s"));
    };
    $.fn._t = function() {
        var args = arguments;
        return this.each(function() {
            var self = $(this), localArgs = _slice.call(args, 0);
            if (0 === localArgs.length) {
                var key = self.data("localize"), values = self.data("localize-values");
                if (!key) throw "Must either pass in a key to localize or use the data-localize attribute";
                Array.prototype.push.call(localArgs, key), values && (localArgs = localArgs.concat(values.split(",")));
            }
            return self.html(translateString.apply(null, localArgs));
        });
    }, $.fn._f = function(attr) {
        var self = $(this);
        if (0 !== self.length) {
            var file = self.data("localize-file") || self.attr("src");
            return self.data("localize-file", file), self.attr(attr || "src", translateFile(file));
        }
    }, window._t = translateString, window._f = translateFile, namespace("cloudkid").Translate = Translate;
}(window, jQuery);