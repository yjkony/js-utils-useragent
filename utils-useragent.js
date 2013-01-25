var Util = Util || {};

// ユーザエージェントからOS、ブラウザを解析
Util.UserAgent = Util.UserAgent || (function () {
    'use strict';
    var cache = {}, // メモ化によるキャッシュ
        os, // OS解析定義配列
        browser, // ブラウザ解析定義配列
        getOs, // OS情報取得関数
        getBrowser, // ブラウザ情報取得関数
        getOsAndBrowserStr, // OS・ブラウザ情報文字列取得関数
        isMobile, // フィーチャーフォン判定関数
        publicObj; // public関数用オブジェクト

    // OS解析定義
    // 記述順に評価するため、順番も考慮が必要です
    os = [
        {
            type: 'ios',
            getName: function (ua) {
                var name = null, type = '', isMatch = false;

                if (ua.indexOf('iPad') >= 0) {
                    isMatch = true;
                    type = ' (iPad)';
                } else if (ua.indexOf('iPod') >= 0) {
                    isMatch = true;
                    type = ' (iPod)';
                } else if (ua.indexOf('iPhone') >= 0) {
                    isMatch = true;
                    type = ' (iPhone)';
                }

                if (isMatch) {
                    name = 'iOS';
                    if (/OS ([0-9_]+)/.test(ua)) {
                        name += ' ' + RegExp.$1.replace(/_/g, '.');
                    }
                    name += type;
                }

                return name;
            }
        },
        {
            type: 'android',
            getName: function (ua) {
                var name = null;
                if (ua.indexOf('Android') >= 0) {
                    name = 'Android';
                    if (/Android ([\-a-zA-Z0-9\.]+)/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    }
                }
                return name;
            }
        },
        {
            type: 'mac',
            getName: function (ua) {
                return (ua.indexOf('Mac') >= 0) ? 'Macintosh' : null;
            }
        },
        {
            type: 'windows',
            getName: function (ua) {
                return (ua.indexOf('Win') >= 0) ? 'Windows' : null;
            }
        }
    ];

    // ブラウザ解析定義
    // 記述順に評価するため、順番も考慮が必要です
    browser = [
        {
            type: 'opera',
            getName: function (ua) {
                var name = null;
                if (ua.indexOf('Opera') >= 0) {
                    name = 'Opera';
                    if (/Version\/([0-9\.]+)/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    } else if (/Opera ([0-9\.]+)/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    } else if (/Opera\/([0-9\.]+)/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    }
                }
                return name;
            }
        },
        {
            type: 'msie',
            getName: function (ua) {
                var name = null;
                if (ua.indexOf('MSIE') >= 0) {
                    name = 'Internet Explorer';
                    if (/MSIE ([0-9\.]+)/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    }
                }
                return name;
            }
        },
        {
            type: 'firefox',
            getName: function (ua) {
                var name = null;
                if (ua.indexOf('Firefox') >= 0) {
                    if (ua.indexOf('Fennec') >= 0) {
                        name = 'Fennec';
                        if (/Fennec\/([0-9\.]+)/.test(ua)) {
                            name += ' ' + RegExp.$1;
                        }
                    } else {
                        name = 'Firefox';
                        if (/Firefox\/([0-9\.]+)/.test(ua)) {
                            name += ' ' + RegExp.$1;
                        }
                    }
                }
                return name;
            }
        },
        {
            type: 'chrome',
            getName: function (ua) {
                var name = null;
                if (ua.indexOf('Chrome') >= 0) {
                    name = 'Chrome';
                    if (/Chrome\/([0-9\.]+)/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    }
                }
                return name;
            }
        },
        {
            type: 'safari',
            getName: function (ua) {
                var name = null;
                if (ua.indexOf('Safari') >= 0) {
                    if (ua.indexOf('Mobile') >= 0) {
                        name = 'Mobile Safari';
                    } else {
                        name = 'Safari';
                    }
                    if (/Version\/([0-9\.]+) Safari/.test(ua)) {
                        name += ' ' + RegExp.$1;
                    }
                }
                return name;
            }
        }
    ];

    // OS情報を取得
    getOs = function (ua) {
        var name, i, len, cacheObj = cache[ua];

        if (ua === undefined) {
            return null;
        }

        if (cacheObj !== undefined && cacheObj.os !== undefined) {
            return cacheObj.os;
        }

        for (i = 0, len = os.length; i < len; i += 1) {
            name = os[i].getName(ua);
            if (name !== null) {
                break;
            }
        }

        if (name === null) {
            name = 'undefined';
        }

        cache[ua] = cache[ua] || {};
        cache[ua].os = name;

        return name;
    };

    // ブラウザ情報を取得
    getBrowser = function (ua) {
        var name, i, len, cacheObj = cache[ua];

        if (ua === undefined) {
            return null;
        }

        if (cacheObj !== undefined && cacheObj.browser !== undefined) {
            return cacheObj.browser;
        }

        for (i = 0, len = browser.length; i < len; i += 1) {
            name = browser[i].getName(ua);
            if (name !== null) {
                break;
            }
        }

        if (name === null) {
            name = 'undefined';
        }

        cache[ua] = cache[ua] || {};
        cache[ua].browser = name;

        return name;
    };

    // OSとブラウザ情報を文字列として返却
    getOsAndBrowserStr = function (ua) {
        var str, cacheObj = cache[ua];

        if (ua === undefined) {
            return null;
        }

        if (cacheObj !== undefined && cacheObj.toString !== undefined) {
            return cacheObj.toString;
        }

        str = getOs(ua);
        // PCの場合はブラウザ情報を付与する
        if (!/(iOS|Android)/.test(os)) {
            str += ' / ' + getBrowser(ua);
        }

        cache[ua] = cache[ua] || {};
        cache[ua].toString = str;

        return str;
    };

    // フィーチャーフォン判定
    isMobile = function (ua) {
        var isMobile, cacheObj = cache[ua];

        if (ua === undefined) {
            return false;
        }

        if (cacheObj !== undefined && cacheObj.isMobile !== undefined) {
            return cacheObj.isMobile;
        }

        isMobile = /(DoCoMo|SoftBank|UP\.Browser|Vodafone|KDDI)/.test(ua);

        cache[ua] = cache[ua] || {};
        cache[ua].isMobile = isMobile;

        return isMobile;
    };

    publicObj = {
        getOs: getOs,
        getBrowser: getBrowser,
        getOsAndBrowserStr: getOsAndBrowserStr,
        isMobile: isMobile
    };

    return publicObj;
}());

