/**
 * ========================================
 * PLANNER PERMESSI E FERIE - GEMMA/ZAFFIRO
 * ========================================
 * Sistema per gestire richieste di ferie/permessi tramite Google Form
 * con validazione automatica e planner mensile.
 * 
 * @author Massimo
 * @version 1.0
 */

// ==================== MENU PERSONALIZZATO ====================

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

// ==================== SETUP INIZIALE ====================

/**
 * Esegue il setup completo del sistema:
 * - Crea tutti i fogli necessari
 * - Configura intestazioni e valori di default
 * - Crea/aggiorna il planner mensile
 * - Applica formattazione e protezioni
 * - Crea/aggiorna il Google Form
 * - Installa i trigger
 */
function runInitialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Crea fogli se non esistono
  createSheetIfNotExists('Config');
  createSheetIfNotExists('Dipendenti');
  createSheetIfNotExists('Richieste');
  createSheetIfNotExists('Planner-Mensile');
  createSheetIfNotExists('Riepilogo');
  
  // 2. Setup Config
  setupConfigSheet();
  
  // 3. Setup Dipendenti
  setupDipendentiSheet();
  
  // 4. Setup Richieste
  setupRichiesteSheet();
  
  // 5. Setup Planner-Mensile
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth(); // 0-11
  createOrUpdateMonthlyPlanner(year, month);
  applyPlannerFormatting();
  protectPlannerSheet();
  
  // 6. Setup Riepilogo
  setupRiepilogoSheet();
  
  // 7. Crea/aggiorna Form
  createOrUpdateForm();
  
  // 8. Installa trigger
  installOnFormSubmitTrigger();
  
  SpreadsheetApp.getUi().alert(
    'Setup completato!\n\n' +
    '✓ Fogli creati/aggiornati\n' +
    '✓ Planner mensile generato\n' +
    '✓ Form collegato\n' +
    '✓ Trigger installato\n\n' +
    'Controlla il foglio Richieste per il link al Form.'
  );
}

/**
 * Crea un foglio se non esiste già.
 */
function createSheetIfNotExists(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    ss.insertSheet(sheetName);
  }
}

/**
 * Setup foglio Config con limiti giornalieri e mensili.
 */
function setupConfigSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  
  // Intestazioni
  sheet.getRange('A1:B1').setValues([['Giorno', 'Max']]);
  sheet.getRange('A1:B1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  
  // Giorni della settimana con limiti di default
  var giorni = [
    ['Lunedi', 2],
    ['Martedi', 2],
    ['Mercoledi', 2],
    ['Giovedi', 2],
    ['Venerdi', 2],
    ['Sabato', 1],
    ['Domenica', 1]
  ];
  
  sheet.getRange(2, 1, giorni.length, 2).setValues(giorni);
  
  // Limite mensile
  sheet.getRange('A10').setValue('MaxRichiesteMensili');
  sheet.getRange('B10').setValue(6);
  sheet.getRange('A10:B10').setFontWeight('bold').setBackground('#fbbc04');
}

/**
 * Setup foglio Dipendenti con intestazioni e dati di esempio.
 */
function setupDipendentiSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Dipendenti');
  
  // Intestazioni
  var headers = [['ID', 'Nome', 'Sede', 'Ruolo', 'Email']];
  sheet.getRange('A1:E1').setValues(headers);
  sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#34a853').setFontColor('#ffffff');
  
  // Controlla se ci sono già dati (oltre l'intestazione)
  if (sheet.getLastRow() <= 1) {
    // Dipendenti di esempio
    var dipendenti = [
      ['001', 'Mario Rossi', 'Gemma', 'Operatore', 'mario.rossi@example.com'],
      ['002', 'Laura Bianchi', 'Zaffiro', 'Coordinatore', 'laura.bianchi@example.com'],
      ['003', 'Giuseppe Verdi', 'Boario', 'Tecnico', 'giuseppe.verdi@example.com']
    ];
    sheet.getRange(2, 1, dipendenti.length, 5).setValues(dipendenti);
  }
  
  sheet.autoResizeColumns(1, 5);
}

/**
 * Setup foglio Richieste con intestazioni.
 */
function setupRichiesteSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Richieste');
  
  // Intestazioni
  var headers = [['Timestamp', 'ID_Dipendente', 'Nome', 'Sede', 'Tipo', 'Data', 'Giorni', 'Stato', 'Motivazione_Admin', 'Note']];
  sheet.getRange('A1:J1').setValues(headers);
  sheet.getRange('A1:J1').setFontWeight('bold').setBackground('#ea4335').setFontColor('#ffffff');
  
  sheet.autoResizeColumns(1, 10);
}

