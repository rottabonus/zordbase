 const fetchAll = async () => {
    let response = await fetch('http://localhost:3000/api/words/');
    let data = await response.json()
    console.log(response.status)
    return data.words
  }

  export default { fetchAll }