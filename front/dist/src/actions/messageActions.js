const setMessage = (message, type) => {
    return {
        type: "SETMESSAGE",
        payload: { message, type },
    };
};
const clearMessage = () => {
    return {
        type: "CLEARMESSAGE",
        payload: "",
    };
};
const resolveMessage = (resolution) => {
    return {
        type: "RESOLVEMESSAGE",
        payload: resolution,
    };
};
export default {
    setMessage,
    clearMessage,
    resolveMessage,
};
