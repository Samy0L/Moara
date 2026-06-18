import {
  state,
  MORI_POSIBILE,
  plaseazaPiesa,
  mutaPiesa,
  eliminaPiesa,
  actualizeazaFaza,
  piesaLa,
  punePiesaLa,
  pozitiiJucator,
  mutariDisponibile,
  poateEliminaPiesa,
} from "./pieces.js";

export async function mutareCalculator(modJoc, proceseazaRezultat, declanseazaVictorie) {
  state.mesaj = "Calculatorul se gandeste...";
  await asteapta(500);

  if (state.trebuieEliminata && state.eliminaPentru === 2) {
    let rezultat = await eliminaPentruCalculator(modJoc);
    proceseazaRezultat(rezultat);
    return;
  }

  actualizeazaFaza(2);
  let faza = state.faza[2];
  let mutare = alegeMutareCalculator(modJoc);

  if (!mutare) {
    declanseazaVictorie(1);
    return;
  }

  let rezultat;
  if (faza === 1) {
    rezultat = await plaseazaPiesa(mutare.to);
  } else {
    state.nodSelectat = mutare.from;
    rezultat = await mutaPiesa(mutare.from, mutare.to);
  }

  if (rezultat && state.trebuieEliminata && state.eliminaPentru === 2) {
    await asteapta(400);
    rezultat = await eliminaPentruCalculator(modJoc);
  }

  proceseazaRezultat(rezultat);
}

async function eliminaPentruCalculator(modJoc) {
  let piesaDeEliminat = alegePiesaDeEliminat(2, modJoc);

  if (piesaDeEliminat === -1) {
    state.trebuieEliminata = false;
    state.eliminaPentru = 0;
    state.mesaj = "Adversarul are doar piese protejate.";
    state.jucatorCurent = 1;
    actualizeazaFaza(1);
    actualizeazaFaza(2);
    return true;
  }

  return await eliminaPiesa(piesaDeEliminat);
}

function alegeMutareCalculator(modJoc) {
  if (modJoc === "computer-easy") {
    return alegeMutareRandom(2);
  }

  return alegeMutareModerata();
}

function alegeMutareRandom(jucator) {
  let mutari = mutariDisponibile(jucator);
  if (mutari.length === 0) return null;

  return mutari[Math.floor(Math.random() * mutari.length)];
}

function alegeMutareModerata() {
  let mutari = mutariDisponibile(2);
  if (mutari.length === 0) return null;

  let mutareMoara = gasesteMutareCareFaceMoara(2, mutari);
  if (mutareMoara) return mutareMoara;

  let mutariOm = mutariDisponibile(1);
  let blocare = gasesteMutareCareFaceMoara(1, mutariOm);
  if (blocare) {
    let mutareBlocare = mutari.find((m) => m.to === blocare.to);
    if (mutareBlocare) return mutareBlocare;
  }

  let puncteMijloc = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
  let centru = mutari.find((m) => puncteMijloc.includes(m.to));
  if (centru) return centru;

  return alegeMutareRandom(2);
}

function gasesteMutareCareFaceMoara(jucator, mutari) {
  for (const mutare of mutari) {
    let fromVal = -1;

    if (mutare.from !== -1) {
      fromVal = piesaLa(mutare.from);
      punePiesaLa(mutare.from, 0);
    }

    let toVal = piesaLa(mutare.to);
    punePiesaLa(mutare.to, jucator);
    let faceMoara = mutareFaceMoara(mutare.to, jucator);
    punePiesaLa(mutare.to, toVal);

    if (mutare.from !== -1) {
      punePiesaLa(mutare.from, fromVal);
    }

    if (faceMoara) {
      return mutare;
    }
  }

  return null;
}

function mutareFaceMoara(idx, jucator) {
  for (const moara of MORI_POSIBILE) {
    if (
      moara.includes(idx) &&
      piesaLa(moara[0]) === jucator &&
      piesaLa(moara[1]) === jucator &&
      piesaLa(moara[2]) === jucator
    ) {
      return true;
    }
  }

  return false;
}

function alegePiesaDeEliminat(jucator, modJoc) {
  let adversar = jucator === 1 ? 2 : 1;
  let pieseAdversar = pozitiiJucator(adversar);
  let variante = pieseAdversar.filter((idx) => poateEliminaPiesa(idx, jucator));
  if (variante.length === 0) return -1;

  if (modJoc === "computer-easy") {
    return variante[Math.floor(Math.random() * variante.length)];
  }

  let piesaCareBlocheaza = variante.find((idx) => piesaAproapeDeMoara(idx, adversar));
  if (piesaCareBlocheaza !== undefined) {
    return piesaCareBlocheaza;
  }

  return variante[0];
}

function piesaAproapeDeMoara(idx, jucator) {
  for (const moara of MORI_POSIBILE) {
    if (!moara.includes(idx)) continue;

    let cate = 0;
    let goale = 0;
    for (const n of moara) {
      if (piesaLa(n) === jucator) cate++;
      if (piesaLa(n) === 0) goale++;
    }

    if (cate === 2 && goale === 1) {
      return true;
    }
  }

  return false;
}

function asteapta(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
