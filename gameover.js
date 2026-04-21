// gameover.js - detectia finalului de joc si restart

var jocTerminat = false;

// Verifica daca jocul s-a terminat dupa o mutare
function verificaGameOver() {
  let adversar = jucatorCurent === 1 ? 2 : 1;

  // Conditia 1: adversarul a ramas cu mai putin de 3 piese (dupa plasare)
  let totalAdversar = board.filter(v => v === adversar).length + pieseInMana[adversar];
  if (pieseInMana[adversar] === 0 && totalAdversar < 3) {
    declansaGameOver(jucatorCurent);
    return;
  }

  // Conditia 2: jucatorul curent nu mai are mutari valide (blocat)
  if (getFaza(jucatorCurent) === 'mutare' && esteBlocat(jucatorCurent)) {
    declansaGameOver(adversar);
    return;
  }
}

// Returneaza true daca jucatorul nu are nicio mutare valida
function esteBlocat(jucator) {
  for (let i = 0; i < 24; i++) {
    if (board[i] !== jucator) continue;
    for (let j = 0; j < ADIACENTE[i].length; j++) {
      if (board[ADIACENTE[i][j]] === 0) return false;
    }
  }
  return true;
}

// Afiseaza mesajul de final si overlay-ul
function declansaGameOver(castigator) {
  jocTerminat = true;
  inregistreazaVictorie(castigator);

  document.getElementById('text-castigator').textContent =
    'Jucatorul ' + castigator + ' a castigat!';
  document.getElementById('overlay-gameover').classList.add('activ');
}

// Reseteaza tot jocul la starea initiala
function restartJoc() {
  board.fill(0);
  pieseInMana[1] = MAX_PIESE;
  pieseInMana[2] = MAX_PIESE;
  jucatorCurent  = 1;
  trebuieEliminate = false;
  nodSelectat    = -1;
  moriActive     = [];
  jocTerminat    = false;

  document.getElementById('overlay-gameover').classList.remove('activ');
  actualizeazaUI();
}