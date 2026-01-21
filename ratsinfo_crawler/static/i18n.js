/**
 * i18n.js - Internationalization Dictionary
 * 
 * Translation strings for München Stadtrat Analytics
 * Supports: German (de), English (en)
 */

export const translations = {
  de: {
    // Hero Section
    'hero.title': 'What does Munich work on?',
    'hero.subtitle': 'Visualisierung und Analyse von Stadtratsanträgen',
    
    // Search Section
    'search.title': 'Themen durchsuchen',
    'search.description': 'Erkunden Sie die häufigsten Themen in Münchner Stadtratsanträgen oder suchen Sie nach einem spezifischen Stichwort',
    'search.popular': 'Beliebte Themen:',
    'search.popular.note': '(Es werden hier die am meisten vorkommenden Keywords mit Hilfe von spacy gefiltert, gecached und angezeigt, exclusive der in keyword_extractor.py ausgeschlossenen stop words)',
    'search.placeholder': 'Suchbegriff eingeben...',
    'search.button': 'Suchen',
    
    // Filter Section
    'filter.type.label': 'Antragstyp filtern:',
    'filter.toggle.aria': 'Filter ein-/ausblenden',
    
    // Date Range
    'daterange.prefix': 'Daten von',
    'daterange.to': 'bis',
    
    // Loading & Errors
    'loading.indicator': 'Wird geladen...',
    'loading.initial': 'Loading initial data...',
    'loading.data': 'Loading data...',
    'error.keywords': 'Failed to load keywords',
    'error.no-keywords': 'No keywords found',
    'error.loading': 'Error loading data. Check console for details.',
    'error.no-data': 'Keine Daten verfügbar',
    'error.no-trend': 'No trend data available',
    'error.no-faction': 'No faction data available',
    'error.no-faction-share': 'No faction share data available',
    'error.no-documents': 'No document data available',
    'error.no-metrics': 'Keine Metriken verfügbar',
    'error.no-referate': 'Keine Daten für Referate verfügbar',
    
    // Charts - Titles
    'chart.trend.title': 'Anträge pro Monat',
    'chart.trend.title.all': 'Alle Anträge pro Monat',
    'chart.fraktionen.title': 'Fraktionsbeteiligung',
    'chart.fraktionen.title.all': 'Fraktionsbeteiligung (alle Anträge)',
    'chart.share.title': 'Anteil thematisierte Anträge',
    'chart.topdocs.title': 'Top 20 Dokumente',
    'chart.metrics.title': 'Bearbeitungsdauer nach Referat',
    'chart.metrics.title.all': 'Bearbeitungsdauer nach Referat (alle Anträge)',
    
    // Charts - Axes & Labels
    'chart.axis.count': 'Anzahl Anträge',
    'chart.axis.faction': 'Fraktion',
    'chart.axis.share': 'Anteil (%)',
    'chart.axis.days': 'Durchschnittliche Tage',
    'chart.axis.referat': 'Referat',
    'chart.axis.timeperiod': 'Zeitraum',
    'chart.axis.avgdays.full': 'Durchschnittliche Bearbeitungsdauer (Tage)',
    'chart.label.proposals': 'Anträge',
    'chart.label.total': 'Gesamt',
    'chart.label.keyword': 'Mit Stichwort',
    'chart.label.count': 'Anzahl',
    'chart.label.avgdays': 'Ø Tage',
    
    // KPI Cards
    'kpi.total.title': 'Gesamt',
    'kpi.total.description': 'Anträge',
    'kpi.open.title': 'Offen',
    'kpi.open.description': 'noch in Bearbeitung',
    'kpi.closed.title': 'Abgeschlossen',
    'kpi.closed.description': 'erledigte Anträge',
    'kpi.avgdays.title': 'Ø Bearbeitungszeit',
    'kpi.avgdays.description': 'Tage',
    'kpi.avgdays.na': 'k.A.',
    
    // Typ Filter Values
    'typ.Antrag': 'Antrag',
    'typ.Anfrage': 'Anfrage',
    'typ.Dringlichkeitsantrag': 'Dringlichkeitsantrag',
    'typ.Ergänzungsantrag': 'Ergänzungsantrag',
    'typ.Änderungsantrag': 'Änderungsantrag',
    
    // Footer
    'footer.copyright': '© 2026 Elena Zimmermann, Anna Labchir, Matthias Staritz, Tobias Pfeifle',
    'footer.imprint': 'Impressum',
    'footer.privacy': 'Datenschutzerklärung',
    'footer.disclaimer': 'Haftungsausschluss',
    
    // Legal Page - General
    'legal.eyebrow': 'München Stadtrat Analytics',
    'legal.title': 'Rechtliche Hinweise',
    'legal.lead': 'Informationen zu Impressum, Datenschutz und Haftung für die nicht-kommerzielle Lehr-/Demonstrations-Webseite.',
    'legal.back': 'Zur Startseite',
    
    // Legal - Impressum
    'legal.imprint.title': 'Impressum (§ 5 TMG)',
    'legal.imprint.intro': 'Betreiber der Webseite (Lehr-/Demonstrationszwecke, nicht kommerziell):',
    'legal.imprint.name': 'Name: [Name Betreiber/Dozent:in]',
    'legal.imprint.address': 'Anschrift: [Straße, Hausnummer], [PLZ] [Ort], Deutschland',
    'legal.imprint.university': 'Hochschule: [Name der Hochschule], [Fakultät/Institut, falls zutreffend]',
    'legal.imprint.contact': 'Kontakt: [E-Mail-Adresse] | [Telefon, optional]',
    'legal.imprint.responsible': 'Verantwortlich für den Inhalt: [Name verantwortliche Person], erreichbar unter den oben genannten Kontaktdaten',
    'legal.imprint.hosting': 'Hosting: [Name Hosting-Anbieter], [Anschrift Hosting-Anbieter, falls erforderlich]',
    
    // Legal - Privacy
    'legal.privacy.title': 'Datenschutzerklärung (DSGVO)',
    'legal.privacy.1.title': '1. Verantwortliche Stelle',
    'legal.privacy.1.text': '[Name Betreiber/Dozent:in], [Anschrift], [E-Mail]',
    'legal.privacy.2.title': '2. Zweck der Webseite',
    'legal.privacy.2.text': 'Lehr- und Demonstrationszwecke im Rahmen eines Hochschulkurses; keine kommerzielle Nutzung.',
    'legal.privacy.3.title': '3. Erhobene Daten',
    'legal.privacy.3.item1': 'Serverseitige Logfiles: z. B. IP-Adresse, Datum/Uhrzeit des Zugriffs, abgerufene Ressource, übertragene Datenmenge, User-Agent.',
    'legal.privacy.3.item2': 'Keine Cookies, kein Tracking, kein Kontaktformular, keine Veröffentlichung personenbezogener Daten.',
    'legal.privacy.4.title': '4. Rechtsgrundlage',
    'legal.privacy.4.text': 'Bereitstellung der Webseite und IT-Sicherheit gemäß Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherem Betrieb).',
    'legal.privacy.5.title': '5. Speicherdauer',
    'legal.privacy.5.text': 'Logfiles werden nur so lange gespeichert, wie es für Betrieb, Sicherheit und Fehleranalyse erforderlich ist; anschließende Löschung oder Anonymisierung.',
    'legal.privacy.6.title': '6. Weitergabe an Dritte',
    'legal.privacy.6.text': 'Keine Weitergabe personenbezogener Daten. Hosting erfolgt bei [Name Hosting-Anbieter]; Datenverarbeitung erfolgt im Rahmen eines Auftragsverhältnisses.',
    'legal.privacy.7.title': '7. Betroffenenrechte',
    'legal.privacy.7.text': 'Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch sowie Datenübertragbarkeit nach Maßgabe der DSGVO. Zur Ausübung der Rechte: [E-Mail-Adresse].',
    'legal.privacy.8.title': '8. Datensicherheit',
    'legal.privacy.8.text': 'Angemessene technische und organisatorische Maßnahmen zum Schutz vor unbefugtem Zugriff und Missbrauch.',
    'legal.privacy.9.title': '9. Aktualität',
    'legal.privacy.9.text': 'Diese Datenschutzerklärung wird bei Bedarf aktualisiert; Stand: [Datum einsetzen].',
    
    // Legal - Disclaimer
    'legal.disclaimer.title': 'Haftungsausschluss (Disclaimer) für Auswertungen und Visualisierungen',
    'legal.disclaimer.item1': 'Die bereitgestellten Daten, Auswertungen und Visualisierungen dienen ausschließlich Lehr- und Demonstrationszwecken.',
    'legal.disclaimer.item2': 'Es wird keine Gewähr für Richtigkeit, Vollständigkeit oder Aktualität der dargestellten Inhalte übernommen.',
    'legal.disclaimer.item3': 'Eine Nutzung der Informationen erfolgt auf eigenes Risiko; Haftungsansprüche sind ausgeschlossen, sofern kein vorsätzliches oder grob fahrlässiges Verhalten vorliegt.',
    'legal.disclaimer.item4': 'Externe Links werden sorgfältig geprüft; für Inhalte externer Seiten sind ausschließlich deren Betreiber verantwortlich.'
  },
  
  en: {
    // Hero Section
    'hero.title': 'What does Munich work on?',
    'hero.subtitle': 'Visualization and Analysis of City Council Proposals',
    
    // Search Section
    'search.title': 'Browse Topics',
    'search.description': 'Explore the most common topics in Munich city council proposals or search for a specific keyword',
    'search.popular': 'Popular Topics:',
    'search.popular.note': '(The most frequently occurring keywords are filtered, cached and displayed using spacy, excluding the stop words excluded in keyword_extractor.py)',
    'search.placeholder': 'Enter search term...',
    'search.button': 'Search',
    
    // Filter Section
    'filter.type.label': 'Filter by proposal type:',
    'filter.toggle.aria': 'Toggle filter',
    
    // Date Range
    'daterange.prefix': 'Data from',
    'daterange.to': 'to',
    
    // Loading & Errors
    'loading.indicator': 'Loading...',
    'loading.initial': 'Loading initial data...',
    'loading.data': 'Loading data...',
    'error.keywords': 'Failed to load keywords',
    'error.no-keywords': 'No keywords found',
    'error.loading': 'Error loading data. Check console for details.',
    'error.no-data': 'No data available',
    'error.no-trend': 'No trend data available',
    'error.no-faction': 'No faction data available',
    'error.no-faction-share': 'No faction share data available',
    'error.no-documents': 'No document data available',
    'error.no-metrics': 'No metrics available',
    'error.no-referate': 'No data for departments available',
    
    // Charts - Titles
    'chart.trend.title': 'Proposals per Month',
    'chart.trend.title.all': 'All Proposals per Month',
    'chart.fraktionen.title': 'Faction Participation',
    'chart.fraktionen.title.all': 'Faction Participation (all proposals)',
    'chart.share.title': 'Share of Topic-Related Proposals',
    'chart.topdocs.title': 'Top 20 Documents',
    'chart.metrics.title': 'Processing Time by Department',
    'chart.metrics.title.all': 'Processing Time by Department (all proposals)',
    
    // Charts - Axes & Labels
    'chart.axis.count': 'Number of Proposals',
    'chart.axis.faction': 'Faction',
    'chart.axis.share': 'Share (%)',
    'chart.axis.days': 'Average Days',
    'chart.axis.referat': 'Department',
    'chart.axis.timeperiod': 'Time Period',
    'chart.axis.avgdays.full': 'Average Processing Time (Days)',
    'chart.label.proposals': 'Proposals',
    'chart.label.total': 'Total',
    'chart.label.keyword': 'With Keyword',
    'chart.label.count': 'Count',
    'chart.label.avgdays': 'Avg. Days',
    
    // KPI Cards
    'kpi.total.title': 'Total',
    'kpi.total.description': 'Proposals',
    'kpi.open.title': 'Open',
    'kpi.open.description': 'still in progress',
    'kpi.closed.title': 'Closed',
    'kpi.closed.description': 'completed proposals',
    'kpi.avgdays.title': 'Avg. Processing Time',
    'kpi.avgdays.description': 'Days',
    'kpi.avgdays.na': 'N/A',
    
    // Typ Filter Values
    'typ.Antrag': 'Proposal',
    'typ.Anfrage': 'Inquiry',
    'typ.Dringlichkeitsantrag': 'Urgent Proposal',
    'typ.Ergänzungsantrag': 'Supplementary Proposal',
    'typ.Änderungsantrag': 'Amendment Proposal',
    
    // Footer
    'footer.copyright': '© 2026 Elena Zimmermann, Anna Labchir, Matthias Staritz, Tobias Pfeifle',
    'footer.imprint': 'Imprint',
    'footer.privacy': 'Privacy Policy',
    'footer.disclaimer': 'Disclaimer',
    
    // Legal Page - General
    'legal.eyebrow': 'Munich City Council Analytics',
    'legal.title': 'Legal Information',
    'legal.lead': 'Information about imprint, privacy and liability for the non-commercial educational/demonstration website.',
    'legal.back': 'Back to Home',
    
    // Legal - Impressum
    'legal.imprint.title': 'Imprint (§ 5 TMG)',
    'legal.imprint.intro': 'Website operator (educational/demonstration purposes, non-commercial):',
    'legal.imprint.name': 'Name: [Operator/Instructor Name]',
    'legal.imprint.address': 'Address: [Street, Number], [ZIP] [City], Germany',
    'legal.imprint.university': 'University: [University Name], [Faculty/Institute, if applicable]',
    'legal.imprint.contact': 'Contact: [Email Address] | [Phone, optional]',
    'legal.imprint.responsible': 'Responsible for content: [Responsible Person Name], reachable at the contact details above',
    'legal.imprint.hosting': 'Hosting: [Hosting Provider Name], [Hosting Provider Address, if required]',
    
    // Legal - Privacy
    'legal.privacy.title': 'Privacy Policy (GDPR)',
    'legal.privacy.1.title': '1. Responsible Entity',
    'legal.privacy.1.text': '[Operator/Instructor Name], [Address], [Email]',
    'legal.privacy.2.title': '2. Purpose of the Website',
    'legal.privacy.2.text': 'Educational and demonstration purposes as part of a university course; no commercial use.',
    'legal.privacy.3.title': '3. Collected Data',
    'legal.privacy.3.item1': 'Server-side log files: e.g., IP address, date/time of access, requested resource, transferred data volume, user agent.',
    'legal.privacy.3.item2': 'No cookies, no tracking, no contact form, no publication of personal data.',
    'legal.privacy.4.title': '4. Legal Basis',
    'legal.privacy.4.text': 'Provision of the website and IT security according to Art. 6 para. 1 lit. f GDPR (legitimate interest in secure operation).',
    'legal.privacy.5.title': '5. Storage Duration',
    'legal.privacy.5.text': 'Log files are stored only as long as necessary for operation, security and error analysis; subsequent deletion or anonymization.',
    'legal.privacy.6.title': '6. Disclosure to Third Parties',
    'legal.privacy.6.text': 'No disclosure of personal data. Hosting is provided by [Hosting Provider Name]; data processing is carried out within the framework of a contractual relationship.',
    'legal.privacy.7.title': '7. Data Subject Rights',
    'legal.privacy.7.text': 'Right to information, correction, deletion, restriction of processing, objection and data portability in accordance with the GDPR. To exercise these rights: [Email Address].',
    'legal.privacy.8.title': '8. Data Security',
    'legal.privacy.8.text': 'Appropriate technical and organizational measures to protect against unauthorized access and misuse.',
    'legal.privacy.9.title': '9. Current Status',
    'legal.privacy.9.text': 'This privacy policy is updated as needed; status: [insert date].',
    
    // Legal - Disclaimer
    'legal.disclaimer.title': 'Disclaimer for Evaluations and Visualizations',
    'legal.disclaimer.item1': 'The provided data, evaluations and visualizations serve exclusively educational and demonstration purposes.',
    'legal.disclaimer.item2': 'No guarantee is given for the accuracy, completeness or timeliness of the displayed content.',
    'legal.disclaimer.item3': 'Use of the information is at your own risk; liability claims are excluded unless there is intentional or grossly negligent behavior.',
    'legal.disclaimer.item4': 'External links are carefully reviewed; the operators of external sites are solely responsible for their content.'
  }
};

// Current language state (default to German)
let currentLang = localStorage.getItem('lang') || 'de';

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'hero.title')
 * @param {string} lang - Language code (optional, uses currentLang if not provided)
 * @returns {string} Translated text or key if not found
 */
export function t(key, lang = currentLang) {
  return translations[lang]?.[key] || translations['de']?.[key] || key;
}

/**
 * Get current language
 * @returns {string} Current language code
 */
export function getCurrentLang() {
  return currentLang;
}

/**
 * Set current language
 * @param {string} lang - Language code ('de' or 'en')
 */
export function setCurrentLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
  }
}
