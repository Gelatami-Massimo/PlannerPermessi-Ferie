/**
 * ========================================
 * REQUEST_SERVICE.GS
 * Gestione foglio Richieste e validazione
 * ========================================
 */

/**
 * Trigger principale: gestisce l'invio del form e valida la richiesta.
 * @param {Object} e - Evento form submit
 */
function onFormSubmit(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var richiesteSheet = ss.getSheetByName('Richieste');
    
    if (!richiesteSheet) {
      log('Errore: foglio Richieste non trovato', null);
      logEvent('ERROR', 'onFormSubmit: Foglio Richieste non trovato', {
        noteTecniche: 'Il foglio Richieste non esiste nel documento'
      });
      return;
    }
    
    // Leggi l'ultima riga inserita
    var lastRow = richiesteSheet.getLastRow();
    if (lastRow < 2) {
      return;
    }
    
    var rowData = richiesteSheet.getRange(lastRow, 1, 1, 10).getValues()[0];
    
    // Estrai i dati dalla riga
    var timestamp = rowData[0];
    var idDip = toStr(rowData[1]);
    var nome = toStr(rowData[2]);
    var sede = toStr(rowData[3]);
    var tipo = toStr(rowData[4]);
    var data = rowData[5];
    var giorni = parseInt(rowData[6]) || 1;
    
    // Converti data se necessario
    if (!(data instanceof Date)) {
      data = new Date(data);
    }
    
    // Log arrivo richiesta
    logEvent('REQUEST_SUBMIT', 'Nuova richiesta ricevuta dal form', {
      idDip: idDip,
      nome: nome,
      sede: sede,
      tipo: tipo,
      dataRichiesta: data,
      noteTecniche: 'Giorni richiesti: ' + giorni
    });
    
    // Validazione dati base
    if (!idDip || !nome || !sede || !tipo || !data) {
      setRequestStatus(lastRow, 'REJECTED', 'Dati mancanti nella richiesta', '');
      logEvent('REQUEST_REJECTED', 'Dati mancanti o non validi', {
        idDip: idDip,
        nome: nome,
        sede: sede,
        tipo: tipo,
        dataRichiesta: data,
        noteTecniche: 'Validazione fallita: campi obbligatori mancanti'
      });
      return;
    }
    
    // Leggi configurazione
    var maxPerGiorno = getMaxForDay(data);
    var maxMensili = getMaxMensile();
    
    // Calcola richieste già approvate
    var approvedCountForDay = countApprovedAbsencesForDateAndSede(data, sede);
    var approvedMonthlyForDip = countApprovedThisMonthForDipendente(idDip, data.getMonth(), data.getFullYear());
    
    var stato = '';
    var motivazione = '';
    var note = '';
    
    // REGOLA 1: Limite mensile per dipendente
    if (approvedMonthlyForDip >= maxMensili) {
      stato = 'REJECTED';
      motivazione = 'Limite mensile raggiunto (' + approvedMonthlyForDip + '/' + maxMensili + ' richieste)';
      
      logEvent('REQUEST_REJECTED', 'Limite mensile superato', {
        idDip: idDip,
        nome: nome,
        sede: sede,
        tipo: tipo,
        dataRichiesta: data,
        noteTecniche: 'Richieste già approvate questo mese: ' + approvedMonthlyForDip + ' / ' + maxMensili
      });
    }
    // REGOLA 2: Limite giornaliero per sede
    else if (approvedCountForDay >= maxPerGiorno) {
      stato = 'REJECTED';
      var namesApproved = getNamesApprovedForDate(data, sede);
      motivazione = 'Limite giornaliero raggiunto';
      note = 'Max ' + maxPerGiorno + ' per questo giorno. Già approvati: ' + namesApproved.join(', ');
      
      logEvent('REQUEST_REJECTED', 'Limite giornaliero superato per la sede', {
        idDip: idDip,
        nome: nome,
        sede: sede,
        tipo: tipo,
        dataRichiesta: data,
        noteTecniche: 'Assenze già approvate nella sede ' + sede + ': ' + approvedCountForDay + ' / ' + maxPerGiorno + ' - Nomi: ' + namesApproved.join(', ')
      });
    }
    // APPROVAZIONE AUTOMATICA
    else {
      stato = 'APPROVED';
      motivazione = 'Approvato automaticamente';
      
      logEvent('REQUEST_APPROVED', 'Richiesta approvata automaticamente', {
        idDip: idDip,
        nome: nome,
        sede: sede,
        tipo: tipo,
        dataRichiesta: data,
        noteTecniche: 'Giorni: ' + giorni + ' - Limiti rispettati (Mensile: ' + approvedMonthlyForDip + '/' + maxMensili + ', Giornaliero: ' + approvedCountForDay + '/' + maxPerGiorno + ')'
      });
      
      // Aggiorna il planner
      addToPlanner(idDip, nome, sede, tipo, data, giorni);
    }
    
    // Scrivi stato e motivazione
    setRequestStatus(lastRow, stato, motivazione, note);
    
  } catch (error) {
    log('Errore in onFormSubmit', error);
    
    logEvent('ERROR', 'Errore critico in onFormSubmit', {
      noteTecniche: error.message + '\n' + (error.stack || '')
    });
    
    // In caso di errore, imposta lo stato come ERROR
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var richiesteSheet = ss.getSheetByName('Richieste');
      var lastRow = richiesteSheet.getLastRow();
      setRequestStatus(lastRow, 'ERROR', 'Errore durante la validazione', error.message);
    } catch (e) {
      log('Errore nel set status ERROR', e);
      logEvent('ERROR', 'Errore doppio in onFormSubmit catch block', {
        noteTecniche: e.message
      });
    }
  }
}