/**
 * Setup foglio Riepilogo con intestazioni.
 */
function setupRiepilogoSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Riepilogo');
  
  // Intestazioni
  var headers = [['ID_Dipendente', 'Nome', 'Sede', 'Mese', 'Totale_Ferie', 'Totale_Permessi']];
  sheet.getRange('A1:F1').setValues(headers);
  sheet.getRange('A1:F1').setFontWeight('bold').setBackground('#9c27b0').setFontColor('#ffffff');
  
  sheet.autoResizeColumns(1, 6);
}

// ==================== GESTIONE PLANNER ====================

/**
 * Crea o aggiorna il planner mensile con tutte le date del mese.
 * @param {number} year - Anno (es. 2025)
 * @param {number} month - Mese (0-11, dove 0 = Gennaio)
 */
function createOrUpdateMonthlyPlanner(year, month) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Planner-Mensile');
  
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
    dates.push([new Date(year, month, d)]);
  }
  
  // Scrivi le date dalla colonna C in poi
  sheet.getRange(1, 3, 1, numDays).setValues([dates.map(function(d) { return d[0]; })]);
  sheet.getRange(1, 3, 1, numDays).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(1, 3, 1, numDays).setFontWeight('bold').setBackground('#673ab7').setFontColor('#ffffff');
  
  // Aggiungi tutti i dipendenti
  var dipSheet = ss.getSheetByName('Dipendenti');
  var dipData = dipSheet.getRange(2, 1, dipSheet.getLastRow() - 1, 5).getValues();
  
  var rowIndex = 2;
  dipData.forEach(function(dip) {
    var id = dip[0];
    var nome = dip[1];
    var sede = dip[2];
    
    if (nome && sede) {
      sheet.getRange(rowIndex, 1).setValue(nome);
      sheet.getRange(rowIndex, 2).setValue(sede + ' / ' + id);
      rowIndex++;
    }
  });
  
  sheet.autoResizeColumns(1, 2);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
}

/**
 * Applica formattazione condizionale al Planner.
 */
