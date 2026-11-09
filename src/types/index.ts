export type CADSoftware =
  | 'KiCad'
  | 'Proteus professional'
  | 'Altium Designer'
  | 'Autodesk EAGLE'
  | 'EasyEDA Pro'
  | 'Cadence OrCAD'
  | 'Siemens PADS'
  | 'DesignSpark PCB'
  | 'DipTrace'
  | 'Fritzing'
  | 'LibrePCB'
  | 'CircuitMaker'
  | 'Pulsonix'
  | 'TARGET 3001!'
  | 'Siemens Xpedition'
  | 'Zuken CR-8000'
  | 'Sprint-Layout'
  | 'Neutral Standard (STEP/Gerber)';

export interface PinDefinition {
  number: string | number;
  name: string;
  type: 'input' | 'output' | 'bidirectional' | 'power' | 'passive';
  side: 'left' | 'right' | 'top' | 'bottom';
}

export interface PadDefinition {
  number: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rect' | 'round' | 'oval';
  type: 'smd' | 'tht';
}

export interface ElectronicComponent {
  id: string;
  name: string;
  folderName: string;
  fileName: string;
  origin: string;
  sourceSoftware: CADSoftware | string;
  destinationSoftware: CADSoftware | string;
  size: string; // e.g. "504.7K"
  sizeBytes: number;
  type: 'Imported' | 'Converted';
  conversionDate: string; // YYYY-MM-DD
  conversionTimestamp: number;
  ownerId: string; // user id
  ownerName: string;
  customImage?: string; // data URL or path replacing folder icon
  description: string;
  applicationNotes?: string;
  datasheetName?: string;
  datasheetUrl?: string;
  packageType: 'SOT-23-6' | 'SOIC-8' | 'QFN-16' | 'DIP-8' | 'TSSOP-14' | 'TO-220';
  pins: PinDefinition[];
  pads: PadDefinition[];
  filesIncluded?: string[];
  ercVerified?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  country: string;
  avatarUrl: string;
  lastLoginTimestamp: number;
  provider: 'email' | 'google' | 'apple';
  role?: 'admin' | 'user';
}


export interface ChatReaction {
  type: 'heart' | 'reply' | 'thumbs';
  count: number;
  userReacted?: boolean;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  dateLabel: string;
  time: string;
  timestamp: number;
  content: string;
  replyTo?: {
    authorName: string;
    text: string;
  };
  reactions: {
    heart: number;
    replies: number;
  };
  attachedComponentId?: string;
  isCurrentUser?: boolean;
}

export type ThemeBottomColor = 'blue' | 'black' | 'orange' | 'green' | 'brown';

export interface PlatformStats {
  subscribers: number;
  online: number;
  totalImported: number;
  totalConverted: number;
}
