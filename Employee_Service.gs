/**
 * ========================================
 * EMPLOYEE_SERVICE.GS
 * Gestione foglio Dipendenti
 * ========================================
 */

/**
 * Recupera i dati di un dipendente dato il suo ID.
 * @param {string} idDip - ID del dipendente
 * @return {Object|null} Oggetto { id, nome, sede, ruolo, email } o null se non trovato
 */
function getEmployeeById(idDip) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Dipendenti');
  
  if (!sheet) {
    return null;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (toStr(row[0]) === toStr(idDip)) {
      return {
        id: toStr(row[0]),
        nome: toStr(row[1]),
        sede: toStr(row[2]),
        ruolo: toStr(row[3]),
        email: toStr(row[4])
      };
    }
  }
  
  return null;
}

/**
 * Verifica se un ID dipendente esiste.
 * @param {string} idDip - ID del dipendente
 * @return {boolean} True se esiste
 */
function employeeExists(idDip) {
  return getEmployeeById(idDip) !== null;
}

/**
 * Ottiene tutti i dipendenti.
 * @return {Array} Array di oggetti dipendente
 */
function getAllEmployees() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Dipendenti');
  
  if (!sheet) {
    return [];
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  var employees = [];
  
  data.forEach(function(row) {
    if (row[0] && row[1]) { // ID e Nome devono esistere
      employees.push({
        id: toStr(row[0]),
        nome: toStr(row[1]),
        sede: toStr(row[2]),
        ruolo: toStr(row[3]),
        email: toStr(row[4])
      });
    }
  });
  
  return employees;
}