/**
 * Imposta lo stato di una richiesta.
 * @param {number} row - Numero di riga
 * @param {string} status - Stato (PENDING/APPROVED/REJECTED/FORCED)
 * @param {string} reason - Motivazione amministratore
 * @param {string} note - Note aggiuntive
 */
function setRequestStatus(row, status, reason, note) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  if (!sheet || row < 2) {
    return;
  }
  
  // Colonna H: Stato
  sheet.getRange(row, 8).setValue(status);
  
  // Colonna I: Motivazione_Admin
  if (reason) {
    sheet.getRange(row, 9).setValue(reason);
  }
  
  // Colonna J: Note
  if (note) {
    sheet.getRange(row, 10).setValue(note);
  }
  
  // Colora la riga in base allo stato
  var color = '#ffffff';
  switch (status) {
    case 'APPROVED':
      color = '#d9ead3'; // Verde chiaro
      break;
    case 'REJECTED':
      color = '#f4cccc'; // Rosso chiaro
      break;
    case 'FORCED':
      color = '#fff2cc'; // Giallo chiaro
      break;
    case 'PENDING':
      color = '#cfe2f3'; // Blu chiaro
      break;
  }
  
  sheet.getRange(row, 1, 1, 10).setBackground(color);
}

/**
 * Conta le assenze già approvate per una data e sede specifiche.
 * @param {Date} date - Data da controllare
 * @param {string} sede - Sede da controllare
 * @return {number} Numero di assenze approvate
 */
function countApprovedAbsencesForDateAndSede(date, sede) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  if (!sheet) {
    return 0;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 0;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  var count = 0;
  
  data.forEach(function(row) {
    var rowSede = toStr(row[3]); // Colonna D
    var rowData = row[5]; // Colonna F
    var rowStato = toStr(row[7]); // Colonna H
    
    if ((rowStato === 'APPROVED' || rowStato === 'FORCED') &&
        rowSede === sede &&
        sameDate(rowData, date)) {
      count++;
    }
  });
  
  return count;
}

/**
 * Ottiene i nomi dei dipendenti con richieste approvate per una data e sede.
 * @param {Date} date - Data da controllare
 * @param {string} sede - Sede da controllare
 * @return {Array<string>} Array di nomi
 */
function getNamesApprovedForDate(date, sede) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  if (!sheet) {
    return [];
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  var names = [];
  
  data.forEach(function(row) {
    var rowSede = toStr(row[3]); // Colonna D
    var rowData = row[5]; // Colonna F
    var rowStato = toStr(row[7]); // Colonna H
    var rowNome = toStr(row[2]); // Colonna C
    
    if ((rowStato === 'APPROVED' || rowStato === 'FORCED') &&
        rowSede === sede &&
        sameDate(rowData, date) &&
        rowNome) {
      names.push(rowNome);
    }
  });
  
  return names;
}

/**
 * Conta le richieste approvate per un dipendente in un mese specifico.
 * @param {string} idDip - ID del dipendente
 * @param {number} month - Mese (0-11)
 * @param {number} year - Anno
 * @return {number} Numero di richieste approvate
 */
function countApprovedThisMonthForDipendente(idDip, month, year) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  if (!sheet) {
    return 0;
  }
  
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 0;
  }
  
  var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  var count = 0;
  
  data.forEach(function(row) {
    var rowIdDip = toStr(row[1]); // Colonna B
    var rowData = row[5]; // Colonna F
    var rowStato = toStr(row[7]); // Colonna H
    
    if ((rowStato === 'APPROVED' || rowStato === 'FORCED') &&
        rowIdDip === idDip &&
        rowData instanceof Date &&
        rowData.getMonth() === month &&
        rowData.getFullYear() === year) {
      count++;
    }
  });
  
  return count;
}

/**
 * Ottiene i dati di una richiesta dato il numero di riga.
 * @param {number} rowNumber - Numero di riga nel foglio Richieste
 * @return {Object|null} Oggetto con i dati della richiesta o null
 */
function getRequestByRow(rowNumber) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  if (!sheet || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return null;
  }
  
  var rowData = sheet.getRange(rowNumber, 1, 1, 10).getValues()[0];
  
  return {
    timestamp: rowData[0],
    idDip: toStr(rowData[1]),
    nome: toStr(rowData[2]),
    sede: toStr(rowData[3]),
    tipo: toStr(rowData[4]),
    data: rowData[5],
    giorni: parseInt(rowData[6]) || 1,
    stato: toStr(rowData[7]),
    motivazione: toStr(rowData[8]),
    note: toStr(rowData[9])
  };
}
