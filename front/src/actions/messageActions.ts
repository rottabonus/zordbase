const setMessage = (message: string, type: string) => {
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

const resolveMessage = (resolution: boolean) => {
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

