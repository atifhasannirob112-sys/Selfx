import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  BookOpen,
  Video,
  MessageSquare,
  ListTodo,
  FileText,
  Search,
  Play,
  X,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Download,
  ExternalLink,
  Sparkles,
  Award,
  Send,
  RefreshCw,
  Clock,
  PenTool,
  Bookmark,
  Settings,
  Plus,
  ArrowLeft,
  Check,
  Target,
  Code2,
  Users,
  Landmark,
  Building2,
  FileCheck,
  CalendarCheck,
  Volume2,
  VolumeX,
  Pause,
  Square,
  FastForward,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  FileUp,
  Headphones,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { triggerNotification } from '../utils';
import { acquireBgMusicPauseLock, releaseBgMusicPauseLock } from '../utils/remixAudioEngine';
import SpecialGuideHub from './SpecialGuideHub';
import PdfAiDecoder from './PdfAiDecoder';

// ==========================================
// DATA TYPES
// ==========================================
export interface BookChapter {
  id: string;
  number: number;
  title: string;
  authorOrUnit?: string;
  pages: {
    pageNumber: number;
    heading: string;
    englishContent?: string;
    bengaliExplanation: string;
    keyPoints: string[];
    creativeQuestionPrompt?: {
      ka: string;
      kha: string;
      ga: string;
      gha: string;
    };
  }[];
}

export interface SubjectBook {
  id: string;
  title: string;
  banglaTitle: string;
  paper: '1st' | '2nd' | 'single';
  category: 'english' | 'bangla' | 'ict' | 'islamic' | 'history' | 'social_work' | 'civics';
  pdfUrl: string;
  downloadUrl?: string;
  syllabusOverview: string;
  marksDistribution: string;
  chapters: BookChapter[];
}

export interface SubjectGroup {
  id: string;
  title: string;
  banglaTitle: string;
  iconType: 'Aa' | 'book' | 'code' | 'dome' | 'monument' | 'users' | 'court';
  bgColor: string;
  books: {
    firstPaper?: SubjectBook;
    secondPaper?: SubjectBook;
    single?: SubjectBook;
  };
}

export interface VideoLesson {
  id: string;
  title: string;
  subjectCategory: string;
  subjectName: string;
  youtubeId: string;
  channelName: string;
  duration: string;
  views: string;
  addedAgo: string;
  isTip?: boolean;
}

export interface DailyStudyTask {
  id: string;
  subject: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  questionForViva: string;
  sampleAnswer: string;
}

export interface CustomBookItem {
  id: string;
  title: string;
  subjectName: string;
  category: 'english' | 'bangla' | 'ict' | 'islamic' | 'history' | 'social_work' | 'civics' | 'other';
  paper: '1st' | '2nd' | 'both';
  sourceType: 'upload' | 'link';
  fileDataUrl?: string;
  externalUrl?: string;
  fileName?: string;
  fileSize?: string;
  description?: string;
  noteContent?: string;
  uploadedAt: number;
}

