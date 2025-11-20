/**
 * ========================================
 * MAIN_APP.GS
 * Entry point e orchestratore principale
 * ========================================
 * Versione: 2.0.0
 * Ultima modifica: 2025-11-20
 */

/**
 * Crea il menu personalizzato all'apertura del foglio.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Cartellini MASTER')
    .addItem('Setup iniziale (fogli, form, trigger)', 'runInitialSetup')
    .addSeparator()
    .addItem('Verifica struttura Richieste', 'verifyAndFixRichiesteStructure')
    .addItem('Forza approva richiesta…', 'showForceApproveDialog')
    .addItem('Rielabora Planner (tutto)', 'rebuildPlannerFromApproved')
    .addSeparator()
    .addItem('Rigenera Form collegato', 'createOrUpdateForm')
    .addItem('Reinstalla trigger onFormSubmit', 'installOnFormSubmitTrigger')
    .addSeparator()
    .addItem('Info versione', 'showVersionInfo')
    .addToUi();
}

/**
 * Mostra informazioni sulla versione corrente.
 */
function showVersionInfo() {
  SpreadsheetApp.getUi().alert(
    '📅 Planner Permessi e Ferie v2.0.0\n\n' +
    '✓ Architettura modulare\n' +
    '✓ Verifica automatica struttura fogli\n' +
    '✓ Validazione limiti giornalieri/mensili\n' +
    '✓ Deploy con CLASP\n\n' +
    'Autore: Massimo\n' +
    'Data: 20 Novembre 2025'
  );
}

/**
 * Esegue il setup completo del sistema.
 * Coordina tutti i servizi per inizializzare il progetto.
 */
function runInitialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    log('=== INIZIO SETUP INIZIALE ===', null);
    
    // 1. Crea tutti i fogli necessari
    createAllSheets();
    log('Fogli creati', null);
    
    // 2. Inizializza foglio Config
    initializeConfigSheet();
    log('Config inizializzato', null);
    
    // 3. Inizializza foglio Dipendenti
    initializeDipendentiSheet();
    log('Dipendenti inizializzato', null);
    
    // 4. Inizializza foglio Richieste CON VERIFICA
    initializeRichiesteSheet();
    verifyAndFixRichiesteStructure();
    log('Richieste inizializzato e verificato', null);
    
    // 5. Inizializza foglio Riepilogo
    initializeRiepilogoSheet();
    log('Riepilogo inizializzato', null);
    
    // 6. Crea/aggiorna planner mensile corrente
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth(); // 0-11
    createOrUpdateMonthlyPlanner(year, month);
    log('Planner mensile creato', {year: year, month: month + 1});
    
    // 7. Applica formattazione al planner
    applyPlannerConditionalFormatting();
    log('Formattazione applicata', null);
    
    // 8. Proteggi il foglio planner
    protectPlannerSheet();
    log('Planner protetto', null);
    
    // 9. Crea/aggiorna Form collegato
    createOrUpdateForm();
    log('Form creato/aggiornato', null);
    
    // 10. Installa trigger onFormSubmit
    installOnFormSubmitTrigger();
    log('Trigger installato', null);
    
    // 11. Inizializza foglio Log
    initializeLogSheet();
    log('Log inizializzato', null);
    
    log('=== SETUP COMPLETATO CON SUCCESSO ===', null);
    
    // Registra evento nel log
    logEvent('SETUP_RUN', 'Setup iniziale completato con successo', {
      noteTecniche: 'Versione 2.0.0 - Architettura modulare con verifica colonne'
    });
    
    SpreadsheetApp.getUi().alert(
      '✓ SETUP COMPLETATO!\n\n' +
      '• Fogli creati e configurati\n' +
      '• Struttura Richieste verificata ✓\n' +
      '• Planner mensile generato\n' +
      '• Form collegato e funzionante\n' +
      '• Trigger installato\n\n' +
      'Controlla il foglio Richieste (cella A1) per il link al Form.'
    );
    
  } catch (error) {
    log('ERRORE DURANTE IL SETUP', error);
    
    // Registra errore nel log
    logEvent('ERROR', 'Errore durante il setup iniziale', {
      noteTecniche: error.message + '\n' + (error.stack || '')
    });
    
    SpreadsheetApp.getUi().alert(
      '✗ ERRORE DURANTE IL SETUP\n\n' +
      error.message + '\n\n' +
      'Verifica i permessi e riprova.\n' +
      'Controlla i log: Estensioni → Apps Script → Esecuzioni'
    );
  }
}

