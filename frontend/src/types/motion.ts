export enum MotionType {
  // Official ÖDP Motion Types
  SATZUNGSAENDERUNG = 'satzungsaenderung',           // S-Antrag (2/3)
  FINANZORDNUNG = 'finanzordnung',                   // F-Antrag (simple)
  SCHIEDSGERICHTSORDNUNG = 'schiedsgerichtsordnung', // SGO-Antrag (2/3)
  GESCHAEFTSORDNUNG = 'geschaeftsordnung',           // GO-Antrag (simple)
  BAK_GESCHAEFTSORDNUNG = 'bak_geschaeftsordnung',   // BAK-GO-Antrag (simple)
  PROGRAMMAENDERUNG = 'programmaenderung',           // B/P-Antrag (simple)
  ENTSCHLIESSUNG = 'entschliessung',                 // E-Antrag (simple)
  SONSTIGES = 'sonstiges',                           // M-Antrag (simple)
  
  // Legacy types
  GRUNDSATZANTRAG = 'grundsatzantrag',
  SACHANTRAG = 'sachantrag',
  DRINGLICHKEITSANTRAG = 'dringlichkeitsantrag',
}

export enum MotionStatus {
  DRAFT = 'draft',
  COLLECTING = 'collecting',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

export interface Motion {
  id: string;
  title: string;
  description: string;
  fullText: string;
  type: MotionType;
  status: MotionStatus;
  targetParagraph?: string;
  targetSection?: string;
  legalReference?: string;
  majorityRequired?: string;
  targetGroup?: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  trustPerson?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  backupTrustPerson?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  signatureCount: number;
  signatureThreshold: number;
  isPublic: boolean;
  isArchived: boolean;
  tags?: string[];
  bptAgendaItem?: string;
  scheduledFor?: string;
  submittedAt?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Signature {
  id: string;
  motionId: string;
  signerId: string;
  signer: {
    id: string;
    firstName: string;
    lastName: string;
    memberId?: string;
  };
  signedAt: string;
  isValid: boolean;
}

export const MOTION_TYPE_LABELS: Record<MotionType, string> = {
  [MotionType.SATZUNGSAENDERUNG]: 'S-Antrag: Satzungsänderung (2/3 Mehrheit)',
  [MotionType.FINANZORDNUNG]: 'F-Antrag: Finanzordnung',
  [MotionType.SCHIEDSGERICHTSORDNUNG]: 'SGO-Antrag: Schiedsgerichtsordnung (2/3 Mehrheit)',
  [MotionType.GESCHAEFTSORDNUNG]: 'GO-Antrag: Geschäftsordnung BPT/BHA',
  [MotionType.BAK_GESCHAEFTSORDNUNG]: 'BAK-GO-Antrag: GO Bundesarbeitskreise',
  [MotionType.PROGRAMMAENDERUNG]: 'B/P-Antrag: Bundesprogramm/Position',
  [MotionType.ENTSCHLIESSUNG]: 'E-Antrag: Entschließung',
  [MotionType.SONSTIGES]: 'M-Antrag: Sonstiges',
  [MotionType.GRUNDSATZANTRAG]: 'Grundsatzantrag (Legacy)',
  [MotionType.SACHANTRAG]: 'Sachantrag (Legacy)',
  [MotionType.DRINGLICHKEITSANTRAG]: 'Dringlichkeitsantrag (Legacy)',
};

export const MOTION_STATUS_LABELS: Record<MotionStatus, string> = {
  [MotionStatus.DRAFT]: 'Entwurf',
  [MotionStatus.COLLECTING]: 'Unterschriften sammeln',
  [MotionStatus.SUBMITTED]: 'Eingereicht',
  [MotionStatus.UNDER_REVIEW]: 'In Prüfung',
  [MotionStatus.APPROVED]: 'Genehmigt',
  [MotionStatus.REJECTED]: 'Abgelehnt',
  [MotionStatus.SCHEDULED]: 'Terminiert',
  [MotionStatus.ACCEPTED]: 'Angenommen',
  [MotionStatus.DECLINED]: 'Abgelehnt',
  [MotionStatus.WITHDRAWN]: 'Zurückgezogen',
};

export const MOTION_STATUS_COLORS: Record<MotionStatus, string> = {
  [MotionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [MotionStatus.COLLECTING]: 'bg-blue-100 text-blue-800',
  [MotionStatus.SUBMITTED]: 'bg-yellow-100 text-yellow-800',
  [MotionStatus.UNDER_REVIEW]: 'bg-orange-100 text-orange-800',
  [MotionStatus.APPROVED]: 'bg-green-100 text-green-800',
  [MotionStatus.REJECTED]: 'bg-red-100 text-red-800',
  [MotionStatus.SCHEDULED]: 'bg-purple-100 text-purple-800',
  [MotionStatus.ACCEPTED]: 'bg-green-100 text-green-800',
  [MotionStatus.DECLINED]: 'bg-red-100 text-red-800',
  [MotionStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
};

// Motion type metadata
export interface MotionTypeInfo {
  code: string;
  name: string;
  description: string;
  majorityRequired: 'simple' | 'two_thirds';
  requiresLegalReference: boolean;
  helpText: string;
}

export const MOTION_TYPE_INFO: Record<MotionType, MotionTypeInfo> = {
  [MotionType.SATZUNGSAENDERUNG]: {
    code: 'S',
    name: 'Satzungsänderung',
    description: 'Änderungen an der Parteisatzung (§§9-10)',
    majorityRequired: 'two_thirds',
    requiresLegalReference: true,
    helpText: 'Erfordert 2/3 Mehrheit. Bitte geben Sie den betroffenen Paragraphen an (z.B. §10.1).',
  },
  [MotionType.FINANZORDNUNG]: {
    code: 'F',
    name: 'Finanzordnung',
    description: 'Regelungen zu Mitgliedsbeiträgen und Finanzverwaltung',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit erforderlich. Wird vom Bundesschatzmeister geprüft.',
  },
  [MotionType.SCHIEDSGERICHTSORDNUNG]: {
    code: 'SGO',
    name: 'Schiedsgerichtsordnung',
    description: 'Verfahrensregeln für interne Streitschlichtung',
    majorityRequired: 'two_thirds',
    requiresLegalReference: true,
    helpText: 'Erfordert 2/3 Mehrheit. Wird vom Schiedsgericht geprüft.',
  },
  [MotionType.GESCHAEFTSORDNUNG]: {
    code: 'GO',
    name: 'Geschäftsordnung BPT/BHA',
    description: 'Verfahrensregeln für Bundesparteitag und Bundeshauptausschuss',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit. Kann während des BPT abgestimmt werden.',
  },
  [MotionType.BAK_GESCHAEFTSORDNUNG]: {
    code: 'BAK-GO',
    name: 'GO Bundesarbeitskreise',
    description: 'Regelungen für die interne Arbeit der Bundesarbeitskreise',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit. Wird von BAK-Koordination geprüft.',
  },
  [MotionType.PROGRAMMAENDERUNG]: {
    code: 'B/P',
    name: 'Bundesprogramm/Position',
    description: 'Politische Positionen und Programminhalte',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit. Politisch bindend.',
  },
  [MotionType.ENTSCHLIESSUNG]: {
    code: 'E',
    name: 'Entschließung',
    description: 'Politische Stellungnahmen zu aktuellen Ereignissen',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit. Nicht bindend, drückt Parteiposition aus.',
  },
  [MotionType.SONSTIGES]: {
    code: 'M',
    name: 'Sonstiges',
    description: 'Andere Anträge, die nicht in obige Kategorien passen',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit. Flexibler Workflow.',
  },
  [MotionType.GRUNDSATZANTRAG]: {
    code: 'G',
    name: 'Grundsatzantrag',
    description: 'Grundsätzliche politische Anträge (Legacy)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit.',
  },
  [MotionType.SACHANTRAG]: {
    code: 'SA',
    name: 'Sachantrag',
    description: 'Spezifische Sachthemen (Legacy)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit.',
  },
  [MotionType.DRINGLICHKEITSANTRAG]: {
    code: 'D',
    name: 'Dringlichkeitsantrag',
    description: 'Dringende Anträge (Legacy)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    helpText: 'Einfache Mehrheit. Beschleunigtes Verfahren.',
  },
};

export function getMotionTypeInfo(type: MotionType): MotionTypeInfo {
  return MOTION_TYPE_INFO[type];
}

export function requiresLegalReference(type: MotionType): boolean {
  return MOTION_TYPE_INFO[type].requiresLegalReference;
}

export function getMajorityLabel(majorityRequired?: string): string {
  if (majorityRequired === 'two_thirds') return '2/3 Mehrheit';
  return 'Einfache Mehrheit';
}
