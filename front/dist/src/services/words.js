const baseUrl = "/api/words/";
const fetchAll = async () => {
    const response = await fetch(baseUrl);
    const data = await response.json();
    return data.words;
};
const fetchMatch = async (word) => {
    if (word !== "") {
        const response = await fetch(baseUrl);
        const data = await response.json();
        const result = data.words.filter((a) => a.toUpperCase() === word);
        return result.length > 0;
    }
    return false;
};
export default {
    fetchAll,
    fetchMatch,
};
