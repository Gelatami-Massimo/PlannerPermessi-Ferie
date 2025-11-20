/**
 * ========================================
 * PLANNER_SERVICE.GS
 * Gestione foglio Planner-Mensile
 * ========================================
 */

/**
 * Crea o aggiorna il planner mensile con tutte le date del mese.
 * @param {number} year - Anno (es. 2025)
 * @param {number} month - Mese (0-11, dove 0 = Gennaio)
 */
function createOrUpdateMonthlyPlanner(year, month) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
  if (!sheet) {
    throw new Error('Foglio Planner-Mensile non trovato');
  }
  
  // Pulisci il foglio
  sheet.clear();
  
  // Intestazioni fisse
  sheet.getRange('A1').setValue('Nome');
  sheet.getRange('B1').setValue('Sede/ID');
  sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
  
  // Calcola tutte le date del mese
  var firstDay = new Date(year, month, 1);
  var lastDay = new Date(year, month + 1, 0);
  var numDays = lastDay.getDate();
  
  var dates = [];
  for (var d = 1; d <= numDays; d++) {
    dates.push(new Date(year, month, d));
  }
  
  // Scrivi le date dalla colonna C in poi
  sheet.getRange(1, 3, 1, numDays).setValues([dates]);
  sheet.getRange(1, 3, 1, numDays).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(1, 3, 1, numDays).setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
  
  // Aggiungi tutti i dipendenti
  var employees = getAllEmployees();
  var rowIndex = 2;
  
  employees.forEach(function(emp) {
    if (emp.nome && emp.sede) {
      sheet.getRange(rowIndex, 1).setValue(emp.nome);
      sheet.getRange(rowIndex, 2).setValue(emp.sede + ' / ' + emp.id);
      rowIndex++;
    }
  });
  
  // Formattazione
  sheet.autoResizeColumns(1, 2);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
}

/**
 * Aggiunge una richiesta approvata al planner.
 * @param {string} idDip - ID del dipendente
 * @param {string} nome - Nome del dipendente
 * @param {string} sede - Sede del dipendente
 * @param {string} tipo - FERIE o PERMESSO
 * @param {Date} date - Data della richiesta
 * @param {number} giorni - Numero di giorni (per ora sempre 1)
 */
function addToPlanner(idDip, nome, sede, tipo, date, giorni) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
  if (!sheet) {
    log('Errore: foglio Planner-Mensile non trovato', null);
    return;
  }
  
  // Trova o crea la riga del dipendente
  var rowIndex = findOrCreateEmployeeRowInPlanner(nome, sede, idDip);
  
  // Trova la colonna della data
  var colIndex = findDateColumnInPlanner(date);
  
  if (colIndex === -1) {
    log('Data ' + date + ' non trovata nel planner corrente', null);
    return;
  }
  
  // Scrivi il simbolo appropriato
  var symbol = (tipo === 'FERIE') ? 'F' : 'P';
  var cell = sheet.getRange(rowIndex, colIndex);
  cell.setValue(symbol);
  
  // Aggiungi nota
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  var noteText = 'Approvato: ' + symbol + ' ' + timestamp;
  cell.setNote(noteText);
}

/**
 * Trova o crea la riga del dipendente nel planner.
 * @param {string} nome - Nome del dipendente
 * @param {string} sede - Sede del dipendente
 * @param {string} idDip - ID del dipendente
 * @return {number} Indice della riga
 */
function findOrCreateEmployeeRowInPlanner(nome, sede, idDip) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
  var lastRow = sheet.getLastRow();
  
  // Cerca la riga esistente
  for (var r = 2; r <= lastRow; r++) {
    var nomeCell = sheet.getRange(r, 1).getValue();
    if (toStr(nomeCell) === toStr(nome)) {
      return r;
    }
  }
  
  // Se non trovata, crea nuova riga
  var newRow = lastRow + 1;
  sheet.getRange(newRow, 1).setValue(nome);
  sheet.getRange(newRow, 2).setValue(sede + ' / ' + idDip);
  
  return newRow;
}

/**
 * Trova la colonna corrispondente a una data nel planner.
 * @param {Date} targetDate - Data da cercare
 * @return {number} Indice della colonna (3+) o -1 se non trovata
 */
function findDateColumnInPlanner(targetDate) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
  var lastCol = sheet.getLastColumn();
  
  // Leggi tutte le date dalla riga 1 (dalla colonna C in poi)
  if (lastCol < 3) return -1;
  
  var dates = sheet.getRange(1, 3, 1, lastCol - 2).getValues()[0];
  
  for (var i = 0; i < dates.length; i++) {
    if (sameDate(dates[i], targetDate)) {
      return i + 3; // +3 perché partiamo dalla colonna C
    }
  }
  
  return -1;
}

/**
 * Rielabora tutto il planner dalle richieste approvate.
 */
function rebuildPlannerFromApproved() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var plannerSheet = ss.getSheetByName('Planner-Mensile');
    var richiesteSheet = ss.getSheetByName('Richieste');
    
    if (!plannerSheet || !richiesteSheet) {
      SpreadsheetApp.getUi().alert('Errore: fogli mancanti');
      return;
    }
    
    // Svuota l'area dati del planner (mantieni intestazioni)
    var lastRow = plannerSheet.getLastRow();
    var lastCol = plannerSheet.getLastColumn();
    
    if (lastRow > 1 && lastCol >= 3) {
      plannerSheet.getRange(2, 3, lastRow - 1, lastCol - 2).clear();
    }
    
    // Leggi tutte le richieste
    var lastRowRichieste = richiesteSheet.getLastRow();
    if (lastRowRichieste < 2) {
      SpreadsheetApp.getUi().alert('Nessuna richiesta da elaborare');
      return;
    }
    
    var richiesteData = richiesteSheet.getRange(2, 1, lastRowRichieste - 1, 10).getValues();
    var count = 0;
    
    richiesteData.forEach(function(row) {
      var stato = toStr(row[7]); // Colonna H (Stato)
      
      if (stato === 'APPROVED' || stato === 'FORCED') {
        var idDip = toStr(row[1]); // Colonna B
        var nome = toStr(row[2]); // Colonna C
        var sede = toStr(row[3]); // Colonna D
        var tipo = toStr(row[4]); // Colonna E
        var data = row[5]; // Colonna F
        var giorni = parseInt(row[6]) || 1; // Colonna G
        
        if (data && nome) {
          addToPlanner(idDip, nome, sede, tipo, data, giorni);
          count++;
        }
      }
    });
    
    SpreadsheetApp.getUi().alert(
      '✓ Planner rielaborato!\n\n' +
      'Richieste elaborate: ' + count
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Errore durante la rielaborazione:\n\n' + error.message);
    log('Errore in rebuildPlannerFromApproved', error);
  }
}