function applyPlannerFormatting() {
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
 * Protegge il foglio Planner con avviso (warning mode).
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
  
  // Trova o crea la riga del dipendente
  var rowIndex = findOrCreateEmployeeRow(nome, sede, idDip);
  
  // Trova la colonna della data
  var colIndex = findDateColumn(date);
  
  if (colIndex === -1) {
    Logger.log('Data ' + date + ' non trovata nel planner corrente');
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
function findOrCreateEmployeeRow(nome, sede, idDip) {
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
function findDateColumn(targetDate) {
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var plannerSheet = ss.getSheetByName('Planner-Mensile');
  var richiesteSheet = ss.getSheetByName('Richieste');
  
  // Svuota l'area dati del planner (mantieni intestazioni)
  var lastRow = plannerSheet.getLastRow();
  var lastCol = plannerSheet.getLastColumn();
  
  if (lastRow > 1 && lastCol >= 3) {
    plannerSheet.getRange(2, 3, lastRow - 1, lastCol - 2).clear();
  }
  
  // Leggi tutte le richieste
  var richiesteData = richiesteSheet.getRange(2, 1, richiesteSheet.getLastRow() - 1, 10).getValues();
  
  richiesteData.forEach(function(row) {
    var stato = toStr(row[7]); // Colonna H (Stato)
    
    if (stato === 'APPROVED' || stato === 'FORCED') {
      var idDip = toStr(row[1]); // Colonna B
      var nome = toStr(row[2]); // Colonna C
      var sede = toStr(row[3]); // Colonna D
      var tipo = toStr(row[4]); // Colonna E
      var data = row[5]; // Colonna F
      var giorni = parseInt(row[6]) || 1; // Colonna G
      
      if (data) {
        addToPlanner(idDip, nome, sede, tipo, data, giorni);
      }
    }
  });
  
  SpreadsheetApp.getUi().alert('Planner rielaborato con successo!');
}

// ==================== GOOGLE FORM ====================

/**
 * Crea o aggiorna il Google Form collegato al foglio.
 */
function createOrUpdateForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formUrl = ss.getFormUrl();
  var form;
  
  if (formUrl) {
    // Form già collegato
    form = FormApp.openByUrl(formUrl);
    // Elimina tutte le domande esistenti
    form.getItems().forEach(function(item) {
      form.deleteItem(item);
    });
  } else {
    // Crea nuovo form
    form = FormApp.create('Richiesta Ferie/Permessi - ' + ss.getName());
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    
    // Collega al foglio Richieste
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  }
  
  // Configura il form
  form.setTitle('Richiesta Ferie e Permessi');
  form.setDescription(
    'Compila questo modulo per richiedere ferie o permessi.\n' +
    'Le richieste verranno validate automaticamente in base ai limiti aziendali.'
  );
  form.setCollectEmail(false);
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(true);
  
  // Domanda 1: ID Dipendente
  form.addTextItem()
    .setTitle('ID Dipendente')
    .setHelpText('Inserisci il tuo ID dipendente (es. 001)')
    .setRequired(true);
  
  // Domanda 2: Nome
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
  
  // Domanda 4: Tipo
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
  
  // Domanda 7: Note
  form.addParagraphTextItem()
    .setTitle('Note (opzionale)')
    .setHelpText('Eventuali note o richieste particolari')
    .setRequired(false);
  
  // Salva l'URL del form come nota nella cella A1 di Richieste
  var richiesteSheet = ss.getSheetByName('Richieste');
  var formLink = form.getPublishedUrl();
  richiesteSheet.getRange('A1').setNote('Link al Form: ' + formLink);
  
  SpreadsheetApp.getUi().alert(
    'Form creato/aggiornato con successo!\n\n' +
    'Link: ' + formLink + '\n\n' +
    'Il link è stato salvato come nota nella cella A1 del foglio Richieste.'
  );
}

// ==================== TRIGGER ====================

/**
 * Installa il trigger per gestire le risposte del form.
 */
function installOnFormSubmitTrigger() {
  // Elimina trigger duplicati
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Crea nuovo trigger
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  
  SpreadsheetApp.getUi().alert('Trigger installato con successo!');
}

// ==================== VALIDAZIONE RICHIESTE ====================

/**
 * Gestisce l'invio del form e valida la richiesta.
 * @param {Object} e - Evento form submit
 */
function onFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var richiesteSheet = ss.getSheetByName('Richieste');
  
  // Leggi l'ultima riga inserita
  var lastRow = richiesteSheet.getLastRow();
  var rowData = richiesteSheet.getRange(lastRow, 1, 1, 10).getValues()[0];
  
  // Estrai i dati
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
  
  // Leggi configurazione
  var config = readConfig();
  var maxPerGiorno = getMaxForDay(config, data);
  var maxMensili = config.maxMensili;
  
  // Calcola richieste già approvate
  var approvedCountForDay = countApprovedAbsencesForDateAndSede(data, sede);
  var approvedMonthlyForDip = countApprovedThisMonthForDipendente(idDip, data.getMonth(), data.getFullYear());
  
  var stato = '';
  var motivazione = '';
  var note = '';
  
  // Validazione: limite mensile
  if (approvedMonthlyForDip >= maxMensili) {
    stato = 'REJECTED';
    motivazione = 'Limite mensile raggiunto (' + maxMensili + ' richieste)';
  }
  // Validazione: limite giornaliero
  else if (approvedCountForDay >= maxPerGiorno) {
    stato = 'REJECTED';
    var namesApproved = getNamesApprovedForDate(data, sede);
    note = 'Limite giornaliero raggiunto (' + maxPerGiorno + '). Già approvati: ' + namesApproved.join(', ');
  }
  // Approvazione automatica
  else {
    stato = 'APPROVED';
    motivazione = 'Approvato automaticamente';
    
    // Aggiorna il planner
    addToPlanner(idDip, nome, sede, tipo, data, giorni);
  }
  
  // Scrivi stato e motivazione
  richiesteSheet.getRange(lastRow, 8).setValue(stato); // Colonna H
  richiesteSheet.getRange(lastRow, 9).setValue(motivazione); // Colonna I
  richiesteSheet.getRange(lastRow, 10).setValue(note); // Colonna J
  
  // Colora la riga in base allo stato
  var color = (stato === 'APPROVED') ? '#d9ead3' : '#f4cccc';
  richiesteSheet.getRange(lastRow, 1, 1, 10).setBackground(color);
}

// ==================== FORZATURA RICHIESTE ====================

/**
 * Mostra il dialog per forzare l'approvazione di una richiesta.
 */
function showForceApproveDialog() {
  var html = HtmlService.createHtmlOutputFromFile('forceApproveDialog')
    .setWidth(400)
    .setHeight(300);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Forza Approvazione Richiesta');
}

/**
 * Forza l'approvazione di una richiesta ignorando i limiti.
 * @param {number} rowNumber - Numero di riga nel foglio Richieste
 * @param {string} reason - Motivazione della forzatura
 * @return {Object} Risultato dell'operazione
 */
function forceApproveRequest(rowNumber, reason) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var richiesteSheet = ss.getSheetByName('Richieste');
    
    if (rowNumber < 2 || rowNumber > richiesteSheet.getLastRow()) {
      return {
        success: false,
        message: 'Numero di riga non valido. Deve essere tra 2 e ' + richiesteSheet.getLastRow()
      };
    }
    
    // Leggi i dati della riga
    var rowData = richiesteSheet.getRange(rowNumber, 1, 1, 10).getValues()[0];
    
    var idDip = toStr(rowData[1]);
    var nome = toStr(rowData[2]);
    var sede = toStr(rowData[3]);
    var tipo = toStr(rowData[4]);
    var data = rowData[5];
    var giorni = parseInt(rowData[6]) || 1;
    
    if (!nome || !data) {
      return {
        success: false,
        message: 'Dati mancanti nella riga selezionata'
      };
    }
    
    // Converti data se necessario
    if (!(data instanceof Date)) {
      data = new Date(data);
    }
    
    // Imposta stato FORCED
    var motivazione = reason || 'Forzata dall\'amministratore';
    richiesteSheet.getRange(rowNumber, 8).setValue('FORCED'); // Colonna H
    richiesteSheet.getRange(rowNumber, 9).setValue(motivazione); // Colonna I
    richiesteSheet.getRange(rowNumber, 1, 1, 10).setBackground('#fff2cc');
    
    // Aggiorna il planner
    addToPlanner(idDip, nome, sede, tipo, data, giorni);
    
    return {
      success: true,
      message: 'Richiesta forzata con successo!\n\nRiga: ' + rowNumber + '\nDipendente: ' + nome + '\nData: ' + Utilities.formatDate(data, Session.getScriptTimeZone(), 'yyyy-MM-dd')
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Errore: ' + error.message
    };
  }
}

