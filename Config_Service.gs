/**
 * ========================================
 * CONFIG_SERVICE.GS
 * Gestione foglio Config (limiti)
 * ========================================
 */

/**
 * Legge la configurazione dal foglio Config.
 * @return {Object} Oggetto con: { byDay: {Lunedi: 2, ...}, maxMensile: 6 }
 */
function readConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  
  if (!sheet) {
    throw new Error('Foglio Config non trovato. Eseguire prima il Setup iniziale.');
  }
  
  var config = {
    byDay: {},
    maxMensile: 6
  };
  
  // Leggi limiti giornalieri (righe 2-8, colonne A-B)
  var giorni = sheet.getRange(2, 1, 7, 2).getValues();
  giorni.forEach(function(row) {
    var giorno = toStr(row[0]);
    var max = parseInt(row[1]) || 2;
    if (giorno) {
      config.byDay[giorno] = max;
    }
  });
  
  // Leggi limite mensile (B10)
  var maxMensiliValue = sheet.getRange('B10').getValue();
  if (maxMensiliValue && !isNaN(maxMensiliValue)) {
    config.maxMensile = parseInt(maxMensiliValue);
  }
  
  return config;
}

/**
 * Ottiene il limite massimo di assenze per una data specifica.
 * @param {Date} date - Data da controllare
 * @return {number} Limite massimo per quel giorno della settimana
 */
function getMaxForDay(date) {
  var config = readConfig();
  
  // Mappa getDay() (0=Dom, 1=Lun, ..., 6=Sab) ai nomi italiani
  var nomiGiorni = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
  var giornoSettimana = date.getDay(); // 0-6
  var nomeGiorno = nomiGiorni[giornoSettimana];
  
  return config.byDay[nomeGiorno] || 2;
}

/**
 * Ottiene il limite mensile di richieste per dipendente.
 * @return {number} Numero massimo di richieste mensili
 */
function getMaxMensile() {
  var config = readConfig();
  return config.maxMensile;
}