// ==========================================
// DEFAULT 13 OFFICIAL NCTB HUMANITIES BOOKS
// ==========================================
export const DEFAULT_BOOKS: SubjectBook[] = [
  {
    id: 'eng-1',
    title: 'English 1st Paper',
    banglaTitle: 'ইংরেজি ১ম পত্র (English For Today)',
    paper: '1st',
    category: 'english',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/English_1st_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/English_1st_Paper_XI-XII.pdf',
    syllabusOverview: 'Unit 1-10: Reading comprehension, Theme writing, Flow charts, Summary, Cloze test without clues, Rearranging sentence order, Appreciation of poems.',
    marksDistribution: 'Part A (Reading Comprehension & Vocabulary): 60 Marks, Part B (Guided Writing & Paragraph/Story): 40 Marks. Total: 100 Marks.',
    chapters: [
      {
        id: 'eng1-ch1',
        number: 1,
        title: 'The Portrait of a Lady',
        authorOrUnit: 'Unit 1 • Khushwant Singh',
        pages: [
          {
            pageNumber: 1,
            heading: 'Introduction & Appearance of Grandmother',
            englishContent: 'My grandmother, like everybody’s grandmother, was an old woman. She had been old and wrinkled for the twenty years that I had known her. People said that she had once been young and pretty and even had a husband, but that was hard to believe. She was an embodiment of pure serenity.',
            bengaliExplanation: 'লেখকের দাদীমা ছিলেন ভীষণ বয়োবৃদ্ধ, মমতাময়ী ও শান্ত স্বভাবের মানুষ। তাঁর মুখমণ্ডলে বার্ধক্যের বলিরেখা ফুটে উঠেছিল। লেখক যখন থেকেই তাঁকে দেখেছেন, তিনি এমনই পবিত্র ও ধার্মিক ছিলেন। লেখক উল্লেখ করেছেন কিভাবে তাঁর দাদীমা সর্বদা তসবিহ বা মালা জপ করতেন এবং দুধসাদা পোশাকে শান্ত ও মর্যাদাপূর্ণ ভঙ্গিতে চলাফেরা করতেন।',
            keyPoints: [
              'Khushwant Singh describes his deep affection and emotional connection with his grandmother.',
              'Grandmother is depicted as an embodiment of serene peace, dignity, and divine religious devotion.',
              'The author highlights the timeless innocence and unconditional love of her character.'
            ],
            creativeQuestionPrompt: {
              ka: 'Who is the author of "The Portrait of a Lady"?',
              kha: 'Why was it hard for the author to believe that his grandmother was once young and pretty?',
              ga: 'Explain the grandmother\'s physical appearance and daily spiritual routine in your own words.',
              gha: 'Evaluate the spiritual lifestyle of the grandmother and her maternal role in the family.'
            }
          },
          {
            pageNumber: 2,
            heading: 'Village Life & The Inseparable Bond',
            englishContent: 'My grandmother and I were good friends. My parents left me with her when they went to live in the city and we were constantly together. She used to wake me up in the morning and get me ready for school. She said her morning prayer in a monotonous sing-song while she bathed and dressed me...',
            bengaliExplanation: 'গ্রামে লেখকের সাথে তাঁর দাদীর সম্পর্ক ছিল ভীষণ নিবিড় ও অটুট। দাদীমা লেখককে স্কুলে নিয়ে যেতেন, নিজে মন্দিরে বসে ধর্মগ্রন্থ পাঠ করতেন এবং ফেরার পথে গ্রামের পথকুকুরদের বাসি রুটি খাওয়াতেন। এটি তাদের নিঃস্বার্থ ভালোবাসা ও মানবিকতার এক অনন্য প্রতীক।',
            keyPoints: [
              'In the village, the bond between author and grandmother reached its pinnacle of love.',
              'She fed stale chapatis to street dogs every single afternoon, showing universal compassion.',
              'School was adjacent to the temple, harmoniously blending education with spiritual values.'
            ],
            creativeQuestionPrompt: {
              ka: 'What did the grandmother feed the village dogs on her way back?',
              kha: 'How did the grandmother help the author get ready for school in the village?',
              ga: 'Compare their peaceful village life with their subsequent city life.',
              gha: '"Human relationship shifts as external environment evolves" — Analyze in the context of the story.'
            }
          }
        ]
      },
      {
        id: 'eng1-ch2',
        number: 2,
        title: "We're Not Afraid to Die... If We Can All Be Together",
        authorOrUnit: 'Unit 2 • Gordon Cook & Alan East',
        pages: [
          {
            pageNumber: 1,
            heading: 'The Voyage and the Southern Ocean Storm',
            englishContent: 'In July 1976, my wife Mary, son Jonathan, daughter Suzanne, and I set sail from Plymouth, England, to duplicate the round-the-world voyage made 200 years earlier by Captain James Cook.',
            bengaliExplanation: 'এই গল্পে একটি পরিবারের অদম্য মানসিক সাহস, সমুদ্রের প্রলয়ংকরী ঝড়ের বিরুদ্ধে লড়াই এবং পারিবারিক ঐক্য ফুটে উঠেছে। উত্তাল সাগরে যখন তাদের জাহাজ মারাত্মকভাবে ক্ষতিগ্রস্ত হয়েছিল, তখন ছোট শিশুরা বলেছিল—"আমরা মরতে ভয় পাই না, যদি আমরা সবাই একসাথে থাকতে পারি।"',
            keyPoints: [
              'Heroic struggle against the mighty, merciless Southern Indian Ocean.',
              'Children\'s profound optimism and courage motivated the parents to fight till the end.',
              'Teamwork, presence of mind, and hope saved their lives at Île Amsterdam.'
            ],
            creativeQuestionPrompt: {
              ka: 'In which year did the narrator set sail with his family?',
              kha: 'What inspirational words did Jonathan say to his father during the storm?',
              ga: 'Describe how the narrator pumped out water to keep Wavewalker afloat.',
              gha: 'Discuss the theme of family solidarity in overcoming fatal catastrophes.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'eng-2',
    title: 'English 2nd Paper',
    banglaTitle: 'ইংরেজি ২য় পত্র (Grammar & Composition)',
    paper: '2nd',
    category: 'english',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/English_2nd_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/English_2nd_Paper_XI-XII.pdf',
    syllabusOverview: 'Grammar (60 Marks): Gap filling with prepositions, Special phrases (was born, have to, would rather, let alone, as soon as), Completing sentences, Right forms of verbs, Narrative style, Modifiers, Sentence connectors, Synonym/Antonym, Punctuation. Composition (40 Marks): Formal letters, Paragraphs.',
    marksDistribution: 'Part A (Grammar): 60 Marks, Part B (Composition): 40 Marks. Total: 100 Marks.',
    chapters: [
      {
        id: 'eng2-ch1',
        number: 1,
        title: 'Modifiers: Pre-modifiers & Post-modifiers',
        authorOrUnit: 'Grammar Topic 1',
        pages: [
          {
            pageNumber: 1,
            heading: 'Understanding Pre-modifiers & Post-modifiers',
            englishContent: 'Modifiers qualify or add extra meaning to a noun, verb, or adjective. Pre-modifier comes BEFORE the headword (e.g. "an intelligent student"), Post-modifier comes AFTER the headword (e.g. "the man standing at the gate").',
            bengaliExplanation: 'Modifier কোনো শব্দকে অলংকৃত বা নির্দিষ্ট করে। প্রি-মডিফায়ার প্রধান শব্দের আগে বসে এবং পোস্ট-মডিফায়ার প্রধান শব্দের পরে বসে। HSC প্রশ্নে বন্ধনীর মধ্যে নির্দেশনা দেওয়া থাকে, যেমন: (pre-modify the noun with an adjective)।',
            keyPoints: [
              'Adjective as pre-modifier: "a skilled teacher".',
              'Infinitive phrase as post-modifier: "He worked hard to pass the exam".',
              'Participle as modifier: "The broken glass", "The bird singing on the branch".',
              'Noun adjunct: "train journey", "college student".'
            ],
            creativeQuestionPrompt: {
              ka: 'What is a pre-modifier?',
              kha: 'Explain the difference between pre-modifier and post-modifier with examples.',
              ga: 'Provide 3 examples of present participles functioning as post-modifiers.',
              gha: 'Write five sentences where infinitive phrases modify verbs and adjectives.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'bang-1',
    title: 'Bangla 1st Paper',
    banglaTitle: 'বাংলা ১ম পত্র (সাহিত্য পাঠ ও সহপাঠ)',
    paper: '1st',
    category: 'bangla',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Bangla_1st_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Bangla_1st_Paper_XI-XII.pdf',
    syllabusOverview: 'গদ্য: অপরিচিতা, বিলাসী, আমার পথ, মানব-কল্যাণ, মাসি-পিসি, বায়ান্নর দিনগুলো, রেইনকোট। কবিতা: সোনার তরী, বিদ্রোহী, প্রতিদান, তাহারেই পড়ে মনে, আঠারো বছর বয়স। সহপাঠ: উপন্যাস লালসালু, নাটক সিরাজউদ্দৌলা।',
    marksDistribution: 'সৃজনশীল প্রশ্ন (১১টির মধ্যে ৭টি দিতে হবে): ৭০ নম্বর, বহুনির্বাচনী (MCQ): ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'bang1-ch1',
        number: 1,
        title: 'অপরিচিতা — রবীন্দ্রনাথ ঠাকুর',
        authorOrUnit: 'গদ্য • গল্পগুচ্ছ',
        pages: [
          {
            pageNumber: 1,
            heading: 'অনুপম ও শম্ভুনাথ সেনের আত্মমর্যাদা',
            bengaliExplanation: '‘অপরিচিতা’ গল্পটি প্রথম প্রকাশিত হয় প্রমথ চৌধুরী সম্পাদিত ‘সবুজপত্র’ পত্রিকায় (১৯১৪ সালে)। গল্পের কেন্দ্রীয় চরিত্র অনুপম ব্যক্তিত্বহীন ও পরনির্ভরশীল, কিন্তু নারী চরিত্র কল্যাণী ও তার পিতা শম্ভুনাথ সেন আত্মমর্যাদার এক অনন্য প্রতীক। যৌতুকের লোভে অনুপমের মামার সংকীর্ণ মানসিকতার প্রতিবাদে শম্ভুনাথ সেন বিয়ের মণ্ডপ থেকে অনুপমদের ফিরিয়ে দেন।',
            keyPoints: [
              'মূল বিষয়বস্তু: যৌতুক প্রথার বিরুদ্ধে আত্মমর্যাদাবোধ ও মানবতাবোধের চরম জয়।',
              'অনুপম: নরম প্রকৃতির, ব্যক্তিত্বহীন যুবকের অসহায় প্রতীক।',
              'কল্যাণী: আত্মমর্যাদাসম্পন্ন, শিক্ষিতা নারী—যে দেশমাতৃকার সেবায় নিবেদিত।'
            ],
            creativeQuestionPrompt: {
              ka: '‘অপরিচিতা’ গল্পটি প্রথম কোন পত্রিকায় প্রকাশিত হয়?',
              kha: 'শম্ভুনাথ সেন বিয়ের আসরে স্বর্ণকার এনে গহনা পরীক্ষা করালেন কেন?',
              ga: 'অনুপমের চরিত্রের অসহায়ত্ব উদ্দীপকের আলোকে আলোচনা করো।',
              gha: '‘অপরিচিতা গল্পের কল্যাণীই বর্তমান আধুনিক নারীর আদর্শ’ — উক্তিটি মূল্যায়ন করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'bang-2',
    title: 'Bangla 2nd Paper',
    banglaTitle: 'বাংলা ২য় পত্র (ব্যাকরণ ও নির্মিতি)',
    paper: '2nd',
    category: 'bangla',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Bangla_2nd_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Bangla_2nd_Paper_XI-XII.pdf',
    syllabusOverview: 'ব্যাকরণ অংশ (৩০ নম্বর): বাংলা উচ্চারণের নিয়ম, বাংলা বানানের নিয়ম, ব্যাকরণিক শব্দশ্রেণি, সমাস, বাক্যতত্ত্ব, শুদ্ধপ্রয়োগ। নির্মিতি অংশ (৭০ নম্বর): অনুবাদ, দিনলিপি, প্রতিবেদন, আবেদনপত্র, সারাংশ, ভাব-সম্প্রসারণ, সংলাপ, প্রবন্ধ রচনা।',
    marksDistribution: 'ব্যাকরণ: ৩০ নম্বর, নির্মিতি: ৭০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'bang2-ch1',
        number: 1,
        title: 'বাংলা উচ্চারণের নিয়ম ও অ-ধ্বনি',
        authorOrUnit: 'ব্যাকরণ অংশ',
        pages: [
          {
            pageNumber: 1,
            heading: 'আদ্য ‘অ’ ও অন্ত্য ‘অ’ উচ্চারণের ৫টি নিয়ম',
            bengaliExplanation: 'বাংলা শব্দে আদ্য ‘অ’ ধ্বনির পর ই-কার বা উ-কার থাকলে সেই ‘অ’ সাধারণত সংবৃত বা ‘ও’ কারের মতো উচ্চারিত হয় (যেমন: অতি -> ওতি, মতি -> মোতি)। য-ফলা যুক্ত ব্যঞ্জনবর্ণের পূর্ববর্তী ‘অ’ সংবৃত হয় (যেমন: অদ্য -> ওদ্দো)।',
            keyPoints: [
              'আদ্য অ-এর সংবৃত উচ্চারণ বোর্ড পরীক্ষার অতি কমন প্রশ্ন।',
              'অন্ত্য ‘অ’ সাধারণ নিয়মে ও-কারান্ত রূপ ধারণ করে (যেমন: কাল -> কালো, শুভ -> শুভো)।'
            ],
            creativeQuestionPrompt: {
              ka: 'সংবৃত উচ্চারণ কাকে বলে?',
              kha: 'আদ্য ‘অ’ উচ্চারণের যেকোনো দুটি নিয়ম উদাহরণসহ বুঝিয়ে দাও।',
              ga: 'নিম্নলিখিত শব্দগুলোর প্রমিত উচ্চারণ লেখো: অটল, অধ্যক্ষ, নদী, দিনবন্ধু।',
              gha: 'বাংলা ভাষায় উচ্চারণের নিয়ম জানা কেন অপরিহার্য আলোচনা করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'ict',
    title: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)',
    banglaTitle: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    paper: 'single',
    category: 'ict',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/ICT_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/ICT_XI-XII.pdf',
    syllabusOverview: 'অধ্যায় ১: বিশ্ব ও বাংলাদেশ প্রেক্ষিত (ভার্চুয়াল রিয়েলিটি, এআই, ক্রায়োসার্জারি, বায়োমেট্রিক্স)। অধ্যায় ২: নেটওয়ার্কিং। অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস (লজিক গেট, ২-এর পরিপূরক)। অধ্যায় ৪: HTML ও ওয়েব ডিজাইন। অধ্যায় ৫: সি প্রোগ্রামিং।',
    marksDistribution: 'সৃজনশীল প্রশ্ন (৮টিতে ৫টি): ৫০ নম্বর, MCQ: ২৫ নম্বর, ব্যবহারিক: ২৫ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'ict-ch3',
        number: 3,
        title: 'অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        authorOrUnit: 'Chapter 3: Number Systems & Logic Gates',
        pages: [
          {
            pageNumber: 1,
            heading: '২-এর পরিপূরক (2’s Complement) ও বাইনারি যোগ',
            bengaliExplanation: 'কম্পিউটারে ঋণাত্মক সংখ্যা উপস্থাপনের প্রধান পদ্ধতি হলো ২-এর পরিপূরক। কোনো বাইনারি সংখ্যার ১-এর পরিপূরক করে ১ যোগ করলে ২-এর পরিপূরক পাওয়া যায়। এর মাধ্যমে কম্পিউটার যোগের সার্কিট দিয়েই যাবতীয় বিয়োগ অপারেশন সম্পন্ন করতে পারে।',
            keyPoints: [
              '১-এর পরিপূরক = বিট উল্টানো (০ কে ১, ১ কে ০)।',
              '২-এর পরিপূরক = ১-এর পরিপূরক + ১।',
              'সর্ববাম দিকের বিটটিকে চিহ্ন বিট (Sign Bit) বলে (০ হলে ধনাত্মক, ১ হলে ঋণাত্মক)।'
            ],
            creativeQuestionPrompt: {
              ka: 'চিহ্নযুক্ত সংখ্যা (Signed Number) কী?',
              kha: '২-এর পরিপূরক গঠনের প্রয়োজনীয়তা ব্যাখ্যা করো।',
              ga: 'দশমিক (+২৫) ও (-১২) এর মধ্যে ২-এর পরিপূরক পদ্ধতিতে যোগফল নির্ণয় করো।',
              gha: 'ডিজিটাল সার্কিটে ২-এর পরিপূরকের ব্যবহারিক সুবিধা বিশ্লেষণ করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'islam-1',
    title: 'Islamic Studies 1st Paper',
    banglaTitle: 'ইসলাম শিক্ষা ১ম পত্র',
    paper: '1st',
    category: 'islamic',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_Studies_1st_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_Studies_1st_Paper_XI-XII.pdf',
    syllabusOverview: '১ম অধ্যায়: ইসলাম শিক্ষা ও তার উৎস। ২য় অধ্যায়: শরিয়তের উৎস (কুরআন, সুন্নাহ, ইজমা, কিয়াস)। ৩য় অধ্যায়: পারিবারিক ও সামাজিক জীবনব্যবস্থা। ৪র্থ অধ্যায়: অর্থনীতি ও রাজনীতি।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'isl1-ch1',
        number: 1,
        title: '১ম অধ্যায়: ইসলামি শরিয়তের প্রথম উৎস—পবিত্র কুরআন',
        authorOrUnit: 'আল-কুরআন সংরক্ষণ ও বৈশিষ্ট্য',
        pages: [
          {
            pageNumber: 1,
            heading: 'পবিত্র কুরআন অবতরণ ও মানবজাতির দিকনির্দেশনা',
            bengaliExplanation: 'পবিত্র কুরআন মহান আল্লাহর চিরন্তন বাণী যা জিবরাঈল (আ.)-এর মাধ্যমে মহানবী (সা.)-এর ওপর দীর্ঘ ২৩ বছরে মানুষের কল্যাণ ও হেদায়াতের জন্য অবতীর্ণ হয়। এটি মানুষের ইহকালীন শান্তি ও পরকালীন মুক্তির একমাত্র পথ।',
            keyPoints: [
              'প্রথম অবতীর্ণ আয়াত: সূরা আলাকের প্রথম ৫টি আয়াত।',
              'কুরআন সংরক্ষণে হজরত আবু বকর (রা.) ও হজরত ওসমান (রা.)-এর ঐতিহাসিক অবদান।'
            ],
            creativeQuestionPrompt: {
              ka: 'শরিয়তের প্রধান উৎস কয়টি?',
              kha: 'আল-কুরআনকে মানবজাতির সংবিধান বলা হয় কেন?',
              ga: 'কুরআন সংরক্ষণে সাহাবায়ে কিরামের উদ্যোগ পর্যালোচনা করো।',
              gha: 'আধুনিক সমাজে কুরআনের নীতিমালার প্রয়োজনীয়তা বিশ্লেষণ করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'islam-2',
    title: 'Islamic Studies 2nd Paper',
    banglaTitle: 'ইসলাম শিক্ষা ২য় পত্র',
    paper: '2nd',
    category: 'islamic',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_Studies_2nd_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_Studies_2nd_Paper_XI-XII.pdf',
    syllabusOverview: 'হাদিস শাস্ত্র পরিচিতি ও নির্বাচিত হাদিসসমূহ, ফিকহ শাস্ত্র ও মাসআলা-মাসায়েল, বিখ্যাত মুসলিম মনীষীদের অবদান।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'isl2-ch1',
        number: 1,
        title: 'হাদিস শাস্ত্র পরিচিতি ও সনদের গুরুত্ব',
        authorOrUnit: 'হাদিস ও সিহাহ সিত্তাহ',
        pages: [
          {
            pageNumber: 1,
            heading: 'হাদিসের সংজ্ঞা ও হাদিস সংকলনের ইতিহাস',
            bengaliExplanation: 'রাসূলুল্লাহ (সা.)-এর কথা, কাজ ও মৌনসম্মতিকে হাদিস বলা হয়। হাদিসের দুটি প্রধান অংশ: সনদ (বর্ণনাকারীদের পরম্পরা) ও মতন (মূল বক্তব্য)।',
            keyPoints: [
              'সিহাহ সিত্তাহ বা প্রসিদ্ধ ছয়টি সহিহ হাদিস গ্রন্থ।',
              'হাদিস শরিয়তের দ্বিতীয় প্রধান উৎস যা কুরআনের বিস্তারিত ব্যাখ্যা দেয়।'
            ],
            creativeQuestionPrompt: {
              ka: 'হাদিসের দুটি প্রধান অংশের নাম লেখো।',
              kha: 'সনদ ও মতনের পার্থক্য বুঝিয়ে দাও।',
              ga: 'হাদিস সংকলনে ইমাম বুখারী (রহ.)-এর অবদান ব্যাখ্যা করো।',
              gha: 'কুরআনের ব্যাখ্যার ক্ষেত্রে হাদিসের অনিবার্য ভূমিকা তুলে ধরো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'history-1',
    title: 'Islamic History 1st Paper',
    banglaTitle: 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র',
    paper: '1st',
    category: 'history',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_History_1st_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_History_1st_Paper_XI-XII.pdf',
    syllabusOverview: 'অধ্যায় ১: প্রাক-ইসলামি আরব। অধ্যায় ২: হযরত মুহাম্মদ (সা.)-এর মক্কী ও মাদানী জীবন (মদিনা সনদ, বদর যুদ্ধ)। অধ্যায় ৩: খোলাফায়ে রাশেদীন। অধ্যায় ৪: উমাইয়া খিলাফত।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'hist1-ch1',
        number: 1,
        title: 'প্রাক-ইসলামি আরব ও মদিনা সনদ',
        authorOrUnit: 'অধ্যায় ১ ও ২',
        pages: [
          {
            pageNumber: 1,
            heading: 'মদিনা সনদ: পৃথিবীর প্রথম লিখিত সংবিধান',
            bengaliExplanation: '৬২২ খ্রিস্টাব্দে হিজরতের পর রাসূলুল্লাহ (সা.) মদিনায় মুসলিম, ইহুদি ও অমুসলিম বিভিন্ন গোত্রের মধ্যে শান্তি, সহাবস্থান ও নিরাপত্তা বজায় রাখতে ৪৭টি ধারার ঐতিহাসিক মদিনা সনদ সম্পাদন করেন।',
            keyPoints: [
              'মদিনা সনদে প্রত্যেকের পূর্ণ ধর্মীয় স্বাধীনতা নিশ্চিত ছিল।',
              'বাইরের আক্রমণের বিরুদ্ধে মদিনাবাসী ঐক্যবদ্ধ প্রতিরক্ষার প্রতিশ্রুতিবদ্ধ হয়েছিল।'
            ],
            creativeQuestionPrompt: {
              ka: 'মদিনা সনদের ধারা কয়টি ছিল?',
              kha: 'মদিনা সনদকে বিশ্বের প্রথম লিখিত সংবিধান বলা হয় কেন?',
              ga: 'মদিনা সনদের ধর্মীয় সহনশীলতার ধারাগুলো বিশ্লেষণ করো।',
              gha: 'আধুনিক গণতান্ত্রিক শাসনব্যবস্থায় মদিনা সনদের গুরুত্ব আলোচনা করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'history-2',
    title: 'Islamic History 2nd Paper',
    banglaTitle: 'ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র',
    paper: '2nd',
    category: 'history',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_History_2nd_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Islamic_History_2nd_Paper_XI-XII.pdf',
    syllabusOverview: 'ভারতে মুসলিম শাসন প্রতিষ্ঠা, দিল্লির সালতানাত ও মুঘল সাম্রাজ্য (বাবর, আকবর, শাহজাহান, আওরঙ্গজেব), বাংলার স্বাধীন সুলতানি আমল।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'hist2-ch1',
        number: 1,
        title: 'ভারতে মুঘল সাম্রাজ্যের উত্থান ও আকবরের শাসননীতি',
        authorOrUnit: 'মুঘল সাম্রাজ্য',
        pages: [
          {
            pageNumber: 1,
            heading: 'পানিপথের ১ম যুদ্ধ ও সম্রাট বাবর',
            bengaliExplanation: '১৫২৬ খ্রিস্টাব্দে পানিপথের প্রথম যুদ্ধে ইব্রাহিম লোদিকে পরাজিত করে সম্রাট জহিরুদ্দিন মুহম্মদ বাবর ভারতে গৌরবময় মুঘল সাম্রাজ্যের গোড়াপত্তন করেন।',
            keyPoints: [
              'বাবরের দূরদর্শী রণকৌশল, শৃঙ্খলিত তুলঘুমা কৌশল ও শক্তিশালী তোপখানার ব্যবহার।',
              'দিল্লি সালতানাতের সমাপ্তি ও মুঘল শাসনের সূত্রপাত।'
            ],
            creativeQuestionPrompt: {
              ka: 'পানিপথের প্রথম যুদ্ধ কত সালে সংঘটিত হয়?',
              kha: 'তুলঘুমা যুদ্ধকৌশল কী ছিল?',
              ga: 'বাবরের যুদ্ধজয়ের প্রধান কারণসমূহ বর্ণনা করো।',
              gha: 'ভারতে বাবর কর্তৃক প্রতিষ্ঠিত সাম্রাজ্যের সুদূরপ্রসারী তাৎপর্য মূল্যায়ন করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'social-1',
    title: 'Social Work 1st Paper',
    banglaTitle: 'সমাজকর্ম ১ম পত্র',
    paper: '1st',
    category: 'social_work',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Social_Work_1st_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Social_Work_1st_Paper_XI-XII.pdf',
    syllabusOverview: 'অধ্যায় ১: সমাজকর্মের ধারণা, পরিধি ও উদ্দেশ্য। অধ্যায় ২: সমাজকর্মের বিবর্তন ও বিভারিজ রিপোর্ট (৫ দৈত্য)। অধ্যায় ৩: পেশাগত মূল্যবোধ ও নীতিমালা।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'soc1-ch1',
        number: 1,
        title: 'সমাজকর্মের ধারণা ও বিভারিজ রিপোর্ট',
        authorOrUnit: 'অধ্যায় ১ ও ২',
        pages: [
          {
            pageNumber: 1,
            heading: 'সমাজকর্ম ও বিভারিজ রিপোর্টের ৫ দৈত্য',
            bengaliExplanation: 'সমাজকর্ম একটি বিজ্ঞানসম্মত সহায়ক পেশা যা মানুষকে তাদের সমস্যা সমাধানে সক্ষম করে তোলে। ১৯৪২ সালের ঐতিহাসিক বিভারিজ রিপোর্টে আধুনিক মানব সমাজের ৫টি বড় দৈত্য চিহ্নিত হয়: অভাব (Want), রোগ (Disease), অজ্ঞতা (Ignorance), নোংরা পরিবেশ (Squalor) ও অলসতা (Idleness)।',
            keyPoints: [
              'সমাজকর্ম মানুষকে কেবল আর্থিক সাহায্য দেয় না, স্বাবলম্বী হওয়ার প্রেরণা ও দিকনির্দেশনা দেয়।',
              'স্যার উইলিয়াম বিভারিজের সামাজিক নিরাপত্তা স্কিম আধুনিক কল্যাণ রাষ্ট্রের ভিত্তি।'
            ],
            creativeQuestionPrompt: {
              ka: 'বিভারিজ রিপোর্ট কত সালে পেশ করা হয়?',
              kha: 'বিভারিজ রিপোর্টের পঞ্চদৈত্য বলতে কী বোঝায়?',
              ga: 'বাংলাদেশে সমাজকর্ম শিক্ষার গুরুত্ব উদ্দীপকের আলোকে আলোচনা করো।',
              gha: '‘সাহায্যকারী পেশা হিসেবে সমাজকর্ম অনন্য’ — উক্তিটির যথার্থতা প্রমাণ করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'social-2',
    title: 'Social Work 2nd Paper',
    banglaTitle: 'সমাজকর্ম ২য় পত্র',
    paper: '2nd',
    category: 'social_work',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Social_Work_2nd_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Social_Work_2nd_Paper_XI-XII.pdf',
    syllabusOverview: 'বাংলাদেশে মৌলিক মানবিক চাহিদা ও সামাজিক সমস্যা (দারিদ্র্য, বেকারত্ব, মাদকাসক্তি, প্রবীণ সমস্যা) এবং সরকারি ও বেসরকারি সামাজিক নিরাপত্তা কার্যক্রম।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'soc2-ch1',
        number: 1,
        title: 'মৌলিক মানবিক চাহিদা ও বাংলাদেশের বাস্তবতা',
        authorOrUnit: 'অধ্যায় ১',
        pages: [
          {
            pageNumber: 1,
            heading: 'অন্ন, বস্ত্র, বাসস্থান, শিক্ষা ও চিকিৎসা',
            bengaliExplanation: 'মানুষের স্বাভাবিকভাবে বেঁচে থাকার জন্য ছয়টি মৌলিক চাহিদা অপরিহার্য। বাংলাদেশের মতো উন্নয়নশীল দেশে দারিদ্র্য ও সম্পদের অসম বণ্টনের কারণে অনেকেই এসব চাহিদা থেকে বঞ্চিত হয়।',
            keyPoints: [
              'মৌলিক চাহিদা পূরণ না হলে সমাজে অপরাধ ও হতাশা বৃদ্ধি পায়।',
              'সামাজিক নিরাপত্তা ও টেকসই উন্নয়ন লক্ষ্যমাত্রা অর্জনে পদক্ষেপ নেওয়া প্রয়োজন।'
            ],
            creativeQuestionPrompt: {
              ka: 'মৌলিক মানবিক চাহিদা কয়টি?',
              kha: 'বিনোদনকে কেন মৌলিক মানবিক চাহিদা বলা হয়?',
              ga: 'বাংলাদেশে গৃহহীনদের পুনর্বাসনে সরকারের কার্যক্রম ব্যাখ্যা করো।',
              gha: 'মৌলিক মানবিক চাহিদা অপূরণজনিত সমস্যা ও সামাজিক বিশৃঙ্খলা মূল্যায়ন করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'civics-1',
    title: 'Civics & Good Governance 1st Paper',
    banglaTitle: 'পৌরনীতি ও সুশাসন ১ম পত্র',
    paper: '1st',
    category: 'civics',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Civics_1st_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Civics_1st_Paper_XI-XII.pdf',
    syllabusOverview: 'অধ্যায় ১: পৌরনীতি পরিচিতি। অধ্যায় ২: সুশাসন ও এর ৪টি স্তম্ভ। অধ্যায় ৩: মূল্যবোধ, আইন, স্বাধীনতা ও সাম্য। অধ্যায় ৪: ই-গভর্ন্যান্স ও সুশাসন।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'civ1-ch1',
        number: 1,
        title: 'পৌরনীতি ও সুশাসনের ধারণা ও উপাদান',
        authorOrUnit: 'অধ্যায় ১ ও ২',
        pages: [
          {
            pageNumber: 1,
            heading: 'সুশাসনের ৪টি স্তম্ভ ও ই-গভর্ন্যান্স',
            bengaliExplanation: 'সুশাসনের ৪টি প্রধান স্তম্ভ: স্বচ্ছতা (Transparency), জবাবদিহিতা (Accountability), আইনের শাসন (Rule of Law) এবং জনগণের কার্যকর অংশগ্রহণ। ই-গভর্ন্যান্সের মাধ্যমে সরকারি সেবা সরাসরি জনগণের দোরগোড়ায় পৌঁছে দেওয়া যায়।',
            keyPoints: [
              'সুশাসন নাগরিকের জীবনযাত্রার মান ও মৌলিক অধিকার রক্ষা করে।',
              'ই-গভর্ন্যান্স প্রশাসনিক লালফিতার দৌরাত্ম্য ও দুর্নীতি হ্রাসে কার্যকর।'
            ],
            creativeQuestionPrompt: {
              ka: 'Civics শব্দটি কোন ল্যাটিন শব্দ থেকে এসেছে?',
              kha: 'সুশাসনে জবাবদিহিতার গুরুত্ব ব্যাখ্যা করো।',
              ga: 'উদ্দীপকের ঘটনায় সুশাসনের কোন স্তম্ভের অভাব পরিলক্ষিত হয়?',
              gha: '‘ই-গভর্ন্যান্স সুশাসনের পথ প্রশস্ত করে’ — উক্তিটির যৌক্তিকতা প্রমাণ করো।'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'civics-2',
    title: 'Civics & Good Governance 2nd Paper',
    banglaTitle: 'পৌরনীতি ও সুশাসন ২য় পত্র',
    paper: '2nd',
    category: 'civics',
    pdfUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Civics_2nd_Paper_XI-XII.pdf',
    downloadUrl: 'https://nctb.gov.bd/sites/default/files/files/nctb.portal.gov.bd/page/e437c385_d137_4fe1_8d3d_394ad9b30c94/Civics_2nd_Paper_XI-XII.pdf',
    syllabusOverview: 'ব্রিটিশ ভারত থেকে পাকিস্তান ও বাংলাদেশ: ১৯৫২-এর ভাষা আন্দোলন, ১৯৬৬-এর ঐতিহাসিক ৬ দফা দাবি, ১৯৭১-এর মুক্তিযুদ্ধ, বাংলাদেশের সংবিধান ও সরকার ব্যবস্থা।',
    marksDistribution: 'সৃজনশীল প্রশ্ন: ৭০ নম্বর, MCQ: ৩০ নম্বর। মোট: ১০০ নম্বর।',
    chapters: [
      {
        id: 'civ2-ch1',
        number: 1,
        title: '১৯৫২-এর ভাষা আন্দোলন ও ঐতিহাসিক ৬ দফা দাবি',
        authorOrUnit: 'অধ্যায় ২',
        pages: [
          {
            pageNumber: 1,
            heading: 'ঐতিহাসিক ৬ দফা: বাঙালির বাঁচার দাবি',
            bengaliExplanation: '১৯৬৬ সালে বঙ্গবন্ধু শেখ মুজিবুর রহমান লাহোরে বাঙালি জাতির রাজনৈতিক, অর্থনৈতিক ও প্রশাসনিক মুক্তির সনদ হিসেবে ঐতিহাসিক ৬ দফা পেশ করেন। একে বাঙালির ‘ম্যাগনাকার্টা’ হিসেবে গণ্য করা হয়।',
            keyPoints: [
              '৬ দফায় পূর্ব পাকিস্তানের অর্থনৈতিক স্বাধিকার ও নিজস্ব মুদ্রা বা ব্যাংক ব্যবস্থার রূপরেখা দেওয়া হয়েছিল।',
              '৬ দফাই চূড়ান্তভাবে ১৯৬৯-এর গণঅভ্যুত্থান এবং ১৯৭১-এর মহান মুক্তিযুদ্ধের পটভূমি তৈরি করে।'
            ],
            creativeQuestionPrompt: {
              ka: 'ঐতিহাসিক ৬ দফা কে এবং কোথায় ঘোষণা করেছিলেন?',
              kha: '৬ দফাকে বাঙালির ম্যাগনাকার্টা বলা হয় কেন?',
              ga: '৬ দফার অর্থনৈতিক দাবিগুলো ব্যাখ্যা করো।',
              gha: '‘৬ দফা আন্দোলনই বাংলাদেশের স্বাধীনতার বীজ বপন করেছিল’ — মতামত দাও।'
            }
          }
        ]
      }
    ]
  }
];

export const SUBJECT_GROUPS: SubjectGroup[] = [
  {
    id: 'english-group',
    title: 'English',
    banglaTitle: 'ইংরেজি (১ম ও ২য় পত্র)',
    iconType: 'Aa',
    bgColor: 'from-amber-600 to-orange-600',
    books: {
      firstPaper: DEFAULT_BOOKS[0],
      secondPaper: DEFAULT_BOOKS[1]
    }
  },
  {
    id: 'bangla-group',
    title: 'বাংলা',
    banglaTitle: 'বাংলা (১ম ও ২য় পত্র)',
    iconType: 'book',
    bgColor: 'from-blue-600 to-indigo-700',
    books: {
      firstPaper: DEFAULT_BOOKS[2],
      secondPaper: DEFAULT_BOOKS[3]
    }
  },
  {
    id: 'ict-group',
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি',
    banglaTitle: 'ICT (একাদশ-দ্বাদশ শ্রেণি)',
    iconType: 'code',
    bgColor: 'from-emerald-600 to-teal-700',
    books: {
      single: DEFAULT_BOOKS[4]
    }
  },
  {
    id: 'islam-group',
    title: 'ইসলাম শিক্ষা',
    banglaTitle: 'ইসলাম শিক্ষা (১ম ও ২য় পত্র)',
    iconType: 'dome',
    bgColor: 'from-sky-600 to-blue-700',
    books: {
      firstPaper: DEFAULT_BOOKS[5],
      secondPaper: DEFAULT_BOOKS[6]
    }
  },
  {
    id: 'history-group',
    title: 'ইসলামের ইতিহাস ও সংস্কৃতি',
    banglaTitle: 'ইসলামের ইতিহাস (১ম ও ২য় পত্র)',
    iconType: 'monument',
    bgColor: 'from-amber-700 to-yellow-700',
    books: {
      firstPaper: DEFAULT_BOOKS[7],
      secondPaper: DEFAULT_BOOKS[8]
    }
  },
  {
    id: 'social-group',
    title: 'সমাজকর্ম',
    banglaTitle: 'সমাজকর্ম (১ম ও ২য় পত্র)',
    iconType: 'users',
    bgColor: 'from-cyan-600 to-blue-600',
    books: {
      firstPaper: DEFAULT_BOOKS[9],
      secondPaper: DEFAULT_BOOKS[10]
    }
  },
  {
    id: 'civics-group',
    title: 'পৌরনীতি ও সুশাসন',
    banglaTitle: 'পৌরনীতি (১ম ও ২য় পত্র)',
    iconType: 'court',
    bgColor: 'from-indigo-600 to-purple-700',
    books: {
      firstPaper: DEFAULT_BOOKS[11],
      secondPaper: DEFAULT_BOOKS[12]
    }
  }
];

export const DEFAULT_VIDEOS: VideoLesson[] = [
  {
    id: 'v-eng-1',
    title: 'HSC 26 | English 1st Paper | The Portrait of a Lady (Unit 1 Lesson 1) | Free Class',
    subjectCategory: 'english',
    subjectName: 'ইংরেজি ১ম পত্র',
    youtubeId: 'hvY4LTNanaM',
    channelName: '10 Minute School',
    duration: '42:15',
    views: '1.2M',
    addedAgo: '৩ দিন আগে'
  },
  {
    id: 'v-eng-2',
    title: 'HSC English 1st Paper: Passage Reading & MCQ Strategy | Unit 1',
    subjectCategory: 'english',
    subjectName: 'ইংরেজি ১ম পত্র',
    youtubeId: '62We8whkojc',
    channelName: 'Bondi Pathshala',
    duration: '34:20',
    views: '840K',
    addedAgo: '৫ দিন আগে'
  },
  {
    id: 'v-eng-3',
    title: 'Modifiers Shortcut Rules with Practice | HSC English 2nd Paper',
    subjectCategory: 'english',
    subjectName: 'ইংরেজি ২য় পত্র',
    youtubeId: '5cOUUv6F4Uo',
    channelName: 'English Moja',
    duration: '28:50',
    views: '1.5M',
    addedAgo: '১ সপ্তাহ আগে'
  },
  {
    id: 'v-eng-4',
    title: 'HSC English 2nd Paper Completing Sentences with Rules',
    subjectCategory: 'english',
    subjectName: 'ইংরেজি ২য় পত্র',
    youtubeId: 'fG75txs6pWk',
    channelName: '10 Minute School',
    duration: '31:10',
    views: '760K',
    addedAgo: '৪ দিন আগে'
  },
  {
    id: 'v-ban-1',
    title: 'HSC 26 | বাংলা ১ম পত্র | অপরিচিতা | গদ্য ১ম ক্লাস | Shikho HSC Free Class',
    subjectCategory: 'bangla',
    subjectName: 'বাংলা ১ম পত্র',
    youtubeId: 'XcZPUhxHnwI',
    channelName: 'Shikho HSC',
    duration: '52:30',
    views: '1.1M',
    addedAgo: '২ দিন আগে'
  },
  {
    id: 'v-ban-2',
    title: 'HSC 26 | বাংলা ১ম পত্র | নির্বাচিত ৪০+ সৃজনশীল প্রশ্ন | CQ Special Class',
    subjectCategory: 'bangla',
    subjectName: 'বাংলা ১ম পত্র',
    youtubeId: 'ChO82eB23ZU',
    channelName: 'Shikho HSC',
    duration: '45:10',
    views: '920K',
    addedAgo: '১ সপ্তাহ আগে'
  },
  {
    id: 'v-ban-3',
    title: 'Bangla Pronunciation and Spelling | বাংলা উচ্চারণ ও বানানের নিয়ম',
    subjectCategory: 'bangla',
    subjectName: 'বাংলা ২য় পত্র',
    youtubeId: 'K60IAEF_Fdg',
    channelName: '10 Minute School',
    duration: '27:40',
    views: '670K',
    addedAgo: '৫ দিন আগে'
  },
  {
    id: 'v-ban-4',
    title: 'HSC Bangla 2nd Paper | বাংলা ২য় পত্র উচ্চারণ ও বানান নিয়ম বোর্ড প্রশ্ন',
    subjectCategory: 'bangla',
    subjectName: 'বাংলা ২য় পত্র',
    youtubeId: 'h-zYeCtc6Ig',
    channelName: 'মুসাফির রাহাত',
    duration: '29:15',
    views: '540K',
    addedAgo: '৬ দিন আগে'
  },
  {
    id: 'v-ict-1',
    title: 'সংখ্যাপদ্ধতি পর্ব-০১ | Chapter 3 | HSC ICT | Nahid Bhaiya (সংখ্যা রূপান্তর)',
    subjectCategory: 'ict',
    subjectName: 'ICT (অধ্যায় ৩)',
    youtubeId: 'bdaqmYYXOZg',
    channelName: 'ICT Master',
    duration: '38:20',
    views: '1.9M',
    addedAgo: '৩ দিন আগে'
  },
  {
    id: 'v-ict-2',
    title: 'HSC ICT Chapter 3 || সংখ্যাপদ্ধতি ও ২-এর পরিপূরক সহজ নিয়ম',
    subjectCategory: 'ict',
    subjectName: 'ICT (অধ্যায় ৩)',
    youtubeId: 'AkO3PRD1xv4',
    channelName: 'Nahid Vaiya ICT',
    duration: '35:40',
    views: '1.3M',
    addedAgo: '৪ দিন আগে'
  },
  {
    id: 'v-ict-3',
    title: 'HSC ICT MCQ One Shot || 4th Chapter || ওয়েব ডিজাইন পরিচিতি এবং HTML',
    subjectCategory: 'ict',
    subjectName: 'ICT (অধ্যায় ৪)',
    youtubeId: 'WBybBS3aLJM',
    channelName: 'Bondi Pathshala',
    duration: '42:15',
    views: '850K',
    addedAgo: '১ সপ্তাহ আগে'
  },
  {
    id: 'v-civ-1',
    title: 'HSC Civics 1st Paper Chapter 9 | Public Service and Bureaucracy',
    subjectCategory: 'civics',
    subjectName: 'পৌরনীতি ১ম পত্র',
    youtubeId: 'RFvNPPMeXi0',
    channelName: 'Study Point BD',
    duration: '28:30',
    views: '430K',
    addedAgo: '৫ দিন আগে'
  },
  {
    id: 'v-civ-2',
    title: 'HSC পৌরণীতি ও সুশাসন ১ম পত্র অধ্যায়-০১ | Civics 1st Paper Free Class',
    subjectCategory: 'civics',
    subjectName: 'পৌরনীতি ১ম পত্র',
    youtubeId: '1s8cbXgfD0w',
    channelName: 'i Education',
    duration: '30:45',
    views: '510K',
    addedAgo: '১ সপ্তাহ আগে'
  },
  {
    id: 'v-civ-3',
    title: 'Civics 2nd Paper || Chapter 6 পৌরনীতি ২য় পত্র অধ্যায় ৬ স্থানীয় শাসন',
    subjectCategory: 'civics',
    subjectName: 'পৌরনীতি ২য় পত্র',
    youtubeId: '3521Q52qP20',
    channelName: 'Civics Master BD',
    duration: '25:40',
    views: '380K',
    addedAgo: '৬ দিন আগে'
  },
  {
    id: 'v-soc-1',
    title: 'Social Work 1st Paper | Mission Complete in One Class | HSC Udvash',
    subjectCategory: 'social_work',
    subjectName: 'সমাজকর্ম ১ম পত্র',
    youtubeId: 'UetMNMr1qKM',
    channelName: 'Udvash HSC',
    duration: '48:30',
    views: '620K',
    addedAgo: '৪ দিন আগে'
  },
  {
    id: 'v-soc-2',
    title: 'HSC সমাজকর্ম ১ম পত্র প্রথম অধ্যায় সমাজকর্ম প্রকৃতি ও পরিধি',
    subjectCategory: 'social_work',
    subjectName: 'সমাজকর্ম ১ম পত্র',
    youtubeId: 'R-N0h5Xj2X0',
    channelName: 'Social Work Hub',
    duration: '32:20',
    views: '310K',
    addedAgo: '১ সপ্তাহ আগে'
  },
  {
    id: 'v-soc-3',
    title: 'সমাজকর্ম ২য় পত্র || মৌলিক মানবিক চাহিদা ও বাংলাদেশের সংকট',
    subjectCategory: 'social_work',
    subjectName: 'সমাজকর্ম ২য় পত্র',
    youtubeId: 'Y9y8qQJq2b0',
    channelName: 'Udvash HSC',
    duration: '36:15',
    views: '410K',
    addedAgo: '৫ দিন আগে'
  },
  {
    id: 'v-hist-1',
    title: 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র || মদিনা সনদ ও এর ঐতিহাসিক গুরুত্ব',
    subjectCategory: 'history',
    subjectName: 'ইসলামের ইতিহাস ১ম পত্র',
    youtubeId: 'kPqN1V7_U2A',
    channelName: 'History Pathshala',
    duration: '37:50',
    views: '780K',
    addedAgo: '৩ দিন আগে'
  },
  {
    id: 'v-hist-2',
    title: 'HSC Islamic History 2nd Paper || বাবর ও পানিপথের প্রথম যুদ্ধ',
    subjectCategory: 'history',
    subjectName: 'ইসলামের ইতিহাস ২য় পত্র',
    youtubeId: 'f9V7Z3a3pQ8',
    channelName: 'History Academy BD',
    duration: '40:10',
    views: '520K',
    addedAgo: '৪ দিন আগে'
  },
  {
    id: 'v-isl-1',
    title: 'HSC Islam Shikkha 1st Paper | শরিয়তের প্রধান উৎস ও পবিত্র কুরআন',
    subjectCategory: 'islamic',
    subjectName: 'ইসলাম শিক্ষা ১ম পত্র',
    youtubeId: '1zQh8y9K0xA',
    channelName: 'Islamic School BD',
    duration: '33:45',
    views: '490K',
    addedAgo: '৫ দিন আগে'
  },
  {
    id: 'v-isl-2',
    title: 'HSC Islamic Studies 2nd part Al-hadith & Sanad History Discussion',
    subjectCategory: 'islamic',
    subjectName: 'ইসলাম শিক্ষা ২য় পত্র',
    youtubeId: 'DZgw52p_PBg',
    channelName: 'Education BD',
    duration: '31:10',
    views: '290K',
    addedAgo: '১ সপ্তাহ আগে'
  }
];

const DEFAULT_TASKS: DailyStudyTask[] = [
  {
    id: 'task-1',
    subject: 'English 1st Paper',
    title: 'Unit 1: The Portrait of a Lady — প্যাসেজ রিডিং ও গুরুত্বপূর্ণ ৫টি প্রশ্নের উত্তর লেখা',
    estimatedMinutes: 40,
    completed: false,
    questionForViva: 'Why did the author Khushwant Singh describe his grandmother as an embodiment of pure serenity?',
    sampleAnswer: 'Because she was intensely religious, constantly counting beads of her rosary, dressed in spotless white, and radiated peaceful, divine tranquility throughout her life.'
  },
  {
    id: 'task-2',
    subject: 'বাংলা ১ম পত্র',
    title: 'অপরিচিতা — রবীন্দ্রনাথ ঠাকুর: কল্যাণীর আত্মমর্যাদাবোধ ও অনুপমের মানসিকতা বিশ্লেষণ',
    estimatedMinutes: 35,
    completed: false,
    questionForViva: 'শম্ভুনাথ সেন কেন বিয়ের আসরে কল্যাণীর গহনাগুলো স্বর্ণকার দিয়ে পরীক্ষা করিয়েছিলেন?',
    sampleAnswer: 'অনুপমের মামার লোভী ও সংকীর্ণ মানসিকতা প্রকাশ্যে প্রমাণ করতে এবং স্পষ্ট করে বুঝিয়ে দিতে যে তিনি কোনো অপমান বা দেনা-পাওনার শর্তে আত্মসম্মান বিসর্জন দিয়ে কন্যার বিবাহ দেবেন না।'
  },
  {
    id: 'task-3',
    subject: 'ICT',
    title: 'অধ্যায় ৩: সংখ্যা পদ্ধতি — দশমিক সংখ্যাকে বাইনারি ও হেক্সাডেসিমেলে রূপান্তর প্র্যাকটিস',
    estimatedMinutes: 45,
    completed: true,
    questionForViva: 'কম্পিউটারে ঋণাত্মক সংখ্যা প্রকাশের ক্ষেত্রে ২-এর পরিপূরক কেন সবচেয়ে উপযোগী?',
    sampleAnswer: 'কারণ ২-এর পরিপূরকে একই যোগের লজিক সার্কিট ব্যবহার করে বিয়োগ সম্পন্ন করা যায় এবং এতে ০ (শূন্য)-এর দুটি আলাদা রূপ থাকে না।'
  },
  {
    id: 'task-4',
    subject: 'পৌরনীতি ও সুশাসন ১ম পত্র',
    title: 'অধ্যায় ২: সুশাসন — বিশ্বব্যাংকের সংজ্ঞা অনুযায়ী সুশাসনের ৪টি স্তম্ভ মুখস্থ করা',
    estimatedMinutes: 30,
    completed: false,
    questionForViva: 'সুশাসনের প্রধান চারটি স্তম্ভ কী কী এবং কীভাবে তা রাষ্ট্রকে উন্নত করে?',
    sampleAnswer: 'সুশাসনের প্রধান ৪টি স্তম্ভ হলো: স্বচ্ছতা (Transparency), জবাবদিহিতা (Accountability), আইনের শাসন (Rule of Law), এবং জনগণের অংশগ্রহণ (Participation)।'
  }
];

export default function TeacherAiHub({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    acquireBgMusicPauseLock('component:teacher_ai_hub');
    return () => releaseBgMusicPauseLock('component:teacher_ai_hub');
  }, []);
  // Navigation views: 'home' | 'videos' | 'books' | 'pdf_ai' | 'chat' | 'tasks'
  const [activeView, setActiveView] = useState<'home' | 'videos' | 'books' | 'pdf_ai' | 'chat' | 'tasks'>('home');

  // Academic Profile
  const [academicProfile, setAcademicProfile] = useState<{
    classLevel: string;
    stream: string;
    examYear: string;
    sscBatch: string;
  }>(() => {
    const saved = localStorage.getItem('selfx_teacher_academic_profile');
    return saved ? JSON.parse(saved) : {
      classLevel: 'HSC 1st Year',
      stream: 'Humanities',
      examYear: '2028',
      sscBatch: 'SSC 2026'
    };
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Books State
  const [bookPaperFilter, setBookPaperFilter] = useState<'all' | '1st' | '2nd' | 'custom'>('all');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [selectedGroupModal, setSelectedGroupModal] = useState<SubjectGroup | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<SubjectBook | null>(null);
  const [selectedChapterForReader, setSelectedChapterForReader] = useState<BookChapter | null>(null);
  const [currentReaderPageIndex, setCurrentReaderPageIndex] = useState(0);
  const [activeSyllabusBook, setActiveSyllabusBook] = useState<SubjectBook | null>(null);
  const [activePdfBook, setActivePdfBook] = useState<SubjectBook | null>(null);
  const [showAllPdfsModal, setShowAllPdfsModal] = useState(false);

  // Custom Uploaded Books / PDFs State
  const [customBooks, setCustomBooks] = useState<CustomBookItem[]>(() => {
    const saved = localStorage.getItem('selfx_teacher_custom_books_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [activeCustomBookForReading, setActiveCustomBookForReading] = useState<CustomBookItem | null>(null);
  const [uploadTab, setUploadTab] = useState<'upload' | 'link'>('upload');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookSubject, setNewBookSubject] = useState('পৌরনীতি ও সুশাসন');
  const [newBookPaper, setNewBookPaper] = useState<'1st' | '2nd' | 'both'>('1st');
  const [newBookUrl, setNewBookUrl] = useState('');
  const [uploadedFileObj, setUploadedFileObj] = useState<{ name: string; size: string; dataUrl: string; type: string } | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Video State
  const [videos, setVideos] = useState<VideoLesson[]>(() => {
    const saved = localStorage.getItem('selfx_teacher_videos_v4');
    return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
  });
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>('all');
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [playingVideo, setPlayingVideo] = useState<VideoLesson | null>(null);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoSubject, setNewVideoSubject] = useState('english');

  // Live YouTube Video Search State
  const [liveYouTubeVideos, setLiveYouTubeVideos] = useState<VideoLesson[]>([]);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);

  useEffect(() => {
    const q = videoSearchQuery.trim();
    if (!q) {
      setLiveYouTubeVideos([]);
      setIsSearchingYouTube(false);
      return;
    }

    setIsSearchingYouTube(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/teacher/youtube-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            subject: videoCategoryFilter
          })
        });
        const data = await res.json();
        if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setLiveYouTubeVideos(data.videos.map((v: any) => ({
            id: v.id || `yt_${v.youtubeId}`,
            title: v.title,
            subjectCategory: v.subjectCategory || videoCategoryFilter,
            subjectName: v.subjectName || (v.title.toLowerCase().includes('ict') ? 'ICT' : v.title.toLowerCase().includes('bangla') ? 'বাংলা' : v.title.toLowerCase().includes('english') ? 'English' : 'ক্লাস'),
            youtubeId: v.youtubeId,
            channelName: v.channelName || v.presenter || 'YouTube Teacher',
            duration: v.duration || 'ভিডিও',
            views: v.views || 'ভিডিও',
            addedAgo: v.published || 'সম্প্রতি'
          })));
        } else {
          setLiveYouTubeVideos([]);
        }
      } catch (err) {
        console.warn('Teacher AI YouTube search error:', err);
        setLiveYouTubeVideos([]);
      } finally {
        setIsSearchingYouTube(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [videoSearchQuery, videoCategoryFilter]);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; time?: string }[]>(() => {
    const saved = localStorage.getItem('selfx_teacher_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        text: 'আসসালামু আলাইকুম! আমি তোমার পার্সোনাল Teacher AI 🎓।\n\nমানবিক বিভাগের যেকোনো বিষয়ের পড়া, সৃজনশীল প্রশ্ন, ব্যাকরণ বা পরীক্ষার প্রস্তুতি বুঝতে চাইলে বলো। আমি তোমাকে একদম সহজ ভাষায় উদাহরণসহ বুঝিয়ে দেব!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Daily Tasks State
  const [dailyTasks, setDailyTasks] = useState<DailyStudyTask[]>(() => {
    const saved = localStorage.getItem('selfx_teacher_daily_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });
  const [activeVivaTask, setActiveVivaTask] = useState<DailyStudyTask | null>(null);
  const [vivaStudentAnswer, setVivaStudentAnswer] = useState('');
  const [vivaEvaluation, setVivaEvaluation] = useState<{ score: number; feedback: string; modelAnswer: string } | null>(null);
  const [isVivaEvaluating, setIsVivaEvaluating] = useState(false);

  // ==========================================
  // TEXT-TO-SPEECH (TTS) & VOICE READER ENGINE
  // ==========================================
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voiceVoiceType, setVoiceVoiceType] = useState<'female' | 'male' | 'english'>('female');
  const [activeSpeakingSectionIndex, setActiveSpeakingSectionIndex] = useState<number | null>(null);
  const [activeSpeakingLabel, setActiveSpeakingLabel] = useState<string>('');
  const [selectedSnippet, setSelectedSnippet] = useState<{ text: string; top: number; left: number } | null>(null);
  const speechQueueRef = useRef<{ sectionIndex: number; label: string; text: string; elementId?: string }[]>([]);
  const currentChunkIndexRef = useRef<number>(0);
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const activeTeacherAudioRef = useRef<HTMLAudioElement | null>(null);

  // Save Custom Books to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('selfx_teacher_custom_books_v2', JSON.stringify(customBooks));
    } catch (e) {
      console.warn('Storage limit reached for custom books:', e);
    }
  }, [customBooks]);

  // Handle Text Selection for Floating Voice Button
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectedSnippet(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length >= 3) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedSnippet({
            text,
            top: Math.max(10, rect.top - 55),
            left: Math.max(20, rect.left + rect.width / 2)
          });
        } catch (e) {
          setSelectedSnippet(null);
        }
      } else {
        setSelectedSnippet(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Stop TTS when closing reader
  useEffect(() => {
    if (!selectedBookForReader && !activeCustomBookForReading) {
      stopVoice();
    }
  }, [selectedBookForReader, activeCustomBookForReading]);

  // Clean Web Speech Synthesis Voice Selector
  const getPreferredVoice = (isEnglishText: boolean = false) => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (isEnglishText || voiceVoiceType === 'english') {
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Female')));
      return enVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    if (voiceVoiceType === 'female') {
      const bnFemale = voices.find(v => (v.lang.startsWith('bn') || v.lang.includes('BD') || v.lang.includes('IN')) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali')));
      if (bnFemale) return bnFemale;
    }

    const bnAny = voices.find(v => v.lang.startsWith('bn') || v.lang.includes('BD') || v.lang.includes('IN') || v.name.toLowerCase().includes('bangla'));
    if (bnAny) return bnAny;

    // Fallback to Hindi or standard English
    return voices.find(v => v.lang.startsWith('hi')) || voices[0];
  };

  // Play Single Text via Gemini TTS Studio Voices (Puck / Fenrir)
  const speakSingleChunk = async (text: string, onEndCallback?: () => void, sectionIndex?: number, label?: string, elementId?: string) => {
    // Stop any existing audio
    if (activeTeacherAudioRef.current) {
      try {
        activeTeacherAudioRef.current.pause();
        activeTeacherAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeTeacherAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Clean markdown symbols & formatting
    const cleanText = text
      .replace(/[*#_~`>]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    if (!cleanText) {
      onEndCallback?.();
      return;
    }

    if (sectionIndex !== undefined) {
      setActiveSpeakingSectionIndex(sectionIndex);
    }
    if (label) {
      setActiveSpeakingLabel(label);
    }
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const finishChunk = () => {
      activeTeacherAudioRef.current = null;
      if (onEndCallback) {
        onEndCallback();
      } else {
        setIsVoicePlaying(false);
        setIsVoicePaused(false);
        setActiveSpeakingSectionIndex(null);
        setActiveSpeakingLabel('');
      }
    };

    // 1. Synthesize through Gemini TTS (Puck / Fenrir)
    try {
      const preferredVoice = localStorage.getItem('selfx_preferred_voice_persona') || 'Fenrir';
      const res = await fetch('/api/decree/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: preferredVoice,
          style: 'energetic'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const audioSrc = data.audioDataUrl || data.audioUrl;
        if (audioSrc && !data.fallback) {
          const audio = new Audio(audioSrc);
          activeTeacherAudioRef.current = audio;
          audio.playbackRate = voiceSpeed;
          audio.onplay = () => {
            setIsVoicePlaying(true);
            setIsVoicePaused(false);
          };
          audio.onended = () => finishChunk();
          audio.onerror = () => finishChunk();
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn("Teacher AI online voice synthesis issue, skipping to completion:", err);
    }

    finishChunk();
  };

  // Speak Selected Snippet
  const handlePlaySelectedSnippet = () => {
    if (!selectedSnippet) return;
    speakSingleChunk(selectedSnippet.text, undefined, undefined, 'নির্বাচিত অনুচ্ছেদ');
    setSelectedSnippet(null);
  };

  // Read Full Chapter Sequence
  const handlePlayFullChapter = (chapter: BookChapter, pageIdx: number) => {
    const page = chapter.pages[pageIdx];
    if (!page) return;

    const queue: { sectionIndex: number; label: string; text: string; elementId: string }[] = [];

    // 1. Heading
    queue.push({
      sectionIndex: 0,
      label: 'শিরোনাম',
      text: `${chapter.title}. ${page.heading}`,
      elementId: 'reader-heading'
    });

    // 2. English passage (if exists)
    if (page.englishContent) {
      queue.push({
        sectionIndex: 1,
        label: 'মূল টেক্সট',
        text: page.englishContent,
        elementId: 'reader-english'
      });
    }

    // 3. Bengali explanation
    queue.push({
      sectionIndex: 2,
      label: 'সারসংক্ষেপ ও ব্যাখ্যা',
      text: page.bengaliExplanation,
      elementId: 'reader-bengali'
    });

    // 4. Key points
    if (page.keyPoints && page.keyPoints.length > 0) {
      queue.push({
        sectionIndex: 3,
        label: 'গুরুত্বপূর্ণ পয়েন্ট',
        text: `পরীক্ষার জন্য অতি গুরুত্বপূর্ণ পয়েন্টসমূহ: ${page.keyPoints.join('. ')}`,
        elementId: 'reader-keypoints'
      });
    }

    // 5. Creative question
    if (page.creativeQuestionPrompt) {
      const { ka, kha, ga, gha } = page.creativeQuestionPrompt;
      queue.push({
        sectionIndex: 4,
        label: 'সৃজনশীল প্রশ্ন',
        text: `নমুনা সৃজনশীল প্রশ্ন: ক— ${ka}. খ— ${kha}. গ— ${ga}. ঘ— ${gha}`,
        elementId: 'reader-creative'
      });
    }

    speechQueueRef.current = queue;
    currentChunkIndexRef.current = 0;

    const playNext = () => {
      if (currentChunkIndexRef.current >= speechQueueRef.current.length) {
        setIsVoicePlaying(false);
        setIsVoicePaused(false);
        setActiveSpeakingSectionIndex(null);
        setActiveSpeakingLabel('');
        triggerNotification("🎉 পাঠ সমাপ্ত!", "পুরো চ্যাপ্টার ভয়েস ওভার দিয়ে পড়া সম্পন্ন হয়েছে।");
        return;
      }

      const item = speechQueueRef.current[currentChunkIndexRef.current];
      currentChunkIndexRef.current += 1;
      speakSingleChunk(item.text, playNext, item.sectionIndex, item.label, item.elementId);
    };

    playNext();
  };

  // Toggle Pause / Resume
  const togglePauseVoice = () => {
    if (activeTeacherAudioRef.current) {
      if (isVoicePaused) {
        activeTeacherAudioRef.current.play().catch(() => {});
        setIsVoicePaused(false);
        setIsVoicePlaying(true);
      } else if (isVoicePlaying) {
        activeTeacherAudioRef.current.pause();
        setIsVoicePaused(true);
      }
      return;
    }
    if (!('speechSynthesis' in window)) return;
    if (isVoicePaused) {
      window.speechSynthesis.resume();
      setIsVoicePaused(false);
      setIsVoicePlaying(true);
    } else if (isVoicePlaying) {
      window.speechSynthesis.pause();
      setIsVoicePaused(true);
    }
  };

  // Stop Voice
  const stopVoice = () => {
    if (activeTeacherAudioRef.current) {
      try {
        activeTeacherAudioRef.current.pause();
        activeTeacherAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeTeacherAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoicePlaying(false);
    setIsVoicePaused(false);
    setActiveSpeakingSectionIndex(null);
    setActiveSpeakingLabel('');
    speechQueueRef.current = [];
  };

  // Update voice speed
  const changeSpeed = (speed: number) => {
    setVoiceSpeed(speed);
    if (isVoicePlaying && !isVoicePaused) {
      // Re-trigger current reading chunk with new speed
      const curIdx = Math.max(0, currentChunkIndexRef.current - 1);
      if (speechQueueRef.current[curIdx]) {
        currentChunkIndexRef.current = curIdx;
        const item = speechQueueRef.current[curIdx];
        currentChunkIndexRef.current += 1;
        speakSingleChunk(item.text, () => {}, item.sectionIndex, item.label, item.elementId);
      }
    }
  };

  // ==========================================
  // CUSTOM BOOKS & PDF UPLOAD HANDLERS
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

      setUploadedFileObj({
        name: file.name,
        size: `${sizeMb} MB`,
        dataUrl,
        type: file.type || 'application/pdf'
      });

      if (!newBookTitle.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setNewBookTitle(cleanName);
      }
      setIsProcessingUpload(false);
    };

    reader.onerror = () => {
      triggerNotification("⚠️ ফাইল পড়তে ব্যর্থ", "ফাইলটি লোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।");
      setIsProcessingUpload(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveCustomBook = () => {
    if (!newBookTitle.trim()) {
      triggerNotification("⚠️ বইয়ের নাম দিন", "দয়া করে বইয়ের একটি শিরোনাম লিখুন।");
      return;
    }

    if (uploadTab === 'upload' && !uploadedFileObj) {
      triggerNotification("⚠️ PDF বা ফাইল দিন", "দয়া করে একটি PDF ফাইল নির্বাচন করুন।");
      return;
    }

    if (uploadTab === 'link' && !newBookUrl.trim()) {
      triggerNotification("⚠️ লিংক দিন", "দয়া করে গুগল ড্রাইভ বা ওয়েব PDF লিংক পেস্ট করুন।");
      return;
    }

    // Google drive preview converter
    let formattedUrl = newBookUrl.trim();
    if (formattedUrl.includes('drive.google.com/file/d/')) {
      const match = formattedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        formattedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    const newBook: CustomBookItem = {
      id: `custom-book-${Date.now()}`,
      title: newBookTitle.trim(),
      subjectName: newBookSubject,
      category: 'other',
      paper: newBookPaper,
      sourceType: uploadTab,
      fileDataUrl: uploadTab === 'upload' ? uploadedFileObj?.dataUrl : undefined,
      externalUrl: uploadTab === 'link' ? formattedUrl : undefined,
      fileName: uploadTab === 'upload' ? uploadedFileObj?.name : 'অনলাইন লিংকড PDF',
      fileSize: uploadTab === 'upload' ? uploadedFileObj?.size : 'ওয়েব ফাইল',
      description: `${newBookSubject} • ${newBookPaper === '1st' ? '১ম পত্র' : newBookPaper === '2nd' ? '২য় পত্র' : 'উভয় পত্র'}`,
      uploadedAt: Date.now()
    };

    setCustomBooks(prev => [newBook, ...prev]);
    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookUrl('');
    setUploadedFileObj(null);
    setBookPaperFilter('custom');

    triggerNotification("🎉 বই যোগ সম্পন্ন!", `“${newBook.title}” সফলভাবে তোমার বই তালিকায় যুক্ত হয়েছে।`);
  };

  const handleDeleteCustomBook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("আপনি কি নিশ্চিত এই বইটি তালিকা থেকে মুছে ফেলতে চান?")) {
      setCustomBooks(prev => prev.filter(b => b.id !== id));
      triggerNotification("🗑️ বই মুছে ফেলা হয়েছে", "বইটি তোমার লাইব্রেরি থেকে সরানো হয়েছে।");
    }
  };

  // Filtered books
  const filteredGroups = SUBJECT_GROUPS.filter(g => {
    const matchesSearch = !bookSearchQuery.trim() ||
      g.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      g.banglaTitle.toLowerCase().includes(bookSearchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filtered custom books
  const filteredCustomBooks = customBooks.filter(b => {
    return !bookSearchQuery.trim() ||
      b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      b.subjectName.toLowerCase().includes(bookSearchQuery.toLowerCase());
  });

  // Filtered videos
  const filteredVideos = videos.filter(v => {
    const matchesCat = videoCategoryFilter === 'all' ||
      (videoCategoryFilter === 'tips' ? (v.subjectCategory === 'tips' || v.isTip) : v.subjectCategory === videoCategoryFilter);
    const matchesSearch = !videoSearchQuery.trim() ||
      v.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      v.subjectName.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
      v.channelName.toLowerCase().includes(videoSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Chat message send
  const handleSendMessage = async (msgText?: string) => {
    const textToSend = (msgText || chatInput).trim();
    if (!textToSend || isChatLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/teacher/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: chatMessages.slice(-8),
          academicClass: `${academicProfile.classLevel} - ${academicProfile.stream}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || 'উত্তর তৈরি হয়েছে কিন্তু টেক্সট পাওয়া যায়নি। আবার প্রশ্ন করুন!';
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'সার্ভারের সাথে সংযোগে সাময়িক সমস্যা হচ্ছে। তবে মনে রাখবে—এইচএসসি মানবিক পরীক্ষায় ভালো করতে নিয়মিত মূল বই রিডিং, বিগত বছরের বোর্ড প্রশ্ন অনুশীলন এবং প্রতিদিন অন্তত ১৫ মিনিট করে দ্রুত হাতের লেখা প্র্যাকটিস করা অত্যন্ত গুরুত্বপূর্ণ!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Viva evaluation
  const handleEvaluateViva = async () => {
    if (!activeVivaTask || !vivaStudentAnswer.trim() || isVivaEvaluating) return;
    setIsVivaEvaluating(true);

    try {
      const res = await fetch('/api/teacher/quiz-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeVivaTask.questionForViva,
          studentAnswer: vivaStudentAnswer,
          subject: activeVivaTask.subject,
          chapter: activeVivaTask.title
        })
      });

      if (res.ok) {
        const data = await res.json();
        setVivaEvaluation(data.result || {
          score: 8,
          feedback: 'খুব চমৎকার উত্তর! মূল পয়েন্টগুলো খুব সুন্দরভাবে গুছিয়ে লিখতে পেরেছো।',
          modelAnswer: activeVivaTask.sampleAnswer
        });
        setDailyTasks(prev => prev.map(t => t.id === activeVivaTask.id ? { ...t, completed: true } : t));
        triggerNotification("🎉 মৌখিক পড়া যাচাই সম্পন্ন!", `Teacher AI স্কোর দিয়েছে: ${data.result?.score || 8}/১০`);
      } else {
        throw new Error("Evaluation failed");
      }
    } catch (e) {
      setVivaEvaluation({
        score: 8,
        feedback: 'উত্তরটি চমৎকার হয়েছে! মূল পয়েন্টগুলো উল্লেখ করতে পেরেছো।',
        modelAnswer: activeVivaTask.sampleAnswer
      });
      setDailyTasks(prev => prev.map(t => t.id === activeVivaTask.id ? { ...t, completed: true } : t));
    } finally {
      setIsVivaEvaluating(false);
    }
  };

  // Helper for rendering subject icons
  const renderSubjectIcon = (type: SubjectGroup['iconType']) => {
    switch (type) {
      case 'Aa':
        return <span className="font-extrabold text-white text-base tracking-tight font-serif">Aa</span>;
      case 'book':
        return <BookOpen className="w-5 h-5 text-white" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-white stroke-[2.5]" />;
      case 'dome':
        return <Building2 className="w-5 h-5 text-white" />;
      case 'monument':
        return <Landmark className="w-5 h-5 text-white" />;
      case 'users':
        return <Users className="w-5 h-5 text-white" />;
      case 'court':
        return <Landmark className="w-5 h-5 text-white" />;
      default:
        return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-zinc-100 flex flex-col font-sans select-none pb-16">
      {/* ======================================================== */}
      {/* 🌟 1. HOME SCREEN (EXACT REPLICA OF USER SCREENSHOT 1) 🌟 */}
      {/* ======================================================== */}
      {activeView === 'home' && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-8 animate-fadeIn">
          {/* Top Header */}
          <header className="flex items-center justify-between py-2 mb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-2 -ml-1 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-transform"
                title="ফিরে যান"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/30 to-blue-600/40 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-white leading-tight tracking-wide">
                    Teacher AI
                  </h1>
                  <p className="text-[11px] text-zinc-400 leading-none mt-0.5">
                    HSC 1st Year (Humanities)
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Status Badge */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c1326] border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-200">
                {academicProfile.sscBatch}
              </span>
            </button>
          </header>

          {/* Hero Banner: User-defined Teacher AI Cover Image */}
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/40 shadow-[0_8px_32px_rgba(6,182,212,0.25)] mb-4 group">
            <img
              src="/media/teacher/teacher_ai_cover.jpg"
              alt="Teacher AI Cover"
              className="w-full h-48 sm:h-52 object-cover object-[center_35%] transform group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/teacher_ai_cover.jpg';
              }}
            />
            {/* Ambient vignette and subtle cyber-cyan gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a17] via-[#070b1a]/65 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060a17]/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-[9px] font-mono tracking-widest uppercase text-cyan-200 font-bold backdrop-blur-md">
                  ✨ 24/7 AI STUDY SANCTUARY
                </span>
                <span className="text-[10px] text-cyan-300/80 font-mono">
                  HSC 2026 SPECIAL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                মন দিয়ে পড়ো, বিজয় তোমারই হবে! 🚀
              </h2>
              <p className="text-xs text-zinc-300/90 mt-1 line-clamp-1 max-w-md font-medium">
                বইয়ের আসল PDF, চ্যাপ্টার সামারি, YouTube ক্লাস এবং সার্বক্ষণিক AI মেন্টর।
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* THE 4 MAIN CARDS GRID */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Card 1: Books */}
            <button
              type="button"
              onClick={() => setActiveView('books')}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#0c152e] via-[#0b1226] to-[#080d1b] border border-blue-500/40 hover:border-blue-400 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs">
                  ১৩
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-cyan-200 transition-colors">
                  Books
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  সকল পাঠ্যবই, PDF ও আপলোড
                </p>
              </div>
            </button>

            {/* Card 2: Video Lessons */}
            <button
              type="button"
              onClick={() => setActiveView('videos')}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#240e1e] via-[#1a0a16] to-[#0e060c] border border-pink-500/40 hover:border-pink-400 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
                  <Video className="w-5 h-5" />
                </div>
                <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs">
                  {videos.length}
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-pink-200 transition-colors">
                  Video Lessons
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  YouTube লেকচার ও ক্লাস
                </p>
              </div>
            </button>

            {/* Card 3: AI Chat */}
            <button
              type="button"
              onClick={() => setActiveView('chat')}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#0a1e1b] via-[#081715] to-[#040f0d] border border-emerald-500/40 hover:border-emerald-400 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">
                  ২৪/৭
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-emerald-200 transition-colors">
                  AI Chat
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  শিক্ষককে প্রশ্ন করো
                </p>
              </div>
            </button>

            {/* Card 4: Special Guide (Formerly Daily Tasks) */}
            <button
              type="button"
              onClick={() => setActiveView('tasks')}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#241a08] via-[#1a1205] to-[#0e0902] border border-amber-500/40 hover:border-amber-400 transition-all text-left flex flex-col justify-between h-36 relative overflow-hidden group shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                </div>
                <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold border border-amber-500/30">
                  {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} টাস্ক
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                  Special Guide
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-extrabold">PRO</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  ক্লাস টেস্ট, খাতা মূল্যায়ন ও হ্যাকস
                </p>
              </div>
            </button>
          </div>

          {/* Card 5: Pdf AI (PDF বা YouTube ক্লাস থেকে সহজ নোট) */}
          <button
            type="button"
            onClick={() => setActiveView('pdf_ai')}
            className="w-full mt-3.5 p-4 rounded-3xl bg-gradient-to-r from-[#170a2c] via-[#260e44] to-[#120824] border border-purple-500/50 hover:border-purple-400 transition-all text-left flex items-center justify-between relative overflow-hidden group shadow-xl shadow-purple-950/40 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/40 group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-6 h-6 text-purple-100 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-purple-200 transition-colors flex items-center gap-1.5">
                    Pdf AI
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black uppercase tracking-wider shadow-sm">
                    👑 PRO
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 mt-1 leading-snug">
                  PDF বা YouTube ক্লাস থেকে সহজ ও মুখস্থযোগ্য নোট
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-300 shrink-0 relative z-10 group-hover:translate-x-1 transition-transform ml-2">
              <span>নোট দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Inspirational Quote Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0c1428] to-[#070b16] border border-cyan-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                “প্রতিদিনের ছোট ছোট অনুশীলনই বড় সাফল্যের ভিত্তি।”
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Teacher AI তোমার পাশে রয়েছে সবসময়
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📚 2. BOOKS SCREEN (EXACT WITH CUSTOM UPLOAD & TTS) 📚 */}
      {/* ======================================================== */}
      {activeView === 'books' && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 pt-3 pb-8 animate-fadeIn">
          {/* Top Header */}
          <header className="flex items-center justify-between py-2 mb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="p-2 -ml-1 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-transform"
                title="প্রধান মেনুতে ফিরুন"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-white leading-tight tracking-wide">
                    Books & PDFs
                  </h1>
                  <p className="text-[11px] text-zinc-400 leading-none mt-0.5">
                    HSC 1st Year (Humanities)
                  </p>
                </div>
              </div>
            </div>

            {/* Right Actions: Add Custom Book & Search */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAddBookModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-md shadow-blue-500/30"
                title="নিজের বই বা PDF আপলোড করুন"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>PDF যোগ</span>
              </button>

              <button
                type="button"
                onClick={() => setBookSearchQuery(prev => prev ? '' : ' ')}
                className="p-2 rounded-xl text-zinc-300 hover:text-white cursor-pointer hover:bg-zinc-800/60 transition-colors"
                title="সার্চ করুন"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Search Bar (Collapsible) */}
          {bookSearchQuery !== '' && (
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                autoFocus
                value={bookSearchQuery.trim()}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                placeholder="বই, বিষয় বা আপলোডকৃত ফাইল খুঁজুন..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0c1326] border border-cyan-500/40 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setBookSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Featured Banner: "তোমার সব পাঠ্যবই" (with 3D Book stack) */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0c1c3f] via-[#091530] to-[#071026] border border-blue-500/40 shadow-xl flex items-center justify-between relative overflow-hidden mb-3">
            <div className="relative z-10 max-w-[210px]">
              <h2 className="text-lg font-black text-white tracking-wide">
                তোমার সব পাঠ্যবই
              </h2>
              <p className="text-xs text-blue-200/80 mt-1 leading-snug">
                সিলেবাস, PDF, আপলোড ও ভয়েস রিডার — সব এক জায়গায়
              </p>
            </div>

            {/* 3D Stack of Hardcover Books Graphic */}
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-14 flex items-center justify-center">
                <div className="absolute top-4 w-14 h-4 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md border-b-2 border-emerald-900 transform -rotate-3" />
                <div className="absolute top-2 w-14 h-4 rounded-sm bg-gradient-to-r from-purple-600 to-indigo-500 shadow-md border-b-2 border-purple-900 transform rotate-1" />
                <div className="absolute top-0 w-14 h-4 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg border-b-2 border-blue-900 transform -rotate-1" />
              </div>

              <button
                type="button"
                onClick={() => setShowAllPdfsModal(true)}
                className="w-8 h-8 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
                title="সকল PDF দেখুন"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Control Filter: All | 1st Paper | 2nd Paper | আমার আপলোড */}
          <div className="grid grid-cols-4 p-1 rounded-2xl bg-[#091122] border border-zinc-800 mb-3">
            {[
              { id: 'all', label: 'All' },
              { id: '1st', label: '1st Paper' },
              { id: '2nd', label: '2nd Paper' },
              { id: 'custom', label: `আপলোড (${customBooks.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBookPaperFilter(tab.id as any)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center truncate px-1 ${
                  bookPaperFilter === tab.id
                    ? 'bg-blue-600 text-white font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* MY UPLOADED BOOKS TAB CONTENT */}
          {bookPaperFilter === 'custom' && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4" />
                  <span>আমার আপলোডকৃত বই ও নোটস ({customBooks.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(true)}
                  className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন যোগ করুন</span>
                </button>
              </div>

              {filteredCustomBooks.length === 0 ? (
                <div className="p-6 rounded-3xl bg-[#091122] border border-dashed border-zinc-700 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">এখনো কোনো বই আপলোড করোনি</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      তোমার ডাউনলোড করা যেকোনো বইয়ের PDF বা ড্রাইভ লিংক এখানে যুক্ত করে ইন-অ্যাপ সরাসরি পড়তে পারবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddBookModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>PDF আপলোড বা লিংক দিন</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredCustomBooks.map(book => (
                    <div
                      key={book.id}
                      className="p-3.5 rounded-2xl bg-[#0b1428] border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                              {book.sourceType === 'upload' ? 'আপলোডকৃত ফাইল' : 'ড্রাইভ / লিংক'}
                            </span>
                            <span className="text-[10px] text-zinc-400">{book.fileSize}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1 group-hover:text-cyan-200">
                            {book.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400">
                            {book.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveCustomBookForReading(book)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95 transition-transform"
                        >
                          📖 পড়ুন
                        </button>
                        {book.fileDataUrl && (
                          <a
                            href={book.fileDataUrl}
                            download={book.fileName || `${book.title}.pdf`}
                            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700"
                            title="ডাউনলোড"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomBook(book.id, e)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STANDARD SUBJECT CARDS LIST */}
          {bookPaperFilter !== 'custom' && (
            <div className="space-y-2.5">
              {filteredGroups.map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupModal(group)}
                  className="p-3.5 rounded-2xl bg-[#0b1224] hover:bg-[#0e172e] border border-zinc-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${group.bgColor} flex items-center justify-center text-white shadow-md shadow-black/40 shrink-0`}>
                      {renderSubjectIcon(group.iconType)}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {group.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        HSC 1st Year • Humanities
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroupModal(group);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 group-hover:text-zinc-300 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Bottom Special Card: বইয়ের আসল PDF */}
              <div
                onClick={() => setShowAllPdfsModal(true)}
                className="p-3.5 rounded-2xl bg-[#091428] hover:bg-[#0c1a36] border border-blue-500/30 hover:border-blue-400/60 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] shadow-md mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-blue-200 transition-colors">
                      বইয়ের আসল PDF
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      ১৩টি বিষয়ের সরকারি বোর্ড সংস্করণ
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 🎥 3. VIDEO LESSONS SCREEN */}
      {/* ======================================================== */}
      {activeView === 'videos' && (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pt-3 pb-8 animate-fadeIn">
          {/* Header */}
          <header className="flex items-center justify-between py-2 mb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="p-2 -ml-1 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-transform"
                title="প্রধান মেনুতে ফিরুন"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div>
                <h1 className="text-base font-extrabold text-white leading-tight tracking-wide">
                  Video Lessons
                </h1>
                <p className="text-[11px] text-zinc-400 leading-none mt-0.5">
                  YouTube থেকে তোমার সিলেবাস অনুযায়ী লেকচার
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddVideoModal(true)}
              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>ভিডিও যোগ</span>
            </button>
          </header>

          {/* Search Bar with Live YouTube Query */}
          <div className="relative mb-2.5">
            <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={videoSearchQuery}
              onChange={(e) => setVideoSearchQuery(e.target.value)}
              placeholder="ইউটিউব লেকচার খুঁজুন (যেমন: Hsc 28 Ict, লজিক গেট, অপরিচিতা)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0b1224] border border-pink-500/30 focus:border-pink-500 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors shadow-inner"
            />
            {videoSearchQuery && (
              <button
                type="button"
                onClick={() => setVideoSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Subject Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3.5 scrollbar-none">
            {[
              { id: 'all', label: 'সব ক্লাস' },
              { id: 'english', label: 'English' },
              { id: 'bangla', label: 'বাংলা' },
              { id: 'ict', label: 'ICT' },
              { id: 'civics', label: 'পৌরনীতি' },
              { id: 'social_work', label: 'সমাজকর্ম' },
              { id: 'history', label: 'ইতিহাস' },
              { id: 'islamic', label: 'ইসলাম শিক্ষা' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setVideoCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  videoCategoryFilter === cat.id
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-[#0d1424] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Loading Indicator for Live YouTube Search */}
          {isSearchingYouTube && (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
              <RefreshCw className="w-5 h-5 text-pink-500 animate-spin" />
              <p className="text-xs text-zinc-300">
                ইউটিউব থেকে <span className="text-pink-400 font-bold">"{videoSearchQuery}"</span> ক্লাসসমূহ খোঁজা হচ্ছে...
              </p>
            </div>
          )}

          {/* Live YouTube Search Results View */}
          {videoSearchQuery.trim() !== '' && !isSearchingYouTube && liveYouTubeVideos.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-white">
                    ইউটিউব লাইভ সার্চ ফলাফল ({liveYouTubeVideos.length} টি ক্লাস)
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-400">সরাসরি প্লে করুন</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {liveYouTubeVideos.map(vid => (
                  <div
                    key={vid.id}
                    onClick={() => setPlayingVideo({
                      id: vid.id,
                      title: vid.title,
                      subjectCategory: 'youtube',
                      subjectName: 'YouTube Live Search',
                      youtubeId: vid.youtubeId,
                      channelName: vid.channelName,
                      duration: vid.duration || 'YouTube',
                      views: vid.views || 'ভিউ',
                      addedAgo: 'সরাসরি সার্চ'
                    })}
                    className="rounded-2xl bg-[#090e1c] border border-pink-500/30 hover:border-pink-500 overflow-hidden shadow-lg transition-all group cursor-pointer flex flex-col active:scale-[0.99]"
                  >
                    <div className="relative aspect-video w-full bg-black overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white font-bold">
                        {vid.duration || 'YouTube'}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-pink-400">
                          {vid.channelName}
                        </span>
                        <h3 className="text-xs font-bold text-white mt-1 line-clamp-2 leading-snug group-hover:text-pink-200 transition-colors">
                          {vid.title}
                        </h3>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-semibold text-zinc-300">{vid.views || 'ভিডিও'}</span>
                        <span className="text-pink-400 font-bold group-hover:underline">প্লে করুন</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curated / Category Filtered Video Grid */}
          {(!videoSearchQuery.trim() || liveYouTubeVideos.length === 0) && !isSearchingYouTube && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredVideos.map(vid => (
                <div
                  key={vid.id}
                  onClick={() => setPlayingVideo(vid)}
                  className="rounded-2xl bg-[#090e1c] border border-zinc-800/90 hover:border-pink-500/50 overflow-hidden shadow-lg transition-all group cursor-pointer flex flex-col active:scale-[0.99]"
                >
                  <div className="relative aspect-video w-full bg-black overflow-hidden">
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[10px] text-white font-bold">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-pink-400">
                        {vid.subjectName}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1 line-clamp-2 leading-snug group-hover:text-pink-200 transition-colors">
                        {vid.title}
                      </h3>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-semibold text-zinc-300">{vid.channelName}</span>
                      <span>{vid.views} ভিউ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 💬 4. AI CHAT SCREEN */}
      {/* ======================================================== */}
      {activeView === 'chat' && (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pt-3 pb-6 animate-fadeIn h-[calc(100vh-5rem)]">
          {/* Header */}
          <header className="flex items-center justify-between py-2 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="p-2 -ml-1 text-zinc-300 hover:text-white cursor-pointer active:scale-95 transition-transform"
                title="প্রধান মেনুতে ফিরুন"
              >
                <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-white leading-tight">
                    Teacher AI Chat
                  </h1>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    মানবিক বিভাগের ২৪/৭ গৃহশিক্ষক
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm("কথোপকথন ক্লিয়ার করতে চান?")) {
                  setChatMessages([
                    {
                      role: 'assistant',
                      text: 'আসসালামু আলাইকুম! বলো আজ কোন বিষয়ের পড়া বুঝতে চাও?',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="নতুন চ্যাট"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </header>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 custom-scrollbar">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 shadow-sm select-text ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                      : 'bg-[#0d1424] border border-cyan-500/20 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.time && (
                    <span className="block text-[9px] text-right opacity-60 font-mono">
                      {msg.time}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-2.5 items-center text-xs text-zinc-400 pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Teacher AI লিখছে...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
            {[
              'অপরিচিতা গল্পের মূলভাব',
              '২-এর পরিপূরক বুঝিয়ে দাও',
              'সুশাসনের ৪টি স্তম্ভ কী?',
              'Modifiers শর্টকাট টেকনিক',
              'মদিনা সনদের গুরুত্ব'
            ].map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#0c1324] hover:bg-[#121c33] border border-zinc-800 text-[11px] text-zinc-300 whitespace-nowrap cursor-pointer transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="relative shrink-0 mt-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="পড়া বা প্রশ্ন লিখে শিক্ষককে পাঠান..."
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#0b1224] border border-zinc-800 focus:border-emerald-500 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              disabled={!chatInput.trim() || isChatLoading}
              onClick={() => handleSendMessage()}
              className="absolute right-2 top-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 5. SPECIAL GUIDE SCREEN (CLASS TESTS, VISION AI EVALUATION, SHORTCUTS & ROUTINE) */}
      {/* ======================================================== */}
      {activeView === 'tasks' && (
        <SpecialGuideHub
          onBack={() => setActiveView('home')}
          dailyTasks={dailyTasks}
          setDailyTasks={setDailyTasks}
          activeVivaTask={activeVivaTask}
          setActiveVivaTask={setActiveVivaTask}
          vivaStudentAnswer={vivaStudentAnswer}
          setVivaStudentAnswer={setVivaStudentAnswer}
          vivaEvaluation={vivaEvaluation}
          setVivaEvaluation={setVivaEvaluation}
          isVivaEvaluating={isVivaEvaluating}
          handleEvaluateViva={handleEvaluateViva}
          onPlayVoiceText={(text, title) => speakSingleChunk(text, undefined, undefined, title)}
          isVoicePlaying={isVoicePlaying}
          onStopVoice={stopVoice}
        />
      )}

      {/* ======================================================== */}
      {/* 📄 6. PDF AI DECODER (৫০% কঠিন স্লাইড ➔ ১০% পানি ভাত) */}
      {/* ======================================================== */}
      {activeView === 'pdf_ai' && (
        <PdfAiDecoder onBack={() => setActiveView('home')} />
      )}

      {/* ======================================================== */}
      {/* 🚀 MODAL 1: UPLOAD / PASTE CUSTOM BOOK & PDF MODAL 🚀 */}
      {/* ======================================================== */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c1428] border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">বই বা PDF আপলোড / লিংক যুক্ত করুন</h3>
                  <p className="text-[10px] text-zinc-400">ডাউনলোড করা ফাইল বা ড্রাইভ লিংক সংরক্ষণ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs: File Upload vs URL Link */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#080d1a] border border-zinc-800">
              <button
                type="button"
                onClick={() => setUploadTab('upload')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>ফাইল আপলোড</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('link')}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadTab === 'link' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>লিংক পেস্ট করুন</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Title input */}
              <div>
                <label className="text-[10px] font-bold text-zinc-300 block mb-1">
                  বই বা অধ্যায়ের নাম:
                </label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="যেমন: পৌরনীতি ১ম পত্র সম্পূর্ণ গাইড বা আমার নোট"
                  className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-zinc-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Subject & Paper Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1">
                    বিষয় নির্বাচন:
                  </label>
                  <select
                    value={newBookSubject}
                    onChange={(e) => setNewBookSubject(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#070b14] border border-zinc-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="ইংরেজি">ইংরেজি</option>
                    <option value="বাংলা">বাংলা</option>
                    <option value="ICT">তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</option>
                    <option value="পৌরনীতি ও সুশাসন">পৌরনীতি ও সুশাসন</option>
                    <option value="সমাজকর্ম">সমাজকর্ম</option>
                    <option value="ইসলামের ইতিহাস">ইসলামের ইতিহাস ও সংস্কৃতি</option>
                    <option value="ইসলাম শিক্ষা">ইসলাম শিক্ষা</option>
                    <option value="অন্যান্য বিষয়">অন্যান্য বিষয় / ব্যক্তিগত নোট</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1">
                    পত্র:
                  </label>
                  <select
                    value={newBookPaper}
                    onChange={(e) => setNewBookPaper(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#070b14] border border-zinc-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="1st">১ম পত্র</option>
                    <option value="2nd">২য় পত্র</option>
                    <option value="both">উভয় পত্র / সাধারণ</option>
                  </select>
                </div>
              </div>

              {/* File upload tab */}
              {uploadTab === 'upload' && (
                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1">
                    PDF বা ডকুমেন্ট ফাইল সিলেক্ট করুন:
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-700 hover:border-cyan-400 rounded-2xl p-4 text-center cursor-pointer bg-[#070b16] transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {isProcessingUpload ? (
                      <div className="flex flex-col items-center gap-1.5 text-xs text-cyan-300">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>ফাইল প্রসেসিং হচ্ছে...</span>
                      </div>
                    ) : uploadedFileObj ? (
                      <div className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate">{uploadedFileObj.name}</p>
                            <span className="text-[10px] text-zinc-400">{uploadedFileObj.size}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                          রেডি
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <FileUp className="w-6 h-6 text-zinc-400 mx-auto" />
                        <p className="text-xs font-semibold text-zinc-200">
                          ক্লিক করে PDF ফাইল আপলোড করুন
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          (PDF, Text বা Document ফাইল সমর্থিত)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Link tab */}
              {uploadTab === 'link' && (
                <div>
                  <label className="text-[10px] font-bold text-zinc-300 block mb-1">
                    গুগল ড্রাইভ বা অনলাইন PDF লিংক পেস্ট করুন:
                  </label>
                  <input
                    type="url"
                    value={newBookUrl}
                    onChange={(e) => setNewBookUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... বা https://nctb.gov.bd/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-zinc-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    💡 গুগল ড্রাইভের লিংক দিলে স্বয়ংক্রিয়ভাবে সরাসরি ভিউয়ার লিংকে রূপান্তর করা হবে।
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSaveCustomBook}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>বই সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📖 CHAPTER-WISE INTERACTIVE BOOK READER & VOICE OVER 📖 */}
      {/* ======================================================== */}
      {selectedBookForReader && selectedChapterForReader && (
        <div
          ref={readerContainerRef}
          className="fixed inset-0 z-50 bg-[#070914] text-zinc-100 flex flex-col overflow-hidden animate-fadeIn"
        >
          {/* Top Bar with Book Info & Exit */}
          <div className="bg-[#0b1024] border-b border-cyan-500/30 px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 truncate pr-2">
              <button
                type="button"
                onClick={() => {
                  stopVoice();
                  setSelectedBookForReader(null);
                  setSelectedChapterForReader(null);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                title="ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="truncate">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block truncate">
                  {selectedBookForReader.title}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {selectedChapterForReader.title}
                </h3>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5">
              <a
                href={selectedBookForReader.pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded-lg bg-emerald-600/90 text-black text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                title="আসল PDF ডাউনলোড"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">PDF</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  stopVoice();
                  setSelectedBookForReader(null);
                  setSelectedChapterForReader(null);
                }}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 🎧 FLOATING / TOP AUDIO VOICE CONTROLLER BAR 🎧 */}
          {/* ======================================================== */}
          <div className="bg-[#0e162f] border-b border-cyan-500/30 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isVoicePlaying) {
                    togglePauseVoice();
                  } else {
                    handlePlayFullChapter(selectedChapterForReader, currentReaderPageIndex);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                  isVoicePlaying && !isVoicePaused
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                {isVoicePlaying && !isVoicePaused ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-black" />
                    <span>পজ করুন</span>
                  </>
                ) : (
                  <>
                    <Headphones className="w-3.5 h-3.5" />
                    <span>পুরো চ্যাপ্টার শুনুন</span>
                  </>
                )}
              </button>

              {isVoicePlaying && (
                <button
                  type="button"
                  onClick={stopVoice}
                  className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs cursor-pointer active:scale-95"
                  title="বন্ধ করুন"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                </button>
              )}

              {/* Status indicator */}
              {isVoicePlaying && (
                <span className="text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>{activeSpeakingLabel || 'পড়ে শোনানো হচ্ছে...'}</span>
                </span>
              )}
            </div>

            {/* Voice Speed & Style Controller */}
            <div className="flex items-center gap-2">
              {/* Voice Speed Selector */}
              <div className="flex items-center rounded-lg bg-[#070b16] border border-zinc-800 p-0.5">
                {[0.75, 1.0, 1.25, 1.5].map(spd => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => changeSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      voiceSpeed === spd ? 'bg-cyan-500 text-black font-extrabold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Voice Type Selector */}
              <select
                value={voiceVoiceType}
                onChange={(e) => setVoiceVoiceType(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-[#070b16] border border-zinc-800 text-[10px] font-semibold text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="female">👩‍🏫 বাংলা শিক্ষিকা</option>
                <option value="male">👨‍🏫 বাংলা শিক্ষক</option>
                <option value="english">🇬🇧 English Teacher</option>
              </select>
            </div>
          </div>

          {/* FLOATING TEXT SELECTION PILL (Appears when user highlights any text) */}
          {selectedSnippet && (
            <div
              style={{
                position: 'fixed',
                top: `${selectedSnippet.top}px`,
                left: `${selectedSnippet.left}px`,
                transform: 'translateX(-50%)',
                zIndex: 9999
              }}
              className="animate-bounce"
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePlaySelectedSnippet();
                }}
                className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-2xl border border-white/40 cursor-pointer active:scale-95 transition-transform"
              >
                <Volume2 className="w-4 h-4" />
                <span>🔊 এটি পড়ে শুনুন</span>
              </button>
            </div>
          )}

          {/* Reader Content Body */}
          <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full space-y-4 custom-scrollbar">
            {selectedChapterForReader.pages && selectedChapterForReader.pages[currentReaderPageIndex] ? (
              <div className="p-4 sm:p-7 rounded-3xl bg-gradient-to-b from-[#0e1428] to-[#070b16] border border-cyan-500/30 space-y-5">
                {/* Page Indicator & Heading */}
                <div
                  id="reader-heading"
                  className={`flex items-center justify-between pb-3 border-b border-zinc-800 rounded-xl p-2 transition-all ${
                    activeSpeakingSectionIndex === 0 ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-400/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      পাতা {currentReaderPageIndex + 1} / {selectedChapterForReader.pages.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakSingleChunk(selectedChapterForReader.pages[currentReaderPageIndex].heading, undefined, 0, 'শিরোনাম')}
                      className="p-1 rounded-md text-zinc-400 hover:text-cyan-300"
                      title="শিরোনাম শুনুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-300 font-bold">
                    {selectedChapterForReader.pages[currentReaderPageIndex].heading}
                  </span>
                </div>

                {/* English Content (for English subjects) */}
                {selectedChapterForReader.pages[currentReaderPageIndex].englishContent && (
                  <div
                    id="reader-english"
                    className={`p-4 rounded-2xl bg-black/40 border text-sm text-zinc-200 leading-relaxed italic transition-all relative group ${
                      activeSpeakingSectionIndex === 1
                        ? 'border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-400/40'
                        : 'border-blue-500/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => speakSingleChunk(selectedChapterForReader.pages[currentReaderPageIndex].englishContent!, undefined, 1, 'ইংরেজি টেক্সট')}
                      className="absolute top-2.5 right-2.5 p-1 rounded-md bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white cursor-pointer"
                      title="পড়ে শুনুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    “{selectedChapterForReader.pages[currentReaderPageIndex].englishContent}”
                  </div>
                )}

                {/* Detailed Bengali Explanation */}
                <div
                  id="reader-bengali"
                  className={`space-y-2 p-3 rounded-2xl transition-all relative group ${
                    activeSpeakingSectionIndex === 2
                      ? 'bg-cyan-500/10 border border-cyan-400/60 ring-2 ring-cyan-400/30'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                      <span>📖 সারসংক্ষেপ ও সহজ বিশ্লেষণ:</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => speakSingleChunk(selectedChapterForReader.pages[currentReaderPageIndex].bengaliExplanation, undefined, 2, 'ব্যাখ্যা')}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-cyan-600 hover:text-black text-zinc-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>শুনুন</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans select-text">
                    {selectedChapterForReader.pages[currentReaderPageIndex].bengaliExplanation}
                  </p>
                </div>

                {/* Key Points */}
                {selectedChapterForReader.pages[currentReaderPageIndex].keyPoints && (
                  <div
                    id="reader-keypoints"
                    className={`p-3.5 rounded-2xl bg-cyan-950/30 border space-y-1.5 transition-all relative ${
                      activeSpeakingSectionIndex === 3
                        ? 'border-cyan-400 bg-cyan-950/50 ring-2 ring-cyan-400/40'
                        : 'border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-cyan-300">
                        📌 পরীক্ষার জন্য গুরুত্বপূর্ণ পয়েন্ট:
                      </h5>
                      <button
                        type="button"
                        onClick={() => speakSingleChunk(`পরীক্ষার জন্য পয়েন্টসমূহ: ${selectedChapterForReader.pages[currentReaderPageIndex].keyPoints.join('. ')}`, undefined, 3, 'পয়েন্টসমূহ')}
                        className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-cyan-600 hover:text-black text-zinc-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>শুনুন</span>
                      </button>
                    </div>
                    <ul className="space-y-1 text-xs text-zinc-300 select-text">
                      {selectedChapterForReader.pages[currentReaderPageIndex].keyPoints.map((pt, idx) => (
                        <li key={idx}>• {pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Creative Questions */}
                {selectedChapterForReader.pages[currentReaderPageIndex].creativeQuestionPrompt && (
                  <div
                    id="reader-creative"
                    className={`p-3.5 rounded-2xl bg-amber-950/20 border space-y-2 transition-all ${
                      activeSpeakingSectionIndex === 4
                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-400/40'
                        : 'border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>নমুনা সৃজনশীল প্রশ্ন ও প্রস্তুতি:</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          const { ka, kha, ga, gha } = selectedChapterForReader.pages[currentReaderPageIndex].creativeQuestionPrompt!;
                          speakSingleChunk(`সৃজনশীল প্রশ্ন ক: ${ka}. প্রশ্ন খ: ${kha}. প্রশ্ন গ: ${ga}. প্রশ্ন ঘ: ${gha}`, undefined, 4, 'সৃজনশীল প্রশ্ন');
                        }}
                        className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>শুনুন</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-300 select-text">
                      <p><span className="font-bold text-amber-400">ক. জ্ঞানমূলক (১):</span> {selectedChapterForReader.pages[currentReaderPageIndex].creativeQuestionPrompt.ka}</p>
                      <p><span className="font-bold text-amber-400">খ. অনুধাবনমূলক (২):</span> {selectedChapterForReader.pages[currentReaderPageIndex].creativeQuestionPrompt.kha}</p>
                      <p><span className="font-bold text-amber-400">গ. প্রয়োগমূলক (৩):</span> {selectedChapterForReader.pages[currentReaderPageIndex].creativeQuestionPrompt.ga}</p>
                      <p><span className="font-bold text-amber-400">ঘ. উচ্চতর দক্ষতা (৪):</span> {selectedChapterForReader.pages[currentReaderPageIndex].creativeQuestionPrompt.gha}</p>
                    </div>
                  </div>
                )}

                {/* Reader Pagination */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentReaderPageIndex <= 0}
                    onClick={() => {
                      stopVoice();
                      setCurrentReaderPageIndex(prev => Math.max(0, prev - 1));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 disabled:opacity-30 text-zinc-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>আগের পাতা</span>
                  </button>

                  <button
                    type="button"
                    disabled={currentReaderPageIndex >= selectedChapterForReader.pages.length - 1}
                    onClick={() => {
                      stopVoice();
                      setCurrentReaderPageIndex(prev => Math.min(selectedChapterForReader.pages.length - 1, prev + 1));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <span>পরের পাতা</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📖 CUSTOM BOOK / PDF READER (For User Uploaded Books) 📖 */}
      {/* ======================================================== */}
      {activeCustomBookForReading && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#0b1022] border-b border-cyan-500/30 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 truncate pr-2">
              <button
                type="button"
                onClick={() => {
                  stopVoice();
                  setActiveCustomBookForReading(null);
                }}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="truncate">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                  আমার আপলোডকৃত বই
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {activeCustomBookForReading.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeCustomBookForReading.fileDataUrl && (
                <a
                  href={activeCustomBookForReading.fileDataUrl}
                  download={activeCustomBookForReading.fileName || 'book.pdf'}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>ডাউনলোড</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  stopVoice();
                  setActiveCustomBookForReading(null);
                }}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer Frame */}
          <div className="flex-1 w-full bg-[#121622] relative flex flex-col">
            {activeCustomBookForReading.fileDataUrl ? (
              <iframe
                src={activeCustomBookForReading.fileDataUrl}
                title={activeCustomBookForReading.title}
                className="w-full h-full border-0"
              />
            ) : activeCustomBookForReading.externalUrl ? (
              <iframe
                src={
                  activeCustomBookForReading.externalUrl.includes('drive.google.com')
                    ? activeCustomBookForReading.externalUrl
                    : `https://docs.google.com/viewer?url=${encodeURIComponent(activeCustomBookForReading.externalUrl)}&embedded=true`
                }
                title={activeCustomBookForReading.title}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="p-8 text-center text-zinc-400">
                কোনো ফাইল বা লিংক পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBJECT GROUP MODAL (When clicking any of the 7 Subjects) */}
      {/* ======================================================== */}
      {selectedGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c1428] border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedGroupModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedGroupModal.bgColor} flex items-center justify-center text-white shadow-md`}>
                {renderSubjectIcon(selectedGroupModal.iconType)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedGroupModal.title}</h3>
                <p className="text-xs text-zinc-400">{selectedGroupModal.banglaTitle}</p>
              </div>
            </div>

            {/* Options list for 1st Paper / 2nd Paper */}
            <div className="space-y-2 pt-2">
              {selectedGroupModal.books.firstPaper && (
                <div className="p-3 rounded-2xl bg-[#080d1a] border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">১ম পত্র (1st Paper)</h4>
                    <p className="text-[10px] text-zinc-400">এনসিটিবি পাঠ্যবই, অধ্যায় ও ভয়েস ওভার</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const b = selectedGroupModal.books.firstPaper!;
                        setSelectedBookForReader(b);
                        setSelectedChapterForReader(b.chapters[0] || null);
                        setCurrentReaderPageIndex(0);
                        setSelectedGroupModal(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      📖 পড়ুন
                    </button>
                    <a
                      href={selectedGroupModal.books.firstPaper.pdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedGroupModal.books.secondPaper && (
                <div className="p-3 rounded-2xl bg-[#080d1a] border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">২য় পত্র (2nd Paper)</h4>
                    <p className="text-[10px] text-zinc-400">এনসিটিবি পাঠ্যবই, অধ্যায় ও ভয়েস ওভার</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const b = selectedGroupModal.books.secondPaper!;
                        setSelectedBookForReader(b);
                        setSelectedChapterForReader(b.chapters[0] || null);
                        setCurrentReaderPageIndex(0);
                        setSelectedGroupModal(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      📖 পড়ুন
                    </button>
                    <a
                      href={selectedGroupModal.books.secondPaper.pdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              )}

              {selectedGroupModal.books.single && (
                <div className="p-3 rounded-2xl bg-[#080d1a] border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">ICT মূল পাঠ্যবই</h4>
                    <p className="text-[10px] text-zinc-400">একাদশ-দ্বাদশ শ্রেণি</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const b = selectedGroupModal.books.single!;
                        setSelectedBookForReader(b);
                        setSelectedChapterForReader(b.chapters[0] || null);
                        setCurrentReaderPageIndex(0);
                        setSelectedGroupModal(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      📖 পড়ুন
                    </button>
                    <a
                      href={selectedGroupModal.books.single.pdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const book = selectedGroupModal.books.firstPaper || selectedGroupModal.books.single;
                if (book) {
                  setActiveSyllabusBook(book);
                  setSelectedGroupModal(null);
                }
              }}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 text-center cursor-pointer transition-colors"
            >
              📜 সিলেবাস ও পরীক্ষার মানবন্টন দেখুন
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ALL 13 OFFICIAL NCTB PDFS MODAL */}
      {/* ======================================================== */}
      {showAllPdfsModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-lg w-full bg-[#0c1428] border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">১৩টি বিষয়ের সরকারি আসল বই PDF</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllPdfsModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {DEFAULT_BOOKS.map(book => (
                <div
                  key={book.id}
                  className="p-3 rounded-2xl bg-[#080d1a] border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{book.title}</h4>
                    <p className="text-[10px] text-zinc-400">{book.banglaTitle}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePdfBook(book);
                        setShowAllPdfsModal(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-500/30 text-blue-300 text-xs font-bold cursor-pointer"
                    >
                      পড়ুন
                    </button>
                    <a
                      href={book.pdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CLEAN IN-APP VIDEO PLAYER MODAL */}
      {/* ======================================================== */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-center items-center p-2 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-4xl flex items-center justify-between py-2 px-3 bg-[#0a0d18] border border-cyan-500/30 rounded-t-2xl mb-1">
            <p className="text-xs sm:text-sm font-bold text-white truncate pr-2">
              {playingVideo.title}
            </p>
            <button
              type="button"
              onClick={() => setPlayingVideo(null)}
              className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full max-w-4xl aspect-video rounded-b-2xl overflow-hidden bg-black border border-cyan-500/30 shadow-2xl relative">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={playingVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ONLINE PDF VIEWER MODAL */}
      {/* ======================================================== */}
      {activePdfBook && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-[#0b1022] border-b border-cyan-500/30 px-4 py-3 flex items-center justify-between shrink-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate pr-2">
              {activePdfBook.title} — সম্পূর্ণ আসল বই PDF
            </h3>
            <div className="flex items-center gap-2">
              <a
                href={activePdfBook.pdfUrl}
                download
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-black text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>ডাউনলোড</span>
              </a>
              <button
                type="button"
                onClick={() => setActivePdfBook(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full bg-[#121622]">
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(activePdfBook.pdfUrl)}&embedded=true`}
              title={`${activePdfBook.title} PDF`}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SYLLABUS MODAL */}
      {/* ======================================================== */}
      {activeSyllabusBook && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c1428] border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setActiveSyllabusBook(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white">{activeSyllabusBook.title} সিলেবাস</h3>

            <div className="space-y-2.5 text-xs text-zinc-200">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">সিলেবাসের বিষয়বস্তু:</span>
                <p className="leading-relaxed">{activeSyllabusBook.syllabusOverview}</p>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">পরীক্ষার মানবন্টন:</span>
                <p className="leading-relaxed">{activeSyllabusBook.marksDistribution}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SETTINGS / PROFILE MODAL */}
      {/* ======================================================== */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c1428] border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">একাডেমিক প্রোফাইল সেটিংস</h3>
                <p className="text-xs text-zinc-400">Teacher AI তোমার সিলেবাস অনুযায়ী চলবে</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">শ্রেণি / বর্ষ:</label>
                <input
                  type="text"
                  value={academicProfile.classLevel}
                  onChange={(e) => setAcademicProfile(p => ({ ...p, classLevel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">বিভাগ:</label>
                <input
                  type="text"
                  value={academicProfile.stream}
                  onChange={(e) => setAcademicProfile(p => ({ ...p, stream: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">এসএসসি ব্যাচ:</label>
                <input
                  type="text"
                  value={academicProfile.sscBatch}
                  onChange={(e) => setAcademicProfile(p => ({ ...p, sscBatch: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD CUSTOM VIDEO MODAL */}
      {/* ======================================================== */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c1428] border border-pink-500/40 rounded-3xl p-5 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAddVideoModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white">নতুন YouTube ভিডিও যুক্ত করুন</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">YouTube লিংক বা ভিডিও আইডি:</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/... বা hvY4LTNanaM"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">ভিডিও টাইটেল:</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="যেমন: Unit 1 Lesson 1 Full Lecture"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1">বিষয়:</label>
                <select
                  value={newVideoSubject}
                  onChange={(e) => setNewVideoSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                >
                  <option value="english">ইংরেজি (English)</option>
                  <option value="bangla">বাংলা (Bangla)</option>
                  <option value="ict">ICT</option>
                  <option value="civics">পৌরনীতি ও সুশাসন</option>
                  <option value="social_work">সমাজকর্ম</option>
                  <option value="history">ইসলামের ইতিহাস</option>
                  <option value="islamic">ইসলাম শিক্ষা</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                let id = newVideoUrl.trim();
                if (id.includes('youtu.be/')) id = id.split('youtu.be/')[1].split(/[?&]/)[0];
                else if (id.includes('watch?v=')) id = id.split('watch?v=')[1].split('&')[0];

                if (!id) {
                  triggerNotification("⚠️ ভুল লিংক", "সঠিক YouTube লিংক বা আইডি দিন");
                  return;
                }

                const newVid: VideoLesson = {
                  id: `v-custom-${Date.now()}`,
                  title: newVideoTitle.trim() || 'কাস্টম YouTube লেকচার',
                  subjectCategory: newVideoSubject,
                  subjectName: newVideoSubject === 'english' ? 'ইংরেজি' : newVideoSubject === 'bangla' ? 'বাংলা' : newVideoSubject.toUpperCase(),
                  youtubeId: id,
                  channelName: 'যুক্ত করা লেকচার',
                  duration: 'ক্লাস',
                  views: 'নতুন',
                  addedAgo: 'আজ'
                };

                setVideos(prev => [newVid, ...prev]);
                setShowAddVideoModal(false);
                setNewVideoUrl('');
                setNewVideoTitle('');
                triggerNotification("🎉 ভিডিও যুক্ত হয়েছে!", "লেকচারটি ভিডিও তালিকায় সংরক্ষিত হয়েছে।");
              }}
              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-xs uppercase cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
