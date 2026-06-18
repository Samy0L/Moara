///ui.js - se ocupa cu actualizarea elementelor HTML (UI) în funcție de starea jocului.
import {
  state,
  numarPieseBoard,
  numeJucator,
} from "./pieces.js";

export function actualizeazaUI(jocPornit) { ///funcția apelată la fiecare frame din draw()
  document.getElementById("nume-jucator-1").textContent =
    state.numePj1 || "Nume necompletat";
  document.getElementById("nume-jucator-2").textContent =
    state.numePj2 || "Nume necompletat";
  document.getElementById("piese-tabla-1").textContent = numarPieseBoard(1);
  document.getElementById("piese-tabla-2").textContent = numarPieseBoard(2);
  document.getElementById("piese-ramase-1").textContent = state.pieseInMana[1];
  document.getElementById("piese-ramase-2").textContent = state.pieseInMana[2];
  document.getElementById("piese-luate-1").textContent = state.pieseLuate[1];
  document.getElementById("piese-luate-2").textContent = state.pieseLuate[2];

  document.getElementById("player-box-1").classList.toggle(
    "active-turn",
    jocPornit && state.jucatorCurent === 1 && !state.jocTerminat
  );
  document.getElementById("player-box-2").classList.toggle(
    "active-turn",
    jocPornit && state.jucatorCurent === 2 && !state.jocTerminat
  );
}

export function pregatesteSelectareMod(onSchimbareMod) { ///setează event handler-ul pentru <select id="mod-joc">, care apelează onSchimbareMod(modJoc) când se schimbă modul de joc
  document.getElementById("mod-joc").onchange = function () {
    onSchimbareMod(document.getElementById("mod-joc").value);
  };
}

export function getModJocSelectat() {
  return document.getElementById("mod-joc").value;
}

export function actualizeazaTextMod(modJoc) {
  let text = "Human vs Human";

  if (modJoc === "computer-easy") {
    text = "Human vs Computer - Easy";
  }

  if (modJoc === "computer-moderate") {
    text = "Human vs Computer - Moderate";
  }

  document.getElementById("mod-curent").textContent = text;
}

export function pregatesteFormulareNume(confirmaNumeJucator1, confirmaNumeJucator2, restartComplet) { ///atașează onclick pe butoane și onkeydown (Enter) pe inputuri. Setează focus automat pe primul input.
  document.getElementById("buton-jucator-1").onclick = confirmaNumeJucator1;
  document.getElementById("buton-jucator-2").onclick = confirmaNumeJucator2;
  document.getElementById("input-jucator-1").onkeydown = function (event) {
    if (event.key === "Enter") confirmaNumeJucator1();
  };
  document.getElementById("input-jucator-2").onkeydown = function (event) {
    if (event.key === "Enter") confirmaNumeJucator2();
  };
  document.getElementById("win-restart-btn").onclick = restartComplet;
  document.getElementById("input-jucator-1").focus();
}

export function arataFormularJucator2() {///activează inputul și butonul jucătorului 2 (inițial disabled), setează focus.
  document.getElementById("input-jucator-2").disabled = false;
  document.getElementById("buton-jucator-2").disabled = false;
  document.getElementById("input-jucator-2").focus();
}

export function ascundeFormularJucator1() { ///setează display: none pe div-ul formularului.
  document.getElementById("formular-jucator-1").style.display = "none";
}

export function ascundeFormularJucator2() { ///setează display: none pe div-ul formularului.
  document.getElementById("formular-jucator-2").style.display = "none";
}

export function resetFormulare() {
  document.getElementById("formular-jucator-1").style.display = "";
  document.getElementById("formular-jucator-2").style.display = "";
  document.getElementById("input-jucator-1").value = "";
  document.getElementById("input-jucator-2").value = "";
  document.getElementById("input-jucator-1").disabled = false;
  document.getElementById("buton-jucator-1").disabled = false;
  document.getElementById("input-jucator-2").disabled = true;
  document.getElementById("buton-jucator-2").disabled = true;
  document.getElementById("input-jucator-1").focus();
}

export function citesteNumeJucator1() {
  return document.getElementById("input-jucator-1").value.trim();
}

export function citesteNumeJucator2() {
  return document.getElementById("input-jucator-2").value.trim();
}

export function arataVictorie(castigator) {
  let perdant = castigator === 1 ? 2 : 1;

  document.getElementById("win-title").textContent = "Victorie!";
  document.getElementById("win-desc").textContent =
    `${numeJucator(castigator)} a castigat! ${numeJucator(perdant)} nu mai poate juca.`;
  document.getElementById("win-overlay").classList.remove("hidden");
}

export function ascundeVictorie() {
  document.getElementById("win-overlay").classList.add("hidden");
}
