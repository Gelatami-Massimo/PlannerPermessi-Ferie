/**
 * ========================================
 * FORM_SERVICE.GS
 * Gestione Google Form e trigger
 * ========================================
 */

/**
 * Crea o aggiorna il Google Form collegato al foglio.
 */
function createOrUpdateForm() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var formUrl = ss.getFormUrl();
    var form;
    
    if (formUrl) {
      // Form già collegato - aggiorna
      form = FormApp.openByUrl(formUrl);
      
      // Elimina tutte le domande esistenti
      form.getItems().forEach(function(item) {
        form.deleteItem(item);
      });
    } else {
      // Crea nuovo form
      form = FormApp.create('Richiesta Ferie/Permessi - ' + ss.getName());
      form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    }
    
    // Configura il form
    form.setTitle('Richiesta Ferie e Permessi');
    form.setDescription(
      'Compila questo modulo per richiedere ferie o permessi.\n' +
      'Le richieste verranno validate automaticamente in base ai limiti aziendali.\n\n' +
      '⚠️ IMPORTANTE: Verifica la disponibilità prima di richiedere.'
    );
    form.setCollectEmail(false);
    form.setAllowResponseEdits(false);
    form.setShowLinkToRespondAgain(true);
    
    // Domanda 1: ID Dipendente
    form.addTextItem()
      .setTitle('ID Dipendente')
      .setHelpText('Inserisci il tuo ID dipendente (es. D001)')
      .setRequired(true);
    
    // Domanda 2: Nome Completo
    form.addTextItem()
      .setTitle('Nome Completo')
      .setHelpText('Inserisci il tuo nome e cognome')
      .setRequired(true);
    
    // Domanda 3: Sede
    form.addMultipleChoiceItem()
      .setTitle('Sede')
      .setHelpText('Seleziona la tua sede di lavoro')
      .setChoiceValues(['Gemma', 'Zaffiro', 'Boario'])
      .setRequired(true);
    
    // Domanda 4: Tipo di Richiesta
    form.addMultipleChoiceItem()
      .setTitle('Tipo di Richiesta')
      .setHelpText('Seleziona il tipo di assenza')
      .setChoiceValues(['FERIE', 'PERMESSO'])
      .setRequired(true);
    
    // Domanda 5: Data
    form.addDateItem()
      .setTitle('Data')
      .setHelpText('Seleziona la data desiderata')
      .setRequired(true);
    
    // Domanda 6: Giorni
    form.addTextItem()
      .setTitle('Giorni')
      .setHelpText('Numero di giorni (per ora indicare sempre 1)')
      .setRequired(true);
    
    // Domanda 7: Note (opzionale)
    form.addParagraphTextItem()
      .setTitle('Note (opzionale)')
      .setHelpText('Eventuali note o richieste particolari')
      .setRequired(false);
    
    // Salva l'URL del form come nota nella cella A1 di Richieste
    var richiesteSheet = ss.getSheetByName('Richieste');
    var formLink = form.getPublishedUrl();
    
    if (richiesteSheet) {
      richiesteSheet.getRange('A1').setNote('Link al Form: ' + formLink);
    }
    
    SpreadsheetApp.getUi().alert(
      '✓ FORM CREATO/AGGIORNATO\n\n' +
      'Link al form:\n' + formLink + '\n\n' +
      'Il link è stato salvato come nota nella cella A1 del foglio Richieste.\n' +
      'Condividi questo link con i dipendenti.'
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Errore durante la creazione del form:\n\n' + error.message);
    log('Errore in createOrUpdateForm', error);
  }
}

/**
 * Installa il trigger per gestire le risposte del form.
 */
function installOnFormSubmitTrigger() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Elimina trigger duplicati
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(trigger) {
      if (trigger.getHandlerFunction() === 'onFormSubmit') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Crea nuovo trigger
    ScriptApp.newTrigger('onFormSubmit')
      .forSpreadsheet(ss)
      .onFormSubmit()
      .create();
    
    SpreadsheetApp.getUi().alert(
      '✓ TRIGGER INSTALLATO\n\n' +
      'Il trigger onFormSubmit è stato configurato correttamente.\n' +
      'Ora le richieste inviate tramite form verranno validate automaticamente.'
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Errore durante l\'installazione del trigger:\n\n' + error.message);
    log('Errore in installOnFormSubmitTrigger', error);
  }
}
