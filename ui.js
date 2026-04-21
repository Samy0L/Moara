// ui.js - afisarea informatiilor de joc (tur, mesaje, scor)

let victorii = { 1: 0, 2: 0 };

// Actualizeaza toate elementele UI
function actualizeazaUI() {
  // Piese in mana si pe tabla
  document.getElementById('mana1').textContent = pieseInMana[1];
  document.getElementById('mana2').textContent = pieseInMana[2];
  document.getElementById('tabla1').textContent = board.filter(v => v === 1).length;
  document.getElementById('tabla2').textContent = board.filter(v => v === 2).length;

  // Evidentiaza panoul jucatorului activ
  document.getElementById('panel1').classList.toggle('activ', jucatorCurent === 1 && !jocTerminat);
  document.getElementById('panel2').classList.toggle('activ', jucatorCurent === 2 && !jocTerminat);

  // Mesaj contextual
  document.getElementById('mesaj').textContent = getMesaj();
}

// Construieste mesajul in functie de starea jocului
function getMesaj() {
  if (jocTerminat) return '';

  let nume = 'Jucatorul ' + jucatorCurent;
  let faza = getFaza(jucatorCurent);

  if (trebuieEliminate) return nume + ': alege piesa adversarului de eliminat!';
  if (faza === 'plasare')  return nume + ': plaseaza o piesa pe tabla.';
  if (faza === 'zbor') {
    return nodSelectat === -1
      ? nume + ': alege piesa (poti sari oriunde).'
      : nume + ': alege destinatia.';
  }
  // faza mutare
  return nodSelectat === -1
    ? nume + ': alege piesa de mutat.'
    : nume + ': alege destinatia.';
}

// Inregistreaza victoria si actualizeaza scorul
function inregistreazaVictorie(castigator) {
  victorii[castigator]++;
  document.getElementById('victorii1').textContent = victorii[1];
  document.getElementById('victorii2').textContent = victorii[2];
}