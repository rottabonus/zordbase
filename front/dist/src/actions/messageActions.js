var setMessage = function (message, type) {
    return {
        type: "SETMESSAGE",
        payload: { message: message, type: type }
    };
};
var clearMessage = function () {
    return {
        type: "CLEARMESSAGE",
        payload: ''
    };
};
var resolveMessage = function (resolution) {
    return {
        type: "RESOLVEMESSAGE",
        payload: resolution
    };
};
export default {
    setMessage: setMessage,
    clearMessage: clearMessage,
    resolveMessage: resolveMessage
};
