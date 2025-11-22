const API_PREFIX = '/api/v1';

const BAD_WORDS = [
  "tuc tiu", "thô tục", "shit", "crap", "lồn",
  "địt", "cặc", "đcm", "đĩ", "đéo", "ngu", "đần độn",
  "đm", "dm", "ccm", "địt mẹ", "đĩ mẹ", "mẹ mày",
  "mẹ kiếp", "đụ mẹ", "vãi lồn", "vãi đái", "chó đẻ",
  "đồ chó", "đồ khùng", "đồ ngốc", "đồ dốt",
  "lòn", "cac", "lòi", "cứt",
  "đụ", "vcl", "clgt", "cc", "buồi", "lôz",
];

const INVALID_NAMES = ["Object Object", "[object Object]"];

const CATEGORY_SEARCH_STRATEGIES = {
  'K-POP': {
    // K-POP không phải official genre, search by text
    useGenreFilter: false,
    searchQueries: ['k-pop', 'kpop', 'korean pop'],
    genreFilters: ['k-rap', 'korean r&b', 'korean indie'], // Related genres
  },
  'J-POP': {
    // J-POP là official genre, dùng genre filter
    useGenreFilter: true,
    searchQueries: ['j-pop', 'jpop'],
    genreFilters: ['j-pop', 'japanese pop', 'j-rock'],
  },
  'V-POP': {
    useGenreFilter: false,
    searchQueries: ['v-pop', 'vpop', 'vietnamese pop'],
    genreFilters: ['vietnamese pop'],
  },
  'POP': {
    useGenreFilter: true,
    searchQueries: ['pop'],
    genreFilters: ['pop', 'dance pop', 'indie pop'],
  },
  'HIP-HOP': {
    useGenreFilter: true,
    searchQueries: ['hip hop', 'hip-hop'],
    genreFilters: ['hip hop', 'rap', 'trap'],
  },
  'INDIE': {
    useGenreFilter: true,
    searchQueries: ['indie'],
    genreFilters: ['indie', 'indie rock', 'indie pop'],
  },
  'JAZZ': {
    useGenreFilter: true,
    searchQueries: ['jazz'],
    genreFilters: ['jazz', 'smooth jazz', 'contemporary jazz'],
  },
  'RAP': {
    useGenreFilter: true,
    searchQueries: ['rap', 'k-rap', 'hip hop', 'j-rap', 'v-rap'],
    genreFilters: ['rap', 'hip hop', 'trap', 'k-rap', 'japanese hip hop', 'vietnamese hip hop'],
  },
  'DANCE': {
    useGenreFilter: true,
    searchQueries: ['dance', 'edm'],
    genreFilters: ['dance', 'edm', 'house'],
  },
  'ROCK': {
    useGenreFilter: true,
    searchQueries: ['rock'],
    genreFilters: ['rock', 'classic rock', 'alternative rock'],
  },
  'C-POP': {
    useGenreFilter: false,
    searchQueries: ['c-pop', 'chinese pop', 'mandopop', 'c-rap'],
    genreFilters: ['chinese pop', 'mandopop', 'chinese rock'],
  },
};

module.exports = {
  API_PREFIX,
  BAD_WORDS,
  INVALID_NAMES,
  CATEGORY_SEARCH_STRATEGIES,
}
