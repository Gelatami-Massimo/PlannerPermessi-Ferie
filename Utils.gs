/**
 * ========================================
 * UTILS.GS
 * Funzioni di utilità comuni
 * ========================================
 * Versione: 2.0.0
 * Ultima modifica: 2025-11-20
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
 * Funzione di logging semplice per debug (solo console).
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
 * Registra un evento nel foglio Log per audit e debug.
 * Crea il foglio e le intestazioni se non esistono.
 * 
 * @param {string} evento - Tipo di evento (es. REQUEST_SUBMIT, REQUEST_APPROVED, FORCED_APPROVE, ERROR)
 * @param {string} dettagli - Descrizione breve dell'evento
 * @param {Object} opt - Parametri opzionali:
 *   - idDip {string} - ID Dipendente
 *   - nome {string} - Nome Dipendente
 *   - sede {string} - Sede
 *   - tipo {string} - Tipo richiesta (Ferie/Permesso)
 *   - dataRichiesta {Date|string} - Data della richiesta
 *   - noteTecniche {string} - Note tecniche (es. stacktrace errori)
 */
function logEvent(evento, dettagli, opt) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var logSheet = ss.getSheetByName('Log');
    
    // Crea foglio Log se non esiste
    if (!logSheet) {
      logSheet = ss.insertSheet('Log');
    }
    
    // Inizializza intestazioni se il foglio è vuoto
    if (logSheet.getLastRow() === 0) {
      var headers = [['Timestamp', 'Evento', 'Dettagli', 'ID_Dipendente', 'Nome', 'Sede', 'Tipo', 'Data_Richiesta', 'Note_Tecniche']];
      logSheet.getRange('A1:I1').setValues(headers);
      logSheet.getRange('A1:I1').setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
      logSheet.setFrozenRows(1);
      logSheet.autoResizeColumns(1, 9);
    }
    
    // Prepara i dati opzionali
    opt = opt || {};
    var idDip = opt.idDip || '';
    var nome = opt.nome || '';
    var sede = opt.sede || '';
    var tipo = opt.tipo || '';
    var dataRichiesta = opt.dataRichiesta || '';
    var noteTecniche = opt.noteTecniche || '';
    
    // Formatta data richiesta se è un oggetto Date
    if (dataRichiesta instanceof Date) {
      dataRichiesta = Utilities.formatDate(dataRichiesta, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    }
    
    // Aggiungi riga al log
    logSheet.appendRow([
      new Date(),
      evento,
      dettagli,
      idDip,
      nome,
      sede,
      tipo,
      dataRichiesta,
      noteTecniche
    ]);
    
  } catch (error) {
    // Fallback: se il logging fallisce, usa solo Logger.log
    Logger.log('ERRORE in logEvent: ' + error.message);
    Logger.log('Evento: ' + evento + ', Dettagli: ' + dettagli);
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
