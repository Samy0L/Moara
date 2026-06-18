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

export async function mutareCalculator(modJoc, proceseazaRezultat, declanseazaVictorie) { ///funcția principală, async. Afișează "Calculatorul se gândește...", așteaptă 500ms (delay artificial pentru UX), verifică dacă trebuie să elimine o piesă, alege o mutare cu alegeMutareCalculator(modJoc), execută mutarea. Dacă mutarea a format o moară, elimină imediat o piesă adversă (după încă 400ms delay).
  state.mesaj = "Calculatorul se gandeste...";
  await asteapta(500);

  if (state.trebuieEliminata && state.eliminaPentru === 2) {
    let rezultat = await eliminaPentruCalculator(modJoc);
    proceseazaRezultat(rezultat);
    return;
  }

  actualizeazaFaza(2); ///actualizează faza calculatorului (pentru a afișa "Calculatorul plasează o piesă." sau "Calculatorul mută o piesă." în UI)
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

function alegeMutareModerata() {/// logică mai complexă, în ordine de priorități:
                               ///Caută o mutare care formează o moară pentru calculator → atacă
                              ///Caută o mutare a omului care ar forma o moară → blochează acea poziție
                             ///Preferă nodurile de mijloc (indicii impari: 1,3,5,7,9...) — acestea sunt intersecțiile dintre inele, mai valoroase strategic
                            ///Fallback → mutare aleatorie
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

function gasesteMutareCareFaceMoara(jucator, mutari) {///gasesteMutareCareFaceMoara(jucator, mutari) — simulează fiecare mutare temporar pe tablă (pune piesa, verifică moara, o ia înapoi) și returnează prima mutare care formează o moară. Este o simulare non-destructivă: restaurează starea tablei după fiecare test.
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

function mutareFaceMoara(idx, jucator) {///verifică dacă nodul idx completează o moară, parcurgând MORI_POSIBILE.
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

function alegePiesaDeEliminat(jucator, modJoc) { ///pe easy: aleatoriu din piesele eliminabile. Pe moderate: preferă piesa adversă care e cel mai aproape de a forma o moară (are deja 2 piese dintr-un triplet și un nod gol) — o eliminare preventivă.
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

function piesaAproapeDeMoara(idx, jucator) { ///verifică dacă piesa de la idx face parte dintr-un triplet unde jucatorul mai are 2 piese și există 1 nod gol (ar forma moară la next move).
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
