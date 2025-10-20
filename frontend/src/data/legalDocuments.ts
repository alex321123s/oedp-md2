export interface LegalDocument {
  id: string;
  title: string;
  description: string;
  category: 'constitution' | 'regulation' | 'procedure' | 'policy';
  url: string;
  lastUpdated?: string;
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  // Constitutional Documents
  {
    id: 'satzung',
    title: 'Satzung der ÖDP',
    description: 'Parteisatzung (§§1-17) - Höchste interne Rechtsgrundlage',
    category: 'constitution',
    url: 'https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/Satzung.pdf',
    lastUpdated: '2024',
  },
  
  // Regulations
  {
    id: 'finanzordnung',
    title: 'Finanzordnung',
    description: 'Regelungen zu Mitgliedsbeiträgen, Finanzverwaltung und Haushalt (§16)',
    category: 'regulation',
    url: 'https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/Finanzordnung.pdf',
  },
  {
    id: 'schiedsgerichtsordnung',
    title: 'Bundesschiedsgerichtsordnung',
    description: 'Verfahrensregeln für interne Streitschlichtung und Disziplinarverfahren',
    category: 'regulation',
    url: 'https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/BundesschiedsgerichtsOrdnung.pdf',
  },
  
  // Procedures
  {
    id: 'go-bpt-bha',
    title: 'Geschäftsordnung BPT/BHA',
    description: 'Verfahrensregeln für Bundesparteitag und Bundeshauptausschuss',
    category: 'procedure',
    url: 'https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/Geschaeftsordnung-BPT-BHA.pdf',
  },
  {
    id: 'go-bak',
    title: 'Geschäftsordnung Bundesarbeitskreise',
    description: 'Regelungen für die interne Arbeit der Bundesarbeitskreise',
    category: 'procedure',
    url: 'https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/Geschaeftsordnung-Bundesarbeitskreise.pdf',
  },
  {
    id: 'go-buvo',
    title: 'Geschäftsordnung Bundesvorstand',
    description: 'Verfahrensregeln für den Bundesvorstand',
    category: 'procedure',
    url: 'https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/GO-BuVo_2025_01_12.pdf',
  },
  
  // Policy Documents
  {
    id: 'grundsatzprogramm',
    title: 'Grundsatzprogramm',
    description: 'Grundlegende politische Positionen und Werte der ÖDP',
    category: 'policy',
    url: 'https://www.oedp.de/programm/grundsatzprogramm',
  },
  {
    id: 'bundesprogramm',
    title: 'Bundespolitisches Programm',
    description: 'Aktuelle politische Positionen der ÖDP',
    category: 'policy',
    url: 'https://www.oedp.de/programm',
  },
];

export function getDocumentsByCategory(category: LegalDocument['category']): LegalDocument[] {
  return LEGAL_DOCUMENTS.filter(doc => doc.category === category);
}

export function getDocumentById(id: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find(doc => doc.id === id);
}

export const DOCUMENT_CATEGORIES = {
  constitution: {
    label: 'Verfassung',
    description: 'Satzung und Grundlagen',
    icon: 'FileText',
  },
  regulation: {
    label: 'Ordnungen',
    description: 'Finanz- und Schiedsgerichtsordnung',
    icon: 'Scale',
  },
  procedure: {
    label: 'Geschäftsordnungen',
    description: 'Verfahrensregeln für Gremien',
    icon: 'BookOpen',
  },
  policy: {
    label: 'Programme',
    description: 'Politische Positionen',
    icon: 'Target',
  },
};