/**
 * Crea tutti i fogli se non esistono.
 */
function createAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetNames = ['Config', 'Dipendenti', 'Richieste', 'Planner-Mensile', 'Riepilogo', 'Log'];
  
  sheetNames.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
      log('Foglio creato: ' + name, null);
    }
  });
}

/**
 * Inizializza il foglio Config con valori di default.
 */
function initializeConfigSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  
  // Intestazioni
  sheet.getRange('A1:B1').setValues([['Giorno', 'Max']]);
  sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  
  // Giorni della settimana con limiti default
  var giorni = [
    ['Lunedi', 2],
    ['Martedi', 2],
    ['Mercoledi', 2],
    ['Giovedi', 2],
    ['Venerdi', 2],
    ['Sabato', 1],
    ['Domenica', 1]
  ];
  
  sheet.getRange(2, 1, 7, 2).setValues(giorni);
  
  // Limite mensile
  sheet.getRange('A10').setValue('MaxRichiesteMensili');
  sheet.getRange('B10').setValue(6);
  sheet.getRange('A10:B10').setFontWeight('bold').setBackground('#fbbc04');
  
  sheet.autoResizeColumns(1, 2);
}

/**
 * Inizializza il foglio Dipendenti.
 */
function initializeDipendentiSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Dipendenti');
  
  // Intestazioni
  sheet.getRange('A1:E1').setValues([['ID', 'Nome', 'Sede', 'Ruolo', 'Email']]);
  sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#34a853').setFontColor('#ffffff');
  
  // Dati di esempio se il foglio è vuoto
  if (sheet.getLastRow() <= 1) {
    var dipendenti = [
      ['D001', 'Mario Rossi', 'Gemma', 'Operatore', 'mario.rossi@example.com'],
      ['D002', 'Laura Bianchi', 'Zaffiro', 'Coordinatore', 'laura.bianchi@example.com'],
      ['D003', 'Giuseppe Verdi', 'Boario', 'Tecnico', 'giuseppe.verdi@example.com']
    ];
    sheet.getRange(2, 1, 3, 5).setValues(dipendenti);
  }
  
  sheet.autoResizeColumns(1, 5);
}

/**
 * Inizializza il foglio Richieste.
 */
function initializeRichiesteSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  // Intestazioni CORRETTE (questo è lo standard)
  var headers = [['Timestamp', 'ID_Dipendente', 'Nome', 'Sede', 'Tipo', 'Data', 'Giorni', 'Stato', 'Motivazione_Admin', 'Note']];
  sheet.getRange('A1:J1').setValues(headers);
  sheet.getRange('A1:J1').setFontWeight('bold').setBackground('#ea4335').setFontColor('#ffffff');
  
  sheet.autoResizeColumns(1, 10);
}

/**
 * Inizializza il foglio Riepilogo.
 */
function initializeRiepilogoSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Riepilogo');
  
  // Intestazioni
  var headers = [['ID_Dipendente', 'Nome', 'Sede', 'Mese', 'Totale_Ferie', 'Totale_Permessi']];
  sheet.getRange('A1:F1').setValues(headers);
  sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#9c27b0').setFontColor('#ffffff');
  
  sheet.autoResizeColumns(1, 6);
}

/**
 * Inizializza il foglio Log.
 */
function initializeLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Log');
  
  if (!sheet) {
    sheet = ss.insertSheet('Log');
  }
  
  // Intestazioni se il foglio è vuoto
  if (sheet.getLastRow() === 0) {
    var headers = [['Timestamp', 'Evento', 'Dettagli', 'ID_Dipendente', 'Nome', 'Sede', 'Tipo', 'Data_Richiesta', 'Note_Tecniche']];
    sheet.getRange('A1:I1').setValues(headers);
    sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 9);
  }
}

