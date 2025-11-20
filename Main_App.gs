/**
 * ========================================
 * MAIN_APP.GS
 * Entry point e orchestratore principale
 * ========================================
 */

/**
 * Crea il menu personalizzato all'apertura del foglio.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Cartellini MASTER')
    .addItem('Setup iniziale (fogli, form, trigger)', 'runInitialSetup')
    .addSeparator()
    .addItem('Forza approva richiesta…', 'showForceApproveDialog')
    .addItem('Rielabora Planner (tutto)', 'rebuildPlannerFromApproved')
    .addSeparator()
    .addItem('Rigenera Form collegato', 'createOrUpdateForm')
    .addItem('Reinstalla trigger onFormSubmit', 'installOnFormSubmitTrigger')
    .addToUi();
}

/**
 * Esegue il setup completo del sistema.
 * Coordina tutti i servizi per inizializzare il progetto.
 */
function runInitialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // 1. Crea tutti i fogli necessari
    createAllSheets();
    
    // 2. Inizializza foglio Config
    initializeConfigSheet();
    
    // 3. Inizializza foglio Dipendenti
    initializeDipendentiSheet();
    
    // 4. Inizializza foglio Richieste
    initializeRichiesteSheet();
    
    // 5. Inizializza foglio Riepilogo
    initializeRiepilogoSheet();
    
    // 6. Crea/aggiorna planner mensile corrente
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth(); // 0-11
    createOrUpdateMonthlyPlanner(year, month);
    
    // 7. Applica formattazione al planner
    applyPlannerConditionalFormatting();
    
    // 8. Proteggi il foglio planner
    protectPlannerSheet();
    
    // 9. Crea/aggiorna Form collegato
    createOrUpdateForm();
    
    // 10. Installa trigger onFormSubmit
    installOnFormSubmitTrigger();
    
    SpreadsheetApp.getUi().alert(
      '✓ SETUP COMPLETATO!\n\n' +
      '• Fogli creati e configurati\n' +
      '• Planner mensile generato\n' +
      '• Form collegato e funzionante\n' +
      '• Trigger installato\n\n' +
      'Controlla il foglio Richieste (cella A1) per il link al Form.'
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      '✗ ERRORE DURANTE IL SETUP\n\n' +
      error.message + '\n\n' +
      'Verifica i permessi e riprova.'
    );
    log('Errore in runInitialSetup', error);
  }
}

/**
 * Crea tutti i fogli se non esistono.
 */
function createAllSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetNames = ['Config', 'Dipendenti', 'Richieste', 'Planner-Mensile', 'Riepilogo'];
  
  sheetNames.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
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
  
  // Intestazioni
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