// ==================== FUNZIONI UTILITY ====================

/**
 * Confronta due date (solo giorno/mese/anno, ignora ora).
 * @param {Date} a - Prima data
 * @param {Date} b - Seconda data
 * @return {boolean} True se le date sono uguali
 */
function sameDate(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

/**
 * Converte un valore in stringa in modo sicuro.
 * @param {*} v - Valore da convertire
 * @return {string} Stringa risultante
 */
function toStr(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

/**
 * Legge la configurazione dal foglio Config.
 * @return {Object} Oggetto con configurazione
 */
function readConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  
  var config = {
    giorni: {},
    maxMensili: 6
  };
  
  // Leggi limiti giornalieri (righe 2-8)
  var giorni = sheet.getRange(2, 1, 7, 2).getValues();
  giorni.forEach(function(row) {
    var giorno = toStr(row[0]);
    var max = parseInt(row[1]) || 2;
    config.giorni[giorno] = max;
  });
  
  // Leggi limite mensile (riga 10)
  var maxMensiliValue = sheet.getRange('B10').getValue();
  if (maxMensiliValue && !isNaN(maxMensiliValue)) {
    config.maxMensili = parseInt(maxMensiliValue);
  }
  
  return config;
}

/**
 * Ottiene il limite massimo di assenze per una data specifica.
 * @param {Object} config - Configurazione
 * @param {Date} date - Data da controllare
 * @return {number} Limite massimo
 */
function getMaxForDay(config, date) {
  var giornoSettimana = date.getDay(); // 0=Domenica, 1=Lunedi, ...
  var nomiGiorni = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
  var nomeGiorno = nomiGiorni[giornoSettimana];
  
  return config.giorni[nomeGiorno] || 2;
}

/**
 * Conta le assenze già approvate per una data e sede specifiche.
 * @param {Date} date - Data da controllare
 * @param {string} sede - Sede da controllare
 * @return {number} Numero di assenze approvate
 */
function countApprovedAbsencesForDateAndSede(date, sede) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var richiesteSheet = ss.getSheetByName('Richieste');
  
  var data = richiesteSheet.getRange(2, 1, richiesteSheet.getLastRow() - 1, 10).getValues();
  
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
  var richiesteSheet = ss.getSheetByName('Richieste');
  
  var data = richiesteSheet.getRange(2, 1, richiesteSheet.getLastRow() - 1, 10).getValues();
  
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
  var richiesteSheet = ss.getSheetByName('Richieste');
  
  var data = richiesteSheet.getRange(2, 1, richiesteSheet.getLastRow() - 1, 10).getValues();
  
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
