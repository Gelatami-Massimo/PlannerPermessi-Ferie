/**
 * ========================================
 * ADMIN_UI.GS
 * Funzioni per UI amministratore
 * ========================================
 */

/**
 * Mostra il dialog per forzare l'approvazione di una richiesta.
 */
function showForceApproveDialog() {
  try {
    var html = HtmlService.createHtmlOutputFromFile('forceApproveDialog')
      .setWidth(450)
      .setHeight(350);
    
    SpreadsheetApp.getUi().showModalDialog(html, '🚀 Forza Approvazione Richiesta');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Errore nell\'apertura del dialog:\n\n' + error.message);
    log('Errore in showForceApproveDialog', error);
  }
}

/**
 * Forza l'approvazione di una richiesta ignorando i limiti.
 * Chiamata dal dialog HTML tramite google.script.run
 * @param {number} rowNumber - Numero di riga nel foglio Richieste
 * @param {string} reason - Motivazione della forzatura
 * @return {Object} Risultato dell'operazione { success: boolean, message: string }
 */
function forceApproveRequest(rowNumber, reason) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var richiesteSheet = ss.getSheetByName('Richieste');
    
    if (!richiesteSheet) {
      return {
        success: false,
        message: 'Foglio Richieste non trovato'
      };
    }
    
    // Validazione numero di riga
    if (rowNumber < 2 || rowNumber > richiesteSheet.getLastRow()) {
      return {
        success: false,
        message: 'Numero di riga non valido.\nDeve essere tra 2 e ' + richiesteSheet.getLastRow()
      };
    }
    
    // Leggi i dati della richiesta
    var request = getRequestByRow(rowNumber);
    
    if (!request || !request.nome || !request.data) {
      return {
        success: false,
        message: 'Dati mancanti o non validi nella riga selezionata'
      };
    }
    
    // Converti data se necessario
    var data = request.data;
    if (!(data instanceof Date)) {
      data = new Date(data);
    }
    
    // Imposta stato FORCED
    var motivazione = reason ? reason : 'Forzata dall\'amministratore';
    setRequestStatus(rowNumber, 'FORCED', motivazione, '');
    
    // Aggiorna il planner
    addToPlanner(request.idDip, request.nome, request.sede, request.tipo, data, request.giorni);
    
    // Formatta data per messaggio
    var dataStr = Utilities.formatDate(data, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    
    return {
      success: true,
      message: 'Richiesta forzata con successo!\n\n' +
               '✓ Riga: ' + rowNumber + '\n' +
               '✓ Dipendente: ' + request.nome + '\n' +
               '✓ Tipo: ' + request.tipo + '\n' +
               '✓ Data: ' + dataStr
    };
    
  } catch (error) {
    log('Errore in forceApproveRequest', error);
    return {
      success: false,
      message: 'Errore durante la forzatura:\n\n' + error.message
    };
  }
}
