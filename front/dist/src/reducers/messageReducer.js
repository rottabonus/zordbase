var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var initialState = {
    message: '',
    type: '',
    show: false,
    resolution: false
};
var messageReducer = function (state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case "SETMESSAGE":
            return __assign(__assign({}, state), { message: action.payload.message, type: action.payload.type, show: true });
        case "CLEARMESSAGE":
            return __assign(__assign({}, state), { message: action.payload, type: '', show: false });
        case "RESOLVEMESSAGE":
            return __assign(__assign({}, state), { resolution: action.payload, message: '', show: false });
        default: {
            return state;
        }
    }
};
export default messageReducer;
