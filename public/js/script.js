const containerGames = document.querySelector(".games");
// const tekitsContainer = document.querySelector(".tekits");
// const odds = document.querySelectorAll(".odd");
// const amountInput = document.querySelector(".amount");
// const profitResult = document.querySelector(".profit");
// const oddsResult = document.querySelector(".oddTotal");

// // amountInput.style.display = "none";

// const init = function () {
//   const html = localStorage.getItem("bets");
//   // console.log(JSON.parse(html));
// };

// const Tekit = class {
//   constructor(odd, match, game) {
//     this.odd = odd;
//     this.match = match;
//     this.game = game;
//     this.totalwin = 0;
//   }
//   insterTekit() {
//     const html = `<div class='${this.game}'>
//     new ticket for ${this.match} match <br/> odd: ${this.odd}
//     </div>
//     `;
//     return html;
//   }
// };

// let state = {};
// odds.forEach((odd) => {
//   odd.addEventListener("click", (e) => {
//     amountInput.style.display = "block";
//     const oddType = e.target.dataset.odd;
//     const { match, gameId: gameID } = e.target.dataset;
//     const t = new Tekit(oddType, match, gameID);
//     state[gameID] = t;
//     const { totalWin, accum } = calculeProfit(state, amountInput.value);
//     profitResult.innerHTML = totalWin;
//     oddsResult.innerHTML = accum;

//     localStorage.setItem("bets", JSON.stringify(state));
//     if (document.querySelector(`.${gameID}`)) {
//       document.querySelector(`.${gameID}`).innerHTML = t.insterTekit();
//     } else {
//       tekitsContainer.insertAdjacentHTML("beforeend", t.insterTekit());
//     }
//   });
// });

// const calculeProfit = function (state, amount) {
//   const arrState = [];
//   for (const key in state) {
//     arrState.push(state[key].odd);
//   }
//   const accum = Number(
//     arrState
//       .reduce((cur, ac) => {
//         return Number(cur) * Number(ac);
//       }, 1)
//       .toFixed(2)
//   );
//   const totalWin = (Number(amount) * accum).toFixed(2);
//   return {
//     totalWin,
//     accum,
//   };
// };

// amountInput.addEventListener("change", (e) => {
//   const { totalWin, accum } = calculeProfit(state, e.target.value);
//   profitResult.innerHTML = totalWin;
//   oddsResult.innerHTML = accum;
// });
// init();

let newEvents = [];
const server = "http://localhost:4000";
const socket = io.connect(server);
socket.on("message", (s) => {
  if (s?.[0]?.Fixture) {
    const existFxtr = newEvents.some((evt) => evt.FixtureId === s[0].FixtureId);

    if (existFxtr) {
      const evIndex = newEvents.findIndex(
        (evt) => evt.FixtureId === s[0].FixtureId
      );
      newEvents[evIndex] = s[0];
      console.log(newEvents);

      const html = newEvents.map((e) => {
        return `<div class=''>
              <h1> ${e.Fixture?.Sport.Name}
        </h1>
              <div>
              <div>
              <p>${e.Fixture?.Participants[0].Name}</p>
              <p>VS</p>
              <p>${e.Fixture?.Participants[1].Name}</p>
              </div>
              <div>
             <p> last updates ${new Date(e.Fixture.LastUpdate).getMinutes()}:
                ${new Date(e.Fixture.LastUpdate).getSeconds()}</p>
             <span style='border:1px solid red'> update </span> Markets
              ${e.Markets}
              </div>
              </div>
         </div>`;
      });

      containerGames.innerHTML = html;
    } else {
      newEvents.push(s[0]);
      console.log(newEvents);
      const html = newEvents.map((e) => {
        return `<div class=''>
        <h1>${e.Fixture?.Sport.Name}</h1>
        <div>
        <div>
        <p>${e.Fixture?.Participants[0].Name}</p>
        <p>VS</p>
        <p>${e.Fixture?.Participants[1].Name}</p>
        </div>
        <div>
        markets
        ${e.Markets}
        </div>
        </div>
   </div>`;
      });

      containerGames.innerHTML = html;
    }
  }
});
