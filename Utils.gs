/**
 * ========================================
 * UTILS.GS
 * Funzioni di utilità comuni
 * ========================================
 */

/**
 * Confronta due date ignorando l'ora (solo giorno/mese/anno).
 * @param {Date} a - Prima data
 * @param {Date} b - Seconda data
 * @return {boolean} True se le date sono uguali
 */
function sameDate(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) {
    return false;
  }
  
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

/**
 * Converte un valore in stringa in modo sicuro.
 * @param {*} v - Valore da convertire
 * @return {string} Stringa risultante (vuota se null/undefined)
 */
function toStr(v) {
  if (v === null || v === undefined) {
    return '';
  }
  return String(v).trim();
}

/**
 * Funzione di logging semplice per debug.
 * @param {string} message - Messaggio da loggare
 * @param {*} data - Dati aggiuntivi (opzionale)
 */
function log(message, data) {
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  
  if (data) {
    Logger.log('[' + timestamp + '] ' + message + ' | Data: ' + JSON.stringify(data));
  } else {
    Logger.log('[' + timestamp + '] ' + message);
  }
}

/**
 * Formatta una data in stringa leggibile.
 * @param {Date} date - Data da formattare
 * @param {string} format - Formato (default: 'dd/MM/yyyy')
 * @return {string} Data formattata
 */
function formatDate(date, format) {
  if (!(date instanceof Date)) {
    return '';
  }
  
  var fmt = format || 'dd/MM/yyyy';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), fmt);
}

/**
 * Verifica se una stringa è vuota o null.
 * @param {string} str - Stringa da verificare
 * @return {boolean} True se vuota
 */
function isEmpty(str) {
  return !str || toStr(str) === '';
}

/**
 * Ottiene il nome del giorno della settimana in italiano.
 * @param {Date} date - Data
 * @return {string} Nome del giorno (Lunedi, Martedi, ecc.)
 */
function getItalianDayName(date) {
  if (!(date instanceof Date)) {
    return '';
  }
  
  var nomiGiorni = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
  return nomiGiorni[date.getDay()];
}

/**
 * Ottiene il nome del mese in italiano.
 * @param {number} month - Mese (0-11)
 * @return {string} Nome del mese
 */
function getItalianMonthName(month) {
  var nomiMesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  return nomiMesi[month] || '';
}
