import { LanguageOption } from '../types';

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isEnglish: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isEnglish: false },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', isEnglish: false },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', isEnglish: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isEnglish: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isEnglish: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isEnglish: false },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', isEnglish: false },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', isEnglish: false },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली (बिहार)', isEnglish: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isEnglish: false },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', isEnglish: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isEnglish: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', isEnglish: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', isEnglish: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isEnglish: false },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', isEnglish: false },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', isEnglish: false },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', isEnglish: false },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isEnglish: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isEnglish: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isEnglish: false },
];

export const ENGLISH_LANGUAGE: LanguageOption = {
  code: 'en',
  name: 'English',
  nativeName: 'English (Universal)',
  isEnglish: true,
};

export const ALL_SUPPORTED_LANGUAGES: LanguageOption[] = [
  ENGLISH_LANGUAGE,
  ...INDIAN_LANGUAGES,
];

export const MAX_INDIAN_LANGUAGES = 4;
export const MAX_TOTAL_LANGUAGES = 5;
