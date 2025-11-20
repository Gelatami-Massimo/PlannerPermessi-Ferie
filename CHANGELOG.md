# Changelog

Tutte le modifiche rilevanti al progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [2.1.0] - 2025-11-20

### Aggiunto
- **Sistema di Logging Completo**:
  - Nuovo foglio `Log` per audit e debug sistematico
  - Funzione `logEvent()` in Utils.gs per tracciamento eventi
  - Eventi tracciati: REQUEST_SUBMIT, REQUEST_APPROVED, REQUEST_REJECTED, FORCED_APPROVE, SETUP_RUN, ERROR
  - 9 colonne Log: Timestamp, Evento, Dettagli, ID_Dipendente, Nome, Sede, Tipo, Data_Richiesta, Note_Tecniche
- **Integrazione logging** in punti critici:
  - onFormSubmit: arrivo richiesta, approvazione/rifiuto con dettagli limiti
  - forceApproveRequest: approvazioni forzate con motivazione amministratore
  - runInitialSetup: tracciamento esecuzione setup completo
  - Blocchi catch: registrazione errori con stacktrace completo in Note_Tecniche
- Funzione `initializeLogSheet()` in Main_App.gs
- Voce menu "Info versione" per mostrare versione corrente
- Sezione "Log" nel README.md con esempi pratici per audit e debug

### Modificato
- Utils.gs: aggiunta funzione `logEvent()` con auto-creazione foglio e intestazioni
- Request_Service.gs: logging completo per ogni decisione di validazione
- Admin_UI.gs: logging approvazioni forzate con riga e motivazione
- Main_App.gs: 
  - `Log` aggiunto a `createAllSheets()`
  - Chiamata `initializeLogSheet()` e `logEvent()` in setup
  - Logging per successo/errore setup con stacktrace
- README.md: nuova sezione dettagliata sul foglio Log e suo utilizzo

## [2.0.0] - 2025-11-20

### Aggiunto
- Architettura modulare con 8 file .gs separati
- Verifica automatica struttura foglio Richieste
- Ricostruzione automatica intestazioni se incorrette
- Sistema di logging avanzato con timestamp
- Protezione foglio Planner con warning-only
- Formattazione condizionale automatica (F=giallo, P=azzurro)
- Dialog HTML moderno per forzatura approvazioni
- Gestione completa OAuth scopes in appsscript.json
- Supporto CLASP per deploy automatico
- Documentazione completa README.md

### Modificato
- Separazione logica in servizi specializzati
- Migliorata gestione errori con try-catch
- Ottimizzata validazione richieste
- Standardizzazione naming conventions

### Funzionalità Core
- ✅ Validazione automatica limiti giornalieri per sede
- ✅ Validazione automatica limiti mensili per dipendente
- ✅ Aggiornamento automatico Planner-Mensile
- ✅ Google Form collegato automaticamente
- ✅ Trigger onFormSubmit configurato automaticamente
- ✅ Forzatura admin con motivazione obbligatoria
- ✅ Rielaborazione completa planner da richieste approvate

### Tecnico
- Runtime: V8
- TimeZone: Europe/Rome
- OAuth: Spreadsheets, Forms, Drive, UI, Mail
- Git: Branch dev per sviluppo, main per produzione

---

## [1.0.0] - 2025-11-18

### Aggiunto
- Versione iniziale monolitica
- File Code.gs unico
- Setup manuale fogli
- Form base collegato

---

## Template per Future Release

### [Unreleased]

### Aggiunto
- Nuove funzionalità da implementare

### Modificato
- Miglioramenti a funzionalità esistenti

### Deprecato
- Funzionalità che saranno rimosse

### Rimosso
- Funzionalità eliminate

### Corretto
- Bug fix

### Sicurezza
- Correzioni vulnerabilità
