const getOdds = async function () {
  const data = {
    PackageId: 1017,
    UserName: "skystopcs@gmail.com",
    Password: "G735@dhu8T",
  };
  const res = await fetch("https://stm-snapshot.lsports.eu/InPlay/GetEvents", {
    method: "POST",
    body: JSON.stringify(data),
  });

  console.log(res);
};
// getOdds();
