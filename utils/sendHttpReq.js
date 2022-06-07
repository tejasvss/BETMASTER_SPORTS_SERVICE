const fetch = require("node-fetch");

module.exports = async (url, options) => {
  //get request
  if (!options) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }
  // other methods
  const response = await fetch(url, {
    method: options.method,
    body: JSON.stringify(options.body),
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  return data;
};
