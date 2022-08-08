module.exports = function groupByKey(array, key) {
  const obj = array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});

  const arrayOfObj = Object.entries(obj).map((e) => ({ [e[0]]: e[1] }));
  console.log(arrayOfObj.length);
  return arrayOfObj;
};