/**
 * VERIFICA E CORREGGE la struttura del foglio Richieste.
 * Assicura che le colonne siano esattamente nell'ordine corretto.
 */
function verifyAndFixRichiesteStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  if (!sheet) {
    log('ERRORE: Foglio Richieste non trovato', null);
    return false;
  }
  
  // Struttura CORRETTA attesa
  var expectedHeaders = [
    'Timestamp',
    'ID_Dipendente',
    'Nome',
    'Sede',
    'Tipo',
    'Data',
    'Giorni',
    'Stato',
    'Motivazione_Admin',
    'Note'
  ];
  
  // Leggi intestazioni attuali
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    // Foglio vuoto, inizializza
    log('Richieste: foglio vuoto, inizializzo', null);
    initializeRichiesteSheet();
    return true;
  }
  
  var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Verifica se le intestazioni corrispondono
  var isCorrect = true;
  var differences = [];
  
  if (currentHeaders.length !== expectedHeaders.length) {
    isCorrect = false;
    differences.push('Numero colonne diverso: atteso ' + expectedHeaders.length + ', trovato ' + currentHeaders.length);
  }
  
  for (var i = 0; i < expectedHeaders.length; i++) {
    if (toStr(currentHeaders[i]) !== expectedHeaders[i]) {
      isCorrect = false;
      differences.push('Colonna ' + (i + 1) + ': atteso "' + expectedHeaders[i] + '", trovato "' + toStr(currentHeaders[i]) + '"');
    }
  }
  
  if (isCorrect) {
    log('Richieste: struttura corretta ✓', null);
    return true;
  }
  
  // STRUTTURA ERRATA → Chiedi conferma e ripristina
  log('Richieste: struttura ERRATA', differences);
  
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    '⚠️ Struttura Richieste NON Corretta',
    'Il foglio Richieste ha una struttura diversa da quella attesa.\n\n' +
    'Problemi trovati:\n' + differences.join('\n') + '\n\n' +
    'Vuoi ripristinare la struttura corretta?\n' +
    '(Le intestazioni verranno aggiornate, i dati esistenti saranno preservati)',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    // Ripristina intestazioni
    sheet.getRange('A1:J1').setValues([expectedHeaders]);
    sheet.getRange('A1:J1').setFontWeight('bold').setBackground('#ea4335').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, 10);
    
    log('Richieste: struttura RIPRISTINATA ✓', null);
    
    ui.alert(
      '✓ Struttura Ripristinata',
      'Le intestazioni del foglio Richieste sono state corrette.\n\n' +
      'IMPORTANTE: Verifica che il Form sia allineato alla nuova struttura.\n' +
      'Usa: Menu → Rigenera Form collegato',
      ui.ButtonSet.OK
    );
    
    return true;
  } else {
    log('Richieste: ripristino ANNULLATO dall\'utente', null);
    return false;
  }
}

/**
 * Applica formattazione condizionale al Planner.
 */
function applyPlannerConditionalFormatting() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow < 2 || lastCol < 3) return;
  
  var dataRange = sheet.getRange(2, 3, lastRow - 1, lastCol - 2);
  
  // Rimuovi regole esistenti
  sheet.clearConditionalFormatRules();
  
  // Regola per "P" (Permesso) - azzurro
  var ruleP = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('P')
    .setBackground('#b3e5fc')
    .setFontColor('#01579b')
    .setBold(true)
    .setRanges([dataRange])
    .build();
  
  // Regola per "F" (Ferie) - giallo
  var ruleF = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('F')
    .setBackground('#fff9c4')
    .setFontColor('#f57f17')
    .setBold(true)
    .setRanges([dataRange])
    .build();
  
  sheet.setConditionalFormatRules([ruleP, ruleF]);
}

/**
 * Protegge il foglio Planner con avviso.
 */
function protectPlannerSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
  // Rimuovi protezioni esistenti
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  protections.forEach(function(p) {
    p.remove();
  });
  
  // Aggiungi protezione con warning
  var protection = sheet.protect().setDescription('Planner protetto - modificare solo tramite script');
  protection.setWarningOnly(true);
}
