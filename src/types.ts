export interface Branch {
  id: number;
  name: string;
  code: string;
  city?: string;
  createdAt?: string;
}

// ==========================================
// ESME AKADEMİ TRAINING PORTAL TYPES
// ==========================================

export type TrainingCategory = 'bilgi-islem' | 'depocu';
export type TrainingPriority = 'zorunlu' | 'kritik' | 'standart';

export interface TrainingQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface TrainingChapter {
  id: string;
  title: string;
  subTitle?: string;
  content: string;
  highlights?: string[];
  criticalNotes?: string[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface OfficialTemplate {
  title: string;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  warningNote?: string;
}

export interface SlideItem {
  id: number;
  title: string;
  subTitle?: string;
  categoryBadge?: string;
  icon?: string;
  bullets?: string[];
  keyTakeaway?: string;
  tableData?: { headers: string[]; rows: string[][] };
  alertBox?: { type: 'warning' | 'danger' | 'info'; title: string; text: string };
  notes?: string;
}

export interface TrainingDocument {
  id: string;
  title: string;
  category: TrainingCategory;
  docNo: string;
  subTitle: string;
  scope: string;
  targetUnit: string;
  authorOrManager: string;
  priority: TrainingPriority;
  summary: string;
  iconName?: string;
  badgeText?: string;
  pdfPath?: string;
  videoType?: 'link' | 'file' | 'none';
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
  videoPoster?: string;
  chapters: TrainingChapter[];
  slides?: SlideItem[];
  isPresentation?: boolean;
  officialNotice?: {
    legalRisks?: string[];
    disciplinaryActions?: string[];
    officialTemplate?: OfficialTemplate;
    handwrittenSample?: {
      title: string;
      bodyText: string;
      signers: { role: string; name: string }[];
    };
  };
  quiz?: TrainingQuizQuestion[];
  isCustom?: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingCompletion {
  id: string;
  trainingId: string;
  trainingTitle: string;
  category: TrainingCategory;
  branchId: number;
  branchName: string;
  personnelName: string;
  personnelRole: string;
  quizScore?: number;
  quizTotal?: number;
  quizPassed?: boolean;
  signedAgreement: boolean;
  completedAt: string;
  certificateId: string;
}

export interface EBookBookmark {
  documentId: string;
  chapterId: string;
  title: string;
  pageNumber: number;
  timestamp: string;
}

export interface TrainingFilterState {
  searchQuery: string;
  selectedCategory: 'all' | TrainingCategory;
  priorityFilter: 'all' | TrainingPriority;
  onlyWithVideo: boolean;
  onlyWithPdf: boolean;
}
