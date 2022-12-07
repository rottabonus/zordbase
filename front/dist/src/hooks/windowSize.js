var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { useState, useEffect } from 'react';
export var useWindowSize = function () {
    var _a = __read(useState({ width: undefined, height: undefined }), 2), windowSize = _a[0], setWindowSize = _a[1];
    useEffect(function () {
        var handleResize = function () {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return function () { return window.removeEventListener("resize", handleResize); };
    }, []);
    return windowSize;
};
