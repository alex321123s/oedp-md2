import { MotionType } from '../entities/Motion.entity';

export interface MotionTypeMetadata {
  code: string; // S, F, SGO, GO, BAK-GO, B/P, E, M
  name: string;
  description: string;
  majorityRequired: 'simple' | 'two_thirds';
  requiresLegalReference: boolean;
  bindingPower: 'highest' | 'high' | 'medium' | 'political' | 'advisory';
  eligibleProposers: string[];
  workflow: string;
}

export const MOTION_TYPE_METADATA: Record<MotionType, MotionTypeMetadata> = {
  [MotionType.SATZUNGSAENDERUNG]: {
    code: 'S',
    name: 'Satzungsänderung',
    description: 'Constitutional/Statutory Amendment - Changes to party constitution (§§9-10)',
    majorityRequired: 'two_thirds',
    requiresLegalReference: true,
    bindingPower: 'highest',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Legal review + BAntrK',
  },

  [MotionType.FINANZORDNUNG]: {
    code: 'F',
    name: 'Finanzordnung',
    description: 'Financial Regulation - Membership fees, budgeting, financial management (§16)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'high',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'To Bundesschatzmeister',
  },

  [MotionType.SCHIEDSGERICHTSORDNUNG]: {
    code: 'SGO',
    name: 'Schiedsgerichtsordnung',
    description: 'Arbitration Rules - Internal dispute resolution and disciplinary procedures',
    majorityRequired: 'two_thirds',
    requiresLegalReference: true,
    bindingPower: 'high',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Schiedsgericht', '80 Mitglieder'],
    workflow: 'To Schiedsgericht review',
  },

  [MotionType.GESCHAEFTSORDNUNG]: {
    code: 'GO',
    name: 'Geschäftsordnung BPT/BHA',
    description: 'Rules of Procedure - Debate rules, voting process, quorum for BPT/BHA',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'medium',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'May be voted live during BPT',
  },

  [MotionType.BAK_GESCHAEFTSORDNUNG]: {
    code: 'BAK-GO',
    name: 'Geschäftsordnung für Bundesarbeitskreise',
    description: 'Rules for Federal Working Groups - Internal functioning of BAKs',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'medium',
    eligibleProposers: ['Bundesvorstand', 'BAK delegates', '80 Mitglieder'],
    workflow: 'To BAK coordination',
  },

  [MotionType.PROGRAMMAENDERUNG]: {
    code: 'B/P',
    name: 'Bundesprogramm/Positionsantrag',
    description: 'Policy Platform - Political positions, program amendments, policy statements',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'political',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Policy section review',
  },

  [MotionType.ENTSCHLIESSUNG]: {
    code: 'E',
    name: 'Entschließungsantrag',
    description: 'Resolution - Political statements responding to current events',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'advisory',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Quick resolution',
  },

  [MotionType.SONSTIGES]: {
    code: 'M',
    name: 'Sonstiges',
    description: 'Miscellaneous - Other motions not fitting above categories',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'medium',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Flexible workflow',
  },

  // Legacy types
  [MotionType.GRUNDSATZANTRAG]: {
    code: 'G',
    name: 'Grundsatzantrag',
    description: 'Fundamental Policy Motion (Legacy)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'political',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Policy section review',
  },

  [MotionType.SACHANTRAG]: {
    code: 'SA',
    name: 'Sachantrag',
    description: 'Specific Issue Motion (Legacy)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'political',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Policy section review',
  },

  [MotionType.DRINGLICHKEITSANTRAG]: {
    code: 'D',
    name: 'Dringlichkeitsantrag',
    description: 'Urgent Motion (Legacy)',
    majorityRequired: 'simple',
    requiresLegalReference: false,
    bindingPower: 'political',
    eligibleProposers: ['Bundesvorstand', 'Landesvorstände', 'Bundesarbeitskreise', '80 Mitglieder'],
    workflow: 'Expedited review',
  },
};

export function getMotionTypeMetadata(type: MotionType): MotionTypeMetadata {
  return MOTION_TYPE_METADATA[type];
}

export function getMotionTypeLabel(type: MotionType): string {
  const metadata = MOTION_TYPE_METADATA[type];
  return `${metadata.code}-Antrag: ${metadata.name}`;
}

export function getMajorityRequirement(type: MotionType): 'simple' | 'two_thirds' {
  return MOTION_TYPE_METADATA[type].majorityRequired;
}

export function requiresLegalReference(type: MotionType): boolean {
  return MOTION_TYPE_METADATA[type].requiresLegalReference;
}
