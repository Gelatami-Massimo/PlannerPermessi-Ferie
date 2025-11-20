# 📅 Planner Permessi e Ferie – Gemma/Zaffiro

Sistema completo e modulare per la gestione delle richieste di ferie e permessi dei dipendenti tramite Google Sheets e Google Apps Script.

## 📋 Indice

- [Panoramica](#panoramica)
- [Architettura del Progetto](#architettura-del-progetto)
- [Funzionalità Principali](#funzionalità-principali)
- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Utilizzo](#utilizzo)
- [Gestione Amministratore](#gestione-amministratore)
- [Struttura dei Fogli](#struttura-dei-fogli)
- [Risoluzione Problemi](#risoluzione-problemi)
- [Estensioni Future](#estensioni-future)

## 🎯 Panoramica

Questo sistema permette di:
- **Gestire richieste di ferie/permessi** tramite Google Form
- **Validare automaticamente** le richieste in base a limiti configurabili
- **Visualizzare un planner mensile** per sede e dipendente
- **Forzare approvazioni** (solo amministratore) per casi eccezionali

I dipendenti compilano un form senza accedere direttamente al foglio di calcolo, garantendo l'integrità dei dati.

## 🏗️ Architettura del Progetto

Il progetto è strutturato in modo modulare con responsabilità separate:

### File Principali

| File | Responsabilità |
|------|----------------|
| **appsscript.json** | Manifest del progetto (scopes OAuth, timezone, runtime) |
| **Main_App.gs** | Entry point, menu personalizzato, orchestratore setup |
| **Config_Service.gs** | Lettura configurazione limiti dal foglio Config |
| **Employee_Service.gs** | Gestione anagrafica dipendenti |
| **Request_Service.gs** | Validazione richieste e trigger onFormSubmit |
| **Planner_Service.gs** | Gestione planner mensile (creazione, aggiornamento) |
| **Form_Service.gs** | Creazione/aggiornamento Google Form e trigger |
| **Admin_UI.gs** | Funzioni per UI amministratore (forza approvazione) |
| **Utils.gs** | Funzioni utility comuni (date, stringhe, logging) |
| **forceApproveDialog.html** | Dialog HTML per forzare approvazioni |

### Flusso di Lavoro

```
1. Dipendente → Compila Google Form
2. Form → Invia risposta a foglio Richieste
3. Trigger onFormSubmit → Attiva Request_Service.gs
4. Request_Service.gs → Valida limiti (Config_Service + Employee_Service)
5. Se APPROVED → Planner_Service.gs aggiorna il planner
6. Se REJECTED → Scrive motivazione nel foglio Richieste
7. Admin (opzionale) → Può forzare approvazione tramite dialog
```

## ✨ Funzionalità Principali

### Per i Dipendenti
- ✅ Richiesta ferie/permessi tramite form online
- ✅ Validazione automatica dei limiti mensili e giornalieri
- ✅ Notifica immediata dello stato della richiesta

### Per l'Amministratore
- 🔧 Setup automatizzato completo
- 📊 Planner mensile con visualizzazione colorata (F=Ferie, P=Permesso)
- 🚀 Forzatura approvazioni per casi speciali
- ⚙️ Configurazione flessibile dei limiti
- 🔄 Rielaborazione completa del planner

## 📦 Prerequisiti

- **Account Google** con accesso a Google Drive
- **Google Sheets** (gratuito con account Google)
- **Google Apps Script** (integrato in Google Sheets)
- Browser web aggiornato (Chrome, Firefox, Edge, Safari)

## 🚀 Installazione

### Passo 1: Crea un Nuovo Foglio Google

1. Vai su [Google Sheets](https://sheets.google.com)
2. Clicca su **+ Vuoto** per creare un nuovo foglio
3. Rinomina il foglio come: `Planner Permessi - Gemma/Zaffiro`

### Passo 2: Apri l'Editor di Script

1. Nel foglio Google, vai su **Estensioni** → **Apps Script**
2. Si aprirà l'editor di script in una nuova scheda

### Passo 3: Crea il File Manifest

1. Nell'editor Apps Script, clicca sull'icona **⚙️ Impostazioni progetto** (a sinistra)
2. Spunta la casella **"Mostra file 'appsscript.json' nell'editor"**
3. Torna a **Editor** (icona **< >**)
4. Vedrai ora il file `appsscript.json`
5. Copia il contenuto del file **appsscript.json** fornito
6. Incollalo nell'editor, sostituendo il contenuto esistente

### Passo 4: Copia i File di Codice

Crea i seguenti file `.gs` cliccando sul pulsante **+** accanto a "File" → **Script**:

#### 1. Main_App.gs
- Rinomina il file `Code.gs` esistente in `Main_App`
- Copia il contenuto del file **Main_App.gs** fornito
- Incolla nell'editor

#### 2. Config_Service.gs
- Clicca **+** → **Script**
- Nomina: `Config_Service`
- Copia e incolla il contenuto fornito

#### 3. Employee_Service.gs
- Clicca **+** → **Script**
- Nomina: `Employee_Service`
- Copia e incolla il contenuto fornito

#### 4. Request_Service.gs
- Clicca **+** → **Script**
- Nomina: `Request_Service`
- Copia e incolla il contenuto fornito

#### 5. Planner_Service.gs
- Clicca **+** → **Script**
- Nomina: `Planner_Service`
- Copia e incolla il contenuto fornito

#### 6. Form_Service.gs
- Clicca **+** → **Script**
- Nomina: `Form_Service`
- Copia e incolla il contenuto fornito

#### 7. Admin_UI.gs
- Clicca **+** → **Script**
- Nomina: `Admin_UI`
- Copia e incolla il contenuto fornito

#### 8. Utils.gs
- Clicca **+** → **Script**
- Nomina: `Utils`
- Copia e incolla il contenuto fornito

#### 9. forceApproveDialog.html
- Clicca **+** → **HTML**
- Nomina: `forceApproveDialog`
- Copia e incolla il contenuto fornito

### Passo 5: Salva il Progetto

1. Clicca sull'icona del **disco** (💾) o premi `Ctrl+S` / `Cmd+S`
2. Rinomina il progetto: `Planner Permessi Script`
3. Clicca su **OK**

### Passo 6: Esegui il Setup Iniziale

1. Torna al foglio Google Sheets
2. Ricarica la pagina (F5) per far apparire il nuovo menu
3. Vedrai un nuovo menu: **"Cartellini MASTER"**
4. Clicca su **Cartellini MASTER** → **Setup iniziale (fogli, form, trigger)**

> ⚠️ **Importante**: La prima volta che esegui lo script, Google chiederà l'autorizzazione:
> 1. Clicca su **Rivedi autorizzazioni**
> 2. Seleziona il tuo account Google
> 3. Clicca su **Avanzate** → **Vai a Planner Permessi Script (non sicuro)**
> 4. Clicca su **Consenti**

5. Lo script creerà automaticamente:
   - ✓ Tutti i fogli necessari (Config, Dipendenti, Richieste, Planner-Mensile, Riepilogo)
   - ✓ Intestazioni e valori di default
   - ✓ Planner mensile per il mese corrente
   - ✓ Google Form collegato
   - ✓ Trigger automatici

6. Apparirà un messaggio di conferma: **"Setup completato!"**

## ⚙️ Configurazione

### Foglio "Config"

Dopo il setup, personalizza i limiti aziendali:

| Giorno | Max | Descrizione |
|--------|-----|-------------|
| Lunedi | 2 | Max 2 assenti per lunedì |
| Martedi | 2 | Max 2 assenti per martedì |
| Mercoledi | 2 | Max 2 assenti per mercoledì |
| Giovedi | 2 | Max 2 assenti per giovedì |
| Venerdi | 2 | Max 2 assenti per venerdì |
| Sabato | 1 | Max 1 assente per sabato |
| Domenica | 1 | Max 1 assente per domenica |

**Riga speciale (A10:B10):**
- **MaxRichiesteMensili**: 6 (numero massimo di richieste per dipendente al mese)

### Foglio "Dipendenti"

Aggiorna l'elenco dei dipendenti:

| ID | Nome | Sede | Ruolo | Email |
|----|------|------|-------|-------|
| 001 | Mario Rossi | Gemma | Operatore | mario.rossi@example.com |
| 002 | Laura Bianchi | Zaffiro | Coordinatore | laura.bianchi@example.com |

> 💡 **Suggerimento**: Mantieni gli ID brevi e univoci (es. 001, 002, 003)

## 🎯 Utilizzo

### Recupero Link al Form

1. Apri il foglio **"Richieste"**
2. Passa il mouse sulla cella **A1** (intestazione "Timestamp")
3. Vedrai una **nota** con il link al form
4. Copia e condividi questo link con i dipendenti

**Oppure:**
- Menu **Cartellini MASTER** → **Rigenera Form collegato**
- Il link apparirà in un popup

### Compilazione Richiesta (Dipendenti)

1. Apri il link al form
2. Compila tutti i campi:
   - **ID Dipendente**: il tuo codice (es. 001)
   - **Nome Completo**: nome e cognome
   - **Sede**: seleziona dalla lista (Gemma, Zaffiro, Boario)
   - **Tipo di Richiesta**: FERIE o PERMESSO
   - **Data**: seleziona la data desiderata
   - **Giorni**: inserisci 1 (al momento gestito solo 1 giorno)
   - **Note**: eventuali note (opzionale)
3. Clicca su **Invia**

### Validazione Automatica

Lo script valida automaticamente:

✅ **APPROVED** (Approvato) se:
- Il dipendente non ha raggiunto il limite mensile
- Non è stato raggiunto il limite giornaliero per quella sede

❌ **REJECTED** (Rifiutato) se:
- Limite mensile raggiunto (es. 6 richieste)
- Limite giornaliero raggiunto (es. 2 persone già assenti quel giorno)

Le richieste approvate vengono automaticamente aggiunte al Planner-Mensile.

### Visualizzazione Planner

Apri il foglio **"Planner-Mensile"** per vedere:
- **Righe**: dipendenti organizzati per nome e sede
- **Colonne**: tutte le date del mese corrente
- **Celle**:
  - **P** (azzurro) = Permesso
  - **F** (giallo) = Ferie

Il planner è protetto e viene aggiornato solo dallo script.

## 👨‍💼 Gestione Amministratore

### Menu "Cartellini MASTER"

| Voce Menu | Descrizione |
|-----------|-------------|
| **Setup iniziale** | Crea/ricrea tutti i fogli, form e trigger |
| **Forza approva richiesta…** | Approva manualmente una richiesta ignorando i limiti |
| **Rielabora Planner (tutto)** | Ricostruisce il planner da tutte le richieste approvate |
| **Rigenera Form collegato** | Ricrea il form e mostra il nuovo link |
| **Reinstalla trigger** | Reinstalla il trigger per le risposte del form |

### Forzare un'Approvazione

Usa questa funzione per approvare richieste eccezionali:

1. Apri il foglio **"Richieste"**
2. Trova la riga della richiesta da forzare (es. riga 5)
3. Menu **Cartellini MASTER** → **Forza approva richiesta…**
4. Inserisci:
   - **Numero di Riga**: 5
   - **Motivazione**: "Approvato per urgenza aziendale"
5. Clicca su **✓ Forza Approvazione**

La richiesta verrà impostata come **FORCED** e aggiunta al planner.

### Rielaborare il Planner

Se hai modificato manualmente delle richieste:

1. Menu **Cartellini MASTER** → **Rielabora Planner (tutto)**
2. Lo script:
   - Svuota il planner
   - Legge tutte le richieste APPROVED/FORCED
   - Ricostruisce il planner completo

## 📊 Struttura dei Fogli

### Config
Configurazione limiti giornalieri e mensili.

| Colonna A | Colonna B |
|-----------|-----------|
| Giorno | Max |
| Lunedi | 2 |
| ... | ... |
| MaxRichiesteMensili | 6 |

### Dipendenti
Anagrafica dipendenti con ID, nome, sede, ruolo ed email.

### Richieste
Registro di tutte le richieste con stato e motivazione.

**Colonne**: Timestamp | ID_Dipendente | Nome | Sede | Tipo | Data | Giorni | Stato | Motivazione_Admin | Note

**Stati possibili**:
- `PENDING`: In attesa (non usato, validazione immediata)
- `APPROVED`: Approvato automaticamente
- `REJECTED`: Rifiutato per limiti
- `FORCED`: Approvato forzatamente dall'amministratore
- `ERROR`: Errore durante la validazione

### Planner-Mensile
Calendario visuale delle assenze.

- **Riga 1**: Intestazioni con le date
- **Righe 2+**: Un dipendente per riga
- **Colonne**: Data (es. 01/11/2025), Nome, Sede, poi una colonna per ogni giorno

**Simboli**:
- `P` = Permesso (azzurro)
- `F` = Ferie (giallo)

### Riepilogo
Statistiche mensili per dipendente (ferie/permessi totali).

### Log
**Sistema di audit e debug** per tracciare ogni evento critico del sistema.

**Colonne**: Timestamp | Evento | Dettagli | ID_Dipendente | Nome | Sede | Tipo | Data_Richiesta | Note_Tecniche

**Tipi di eventi registrati**:
- `REQUEST_SUBMIT`: Nuova richiesta ricevuta dal form
- `REQUEST_APPROVED`: Richiesta approvata automaticamente
- `REQUEST_REJECTED`: Richiesta rifiutata (limite mensile o giornaliero)
- `FORCED_APPROVE`: Approvazione forzata da amministratore
- `SETUP_RUN`: Esecuzione setup iniziale
- `ERROR`: Errori critici con stacktrace completo

**Utilizzo del Log**:
- 🔍 **Audit**: verifica chi ha fatto cosa e quando
- 🐛 **Debug**: analizza errori con stacktrace completi in Note_Tecniche
- 📊 **Statistiche**: conta richieste per dipendente/sede/tipo
- 🔐 **Sicurezza**: traccia approvazioni forzate con motivazioni

**Esempio di lettura**:
```
Timestamp: 20/11/2025 10:15:30
Evento: REQUEST_REJECTED
Dettagli: Limite mensile superato
ID_Dipendente: D001
Nome: Mario Rossi
Sede: Gemma
Tipo: Ferie
Data_Richiesta: 25/11/2025
Note_Tecniche: Richieste già approvate questo mese: 6 / 6
```

> 💡 **Suggerimento**: Il foglio Log si auto-crea alla prima esecuzione. Consulta questo foglio per risolvere problemi o verificare il comportamento del sistema.

### Dipendenti
Anagrafica dipendenti con ID, nome, sede, ruolo, email.

### Richieste
Tutte le richieste inviate tramite form con stato di approvazione.

**Colonne principali:**
- **Stato**: PENDING, APPROVED, REJECTED, FORCED
- **Motivazione_Admin**: note dell'amministratore
- **Note**: informazioni aggiuntive (es. chi è già assente)

### Planner-Mensile
Visualizzazione calendario mensile con F (Ferie) e P (Permesso).

### Riepilogo
Foglio predisposto per statistiche future (totali ferie/permessi per dipendente).

## 🔧 Risoluzione Problemi

### Il menu "Cartellini MASTER" non appare

**Soluzione:**
1. Ricarica la pagina (F5)
2. Attendi qualche secondo
3. Se persiste, chiudi e riapri il foglio

### Errore: "Script non autorizzato"

**Soluzione:**
1. Menu **Cartellini MASTER** → **Setup iniziale**
2. Clicca su **Rivedi autorizzazioni**
3. Autorizza lo script seguendo i passaggi

### Il form non invia risposte

**Soluzione:**
1. Menu **Cartellini MASTER** → **Rigenera Form collegato**
2. Menu **Cartellini MASTER** → **Reinstalla trigger**
3. Prova a inviare una nuova richiesta

### Le richieste non vengono validate

**Soluzione:**
1. Controlla che il trigger sia installato:
   - Vai su **Estensioni** → **Apps Script**
   - Clicca sull'icona dell'orologio (⏰) a sinistra
   - Verifica che esista un trigger per `onFormSubmit`
2. Se manca: Menu **Cartellini MASTER** → **Reinstalla trigger**

### Il planner non si aggiorna

**Soluzione:**
1. Menu **Cartellini MASTER** → **Rielabora Planner (tutto)**
2. Controlla che il mese/anno siano corretti
3. Se necessario, rigenera il planner per un nuovo mese modificando lo script

### Date non corrette nel planner

**Soluzione:**
1. Verifica il fuso orario dello script:
   - Vai su **Estensioni** → **Apps Script**
   - Clicca su **Impostazioni progetto** (⚙️)
   - Imposta il fuso orario corretto (es. GMT+01:00 per l'Italia)

## 📞 Supporto

Per problemi o personalizzazioni:
1. Controlla la documentazione sopra
2. Verifica i log dello script:
   - **Estensioni** → **Apps Script**
   - Menu **Esecuzioni** per vedere gli errori
3. Contatta l'amministratore (Massimo)

## 📝 Note Finali

- **Backup**: Fai copie periodiche del foglio (File → Crea una copia)
- **Versioni**: Google Sheets salva automaticamente la cronologia
- **Privacy**: Solo chi ha accesso al foglio può vedere i dati
- **Condivisione**: Condividi il link al form, non al foglio principale

## 🚀 Estensioni Future

Possibili miglioramenti da implementare:

### Notifiche Email
Aggiungi in `Request_Service.gs` dopo la validazione:
```javascript
if (stato === 'APPROVED') {
  var employee = getEmployeeById(idDip);
  if (employee && employee.email) {
    MailApp.sendEmail({
      to: employee.email,
      subject: '✓ Richiesta Approvata - ' + tipo,
      body: 'La tua richiesta per ' + formatDate(data) + ' è stata approvata.'
    });
  }
}
```

### Richieste Multi-Giorno
Modifica `addToPlanner()` per gestire range di date:
```javascript
for (var i = 0; i < giorni; i++) {
  var currentDate = new Date(date);
  currentDate.setDate(currentDate.getDate() + i);
  // Aggiungi al planner...
}
```

### Riepilogo Automatico
Crea una funzione in `Request_Service.gs`:
```javascript
function updateRiepilogo(year, month) {
  // Conta ferie/permessi per dipendente
  // Scrivi nel foglio Riepilogo
}
```

### Export PDF Planner
Aggiungi menu per esportare il planner mensile come PDF.

### Dashboard Statistiche
Crea un foglio con grafici per visualizzare:
- Trend mensili assenze per sede
- Dipendenti con più richieste
- Giorni più richiesti

---

**Versione:** 2.0 (Modulare)  
**Ultimo aggiornamento:** Novembre 2025  
**Autore:** Massimo  
**Licenza:** MIT
