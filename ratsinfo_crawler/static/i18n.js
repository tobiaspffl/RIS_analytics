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

    // Badges
    'badge.methodology': 'Zählregeln & Schwellen',
    
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
    'footer.methodology': 'Methodik',
    
    // Methodology Page
    'methodology.eyebrow': 'München Stadtrat Analytics',
    'methodology.title': 'Methodik & Transparenz',
    'methodology.lead': 'So entstehen die Zahlen: von der Datenerhebung bis zur Auswertung.',
    'methodology.back': 'Zur Startseite',
    
    'methodology.datasources.title': '1. Datenquellen',
    'methodology.datasources.1': 'Basis ist die öffentlich zugängliche Ratsinformations-Plattform der Stadt München.',
    'methodology.datasources.2': 'Dokumente werden per Crawler geladen und in <code>data.csv</code> abgelegt (Spalten u. a.: Drucksachen-Nr., Titel, Typ, Gestellt am, Erledigt am, Gestellt von, Zuständiges Referat, document_content).',
    'methodology.datasources.3': 'Personen- und Fraktionsnamen stammen ausschließlich aus den veröffentlichten Dokumenten.',
    
    'methodology.preprocessing.title': '2. Vorverarbeitung',
    'methodology.preprocessing.1': 'Alle Texte werden als String gespeichert, Datumsspalten in Datumsformate konvertiert (ungültige Daten werden verworfen).',
    'methodology.preprocessing.2': 'Keine automatische Korrektur oder Normalisierung des Inhalts; eventuelle OCR-/Formatierungsartefakte bleiben bestehen.',
    'methodology.preprocessing.3': 'Optional können Filter nach Antragstyp (<code>typ_filter</code>) angewandt werden (OR-Logik über ausgewählte Typen).',
    
    'methodology.search.title': '3. Such- und Zählregeln',
    'methodology.search.1': 'Suche erfolgt regex-basiert, case-insensitive, pro Suchwort.',
    'methodology.search.2': '<strong>Schwelle:</strong> <code>MIN_OCCURRENCES_PER_DOC = 1</code>. Ein Dokument zählt als Treffer, sobald das Suchwort mindestens einmal vorkommt.',
    'methodology.search.3': '<strong>Binär pro Dokument:</strong> Ein Dokument trägt maximal 1 zum Zähler bei, auch wenn das Wort mehrfach vorkommt.',
    'methodology.search.4': '<strong>Theme-Expansion (aktiv):</strong> Suchbegriffe werden über <code>THEME_MAP</code> um thematisch verwandte Phrasen erweitert (z. B. "Wohnen" → Wohnung, Miete, Zimmer ...). Dadurch steigen Trefferzahlen, weil Synonyme mitgezählt werden. Abschaltbar via <code>expand_with_themes=False</code>.',
    'methodology.search.5': '<strong>Mehrere Suchwörter:</strong> Trefferlisten werden vereinigt (Union). <code>total_word_count</code> zählt jedes Dokument höchstens einmal über alle Suchbegriffe.',
    'methodology.search.6': '<strong>Lemmatisierung:</strong> Für Theme-Expansion wird spaCy auf Lemmebene eingesetzt; die eigentliche Zählung bleibt regex-basiert.',
    
    'methodology.theme.title': '4. Theme-Expansion und semantische Suche',
    'methodology.theme.subtitle': 'Wie ein Suchbegriff zu mehreren Suchbegriffen wird:',
    'methodology.theme.intro': 'Um die Suchergebnisse zu verbessern, gibt es die Möglichkeit, mit einem Suchbegriff automatisch verwandte Begriffe zu finden. Dieses System heißt <strong>Theme-Expansion</strong> und funktioniert folgendermaßen:',
    'methodology.theme.list.1': 'Der Nutzer klickt einen Theme-Button (z. B. „Wohnen") auf der Startseite oder gibt einen Suchbegriff ein.',
    'methodology.theme.list.2': 'Das System prüft, ob dieser Begriff einem <strong>Theme in der THEME_MAP</strong> entspricht oder einer der zugeordneten Phrasen.',
    'methodology.theme.list.3': 'Falls ja: Alle Phrasen dieses Themes werden zur Suche hinzugefügt. Z. B. werden bei „Wohnen" automatisch auch „Wohnung", „Miete", „Mietspiegel", etc. gesucht.',
    'methodology.theme.list.4': 'Die Regex-basierte Suche wird dann für <strong>jeden dieser expandierten Begriffe</strong> durchgeführt.',
    'methodology.theme.list.5': 'Die Ergebnisse werden zusammengefasst (Union), sodass jedes Dokument maximal einmal gezählt wird.',
    'methodology.theme.technical': '<strong>Technischer Hintergrund:</strong> Die Theme-Expansion ist lexikon-basiert (rule-based) und nutzt <strong>spaCy</strong> auf Lemma-Ebene für die Erkennung von Themenbegriffen in Texten. Die eigentliche Zählung bleibt regex-basiert für optimale Performance. Die Theme-Expansion ist standardmäßig aktiviert, kann aber über <code>expand_with_themes=False</code> deaktiviert werden.',
    'methodology.theme.themes.title': 'Verfügbare Themes und ihre Suchbegriffe',
    'methodology.theme.themes.intro': 'Hier ist eine Übersicht aller Themes und ihrer zugeordneten Suchbegriffe:',
    'methodology.theme.themes.housing': 'Wohnung, Miete, Mietspiegel, Wohnraum, Zimmer, Vermietung, Untermiete',
    'methodology.theme.themes.mobility': 'ÖPNV, Bus, Tram, Straßenbahn, U-Bahn, S-Bahn, Fahrrad, Radweg, Parkplatz',
    'methodology.theme.themes.education': 'Schule, Kita, Kindergarten, Universität, Hochschule, Ausbildung',
    'methodology.theme.themes.environment': 'Klimaschutz, CO2, Emissionen, Nachhaltigkeit, Energiewende, Solaranlagen, Grünflächen, Parks, Bäume, Begrünung, Abfallwirtschaft, Recycling',
    'methodology.theme.themes.social': 'Sozialhilfe, Grundsicherung, Armut, Obdachlosigkeit, Migration, Integration, Flüchtlinge, Chancengleichheit, Familien',
    'methodology.theme.themes.culture': 'Theater, Museen, Kunstförderung, Kulturzentren, Bibliotheken, Kulturelle Vielfalt, Denkmalschutz, Architektur',
    'methodology.theme.themes.health': 'Krankenhäuser, Ärzte, Gesundheitsversorgung, Psychiatrie, Pflege, Altenbetreuung, Behindertenbetreuung, Pandemie',
    'methodology.theme.themes.economy': 'Arbeitsmarkt, Arbeitsplätze, Unternehmensförderung, Gewerbebetriebe, Handwerk, Startups, Fachkräftemangel',
    'methodology.theme.themes.security': 'Polizei, Feuerwehr, Kriminalität, Ordnung, Sauberkeit, Verkehrssicherheit, Prävention',
    'methodology.theme.themes.sports': 'Sportanlagen, Freizeiteinrichtungen, Schwimmbäder, Spielplätze, Sportförderung, Jugendangebote',
    'methodology.theme.themes.digitalization': 'Breitband, Glasfaser, 5G, Smart City, Digitalisierung, IT-Infrastruktur, Online-Dienste',
    'methodology.theme.themes.supply': 'Wasser, Energieversorgung, Tierschutz, Kinderrechte, Verbraucherschutz',
    
    'methodology.evaluations.title': '5. Auswertungen',
    'methodology.evaluations.1': '<strong>Trend:</strong> Gruppierung nach Monat (YYYY-MM) und Summe der binären <code>count</code>-Spalte; optionale Typ-Breakdowns.',
    'methodology.evaluations.2': '<strong>Fraktionen/Einreicher:</strong> Feld <code>Gestellt von</code> wird an Kommata gesplittet, pro Name summiert; optional Typ-Breakdowns.',
    'methodology.evaluations.3': '<strong>Anteil pro Fraktion:</strong> Verhältnis (Treffer / alle Dokumente je Fraktion), Null-Divisionen werden entfernt.',
    'methodology.evaluations.4': '<strong>KPI Verarbeitung:</strong> Durchschnittliche Bearbeitungszeit (Erledigt am − Gestellt am) nur für erledigte Vorgänge; offene/geschlossene Zähler basieren auf Vorhandensein des Erledigt-Datums; Referats-Breakdown über erledigte Vorgänge.',
    
    'methodology.visualization.title': '6. Visualisierung',
    'methodology.visualization.1': 'Frontend nutzt D3.js; Daten werden über JSON-Endpunkte aus Flask geladen.',
    'methodology.visualization.2': 'Keine clientseitige Nachfilterung außer Darstellung (Tooltips, Sortierungen auf Basis der gelieferten Aggregationen).',
    
    'methodology.limits.title': '7. Grenzen & Bias',
    'methodology.limits.1': 'Regex- und Theme-Expansion können Über- oder Unterzählungen verursachen (z. B. Teilwörter, fehlende Synonyme).',
    'methodology.limits.2': 'Binäre Zählung ignoriert Mehrfachnennungen innerhalb eines Dokuments.',
    'methodology.limits.3': 'Qualität der Ergebnisse hängt von Datenvollständigkeit und Richtigkeit der Quelle ab.',
    'methodology.limits.4': 'Kein automatisches Entfernen von Stoppwörtern in der Zählung; Theme-Expansion ist kuratiert und kann unvollständig sein.',
    
    // Legal Page - General (keine Übersetzung aktiv, Seite ist deutsch-only)
    'legal.eyebrow': 'München Stadtrat Analytics',
    'legal.title': 'Rechtliche Hinweise',
    'legal.lead': 'Informationen zu Impressum, Datenschutz und Haftung für die nicht-kommerzielle Lehr-/Demonstrations-Webseite.',
    'legal.back': 'Zur Startseite'
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

    // Badges
    'badge.methodology': 'Counting rules & thresholds',
    
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
    
    // Footer
    'footer.copyright': '© 2026 Elena Zimmermann, Anna Labchir, Matthias Staritz, Tobias Pfeifle',
    'footer.imprint': 'Imprint',
    'footer.privacy': 'Privacy Policy',
    'footer.disclaimer': 'Disclaimer',
    'footer.methodology': 'Methodology',
    
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
    'legal.privacy.9.title': '9. Current Status',
    'legal.privacy.9.text': 'This privacy policy is updated as needed; status: [insert date].',
    
    // Legal - Disclaimer
    'legal.disclaimer.title': 'Disclaimer for Evaluations and Visualizations',
    'legal.disclaimer.item1': 'The provided data, evaluations and visualizations serve exclusively educational and demonstration purposes.',
    'legal.disclaimer.item2': 'No guarantee is given for the accuracy, completeness or timeliness of the displayed content.',
    'legal.disclaimer.item3': 'Use of the information is at your own risk; liability claims are excluded unless there is intentional or grossly negligent behavior.',
    'legal.disclaimer.item4': 'External links are carefully reviewed; the operators of external sites are solely responsible for their content.',
    
    // Methodology Page
    'methodology.eyebrow': 'Munich City Council Analytics',
    'methodology.title': 'Methodology & Transparency',
    'methodology.lead': 'How the numbers come about: from data collection to evaluation.',
    'methodology.back': 'Back to Home',
    
    'methodology.datasources.title': '1. Data Sources',
    'methodology.datasources.1': 'The basis is the publicly accessible city council information platform of the City of Munich.',
    'methodology.datasources.2': 'Documents are loaded via crawler and stored in <code>data.csv</code> (columns including: printing paper number, title, type, submitted on, completed on, submitted by, responsible department, document_content).',
    'methodology.datasources.3': 'Names of persons and factions come exclusively from published documents.',
    
    'methodology.preprocessing.title': '2. Pre-processing',
    'methodology.preprocessing.1': 'All texts are stored as strings, date columns converted to date formats (invalid data is discarded).',
    'methodology.preprocessing.2': 'No automatic correction or normalization of content; any OCR/formatting artifacts remain.',
    'methodology.preprocessing.3': 'Filters by proposal type (<code>typ_filter</code>) can optionally be applied (OR logic across selected types).',
    
    'methodology.search.title': '3. Search and Counting Rules',
    'methodology.search.1': 'Search is regex-based, case-insensitive, per search word.',
    'methodology.search.2': '<strong>Threshold:</strong> <code>MIN_OCCURRENCES_PER_DOC = 1</code>. A document counts as a hit as soon as the search word occurs at least once.',
    'methodology.search.3': '<strong>Binary per document:</strong> A document contributes at most 1 to the count, even if the word appears multiple times.',
    'methodology.search.4': '<strong>Theme Expansion (active):</strong> Search terms are expanded via <code>THEME_MAP</code> with thematically related phrases (e.g. "Housing" → apartment, rent, room ...). This increases hit counts because synonyms are counted. Can be disabled via <code>expand_with_themes=False</code>.',
    'methodology.search.5': '<strong>Multiple search words:</strong> Result lists are merged (union). <code>total_word_count</code> counts each document at most once across all search terms.',
    'methodology.search.6': '<strong>Lemmatization:</strong> For theme expansion, spaCy is used at lemma level; the actual counting remains regex-based.',
    
    'methodology.theme.title': '4. Theme Expansion and Semantic Search',
    'methodology.theme.subtitle': 'How one search term becomes multiple search terms:',
    'methodology.theme.intro': 'To improve search results, there is the option to automatically find related terms with one search term. This system is called <strong>Theme Expansion</strong> and works as follows:',
    'methodology.theme.list.1': 'The user clicks a theme button (e.g. "Housing") on the home page or enters a search term.',
    'methodology.theme.list.2': 'The system checks whether this term corresponds to a <strong>theme in the THEME_MAP</strong> or one of the assigned phrases.',
    'methodology.theme.list.3': 'If yes: All phrases of this theme are added to the search. For example, with "Housing" the system also automatically searches for "apartment", "rent", "rental market", etc.',
    'methodology.theme.list.4': 'The regex-based search is then performed for <strong>each of these expanded terms</strong>.',
    'methodology.theme.list.5': 'The results are merged (union), so each document is counted at most once.',
    'methodology.theme.technical': '<strong>Technical Background:</strong> Theme expansion is lexicon-based (rule-based) and uses <strong>spaCy</strong> at lemma level to detect theme terms in texts. The actual counting remains regex-based for optimal performance. Theme expansion is activated by default but can be disabled via <code>expand_with_themes=False</code>.',
    'methodology.theme.themes.title': 'Available Themes and Their Search Terms',
    'methodology.theme.themes.intro': 'Here is an overview of all themes and their associated search terms:',
    'methodology.theme.themes.housing': 'Apartment, rent, rental market, housing, room, rental, subletting',
    'methodology.theme.themes.mobility': 'Public transport, bus, tram, streetcar, subway, S-bahn, bicycle, bike path, parking',
    'methodology.theme.themes.education': 'School, daycare, kindergarten, university, college, training',
    'methodology.theme.themes.environment': 'Climate protection, CO2, emissions, sustainability, energy transition, solar panels, green spaces, parks, trees, greening, waste management, recycling',
    'methodology.theme.themes.social': 'Social assistance, basic security, poverty, homelessness, migration, integration, refugees, equal opportunity, families',
    'methodology.theme.themes.culture': 'Theater, museums, arts funding, cultural centers, libraries, cultural diversity, monument protection, architecture',
    'methodology.theme.themes.health': 'Hospitals, doctors, health care, psychiatry, care, elderly care, disability support, pandemic',
    'methodology.theme.themes.economy': 'Job market, jobs, business promotion, commercial enterprises, crafts, startups, skilled worker shortage',
    'methodology.theme.themes.security': 'Police, fire department, crime, order, cleanliness, traffic safety, prevention',
    'methodology.theme.themes.sports': 'Sports facilities, recreation facilities, swimming pools, playgrounds, sports promotion, youth programs',
    'methodology.theme.themes.digitalization': 'Broadband, fiber optic, 5G, smart city, digitalization, IT infrastructure, online services',
    'methodology.theme.themes.supply': 'Water, energy supply, animal welfare, children\'s rights, consumer protection',
    
    'methodology.evaluations.title': '5. Evaluations',
    'methodology.evaluations.1': '<strong>Trend:</strong> Grouping by month (YYYY-MM) and sum of binary <code>count</code> column; optional type breakdowns.',
    'methodology.evaluations.2': '<strong>Factions/Submitters:</strong> Field <code>submitted by</code> is split at commas, summed per name; optional type breakdowns.',
    'methodology.evaluations.3': '<strong>Share per faction:</strong> Ratio (hits / all documents per faction), zero divisions removed.',
    'methodology.evaluations.4': '<strong>KPI Processing:</strong> Average processing time (completed on − submitted on) only for completed items; open/closed counters based on presence of completion date; department breakdown via completed items.',
    
    'methodology.visualization.title': '6. Visualization',
    'methodology.visualization.1': 'Frontend uses D3.js; data is loaded via JSON endpoints from Flask.',
    'methodology.visualization.2': 'No client-side post-filtering except display (tooltips, sorting based on provided aggregations).',
    
    'methodology.limits.title': '7. Limitations & Bias',
    'methodology.limits.1': 'Regex and theme expansion can cause over- or under-counting (e.g. partial words, missing synonyms).',
    'methodology.limits.2': 'Binary counting ignores multiple mentions within a document.',
    'methodology.limits.3': 'Quality of results depends on data completeness and correctness of the source.',
    'methodology.limits.4': 'No automatic removal of stop words in counting; theme expansion is curated and may be incomplete.',
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
