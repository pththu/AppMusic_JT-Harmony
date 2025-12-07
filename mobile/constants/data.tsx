const ACTIVITIES = [
  { id: 'workout', label: 'Tập luyện', icon: 'barbell-outline' },
  { id: 'study', label: 'Học tập', icon: 'school-outline' },
  { id: 'commute', label: 'Di chuyển', icon: 'bus-outline' },
  { id: 'sleep', label: 'Ngủ', icon: 'moon-outline' },
  { id: 'party', label: 'Tiệc tùng', icon: 'musical-notes-outline' },
  { id: 'gaming', label: 'Chơi game', icon: 'game-controller-outline' },
  { id: 'relax', label: 'Thư giãn', icon: 'leaf-outline' },
  { id: 'focus', label: 'Tập trung', icon: 'eye-outline' },
  { id: 'running', label: 'Chạy bộ', icon: 'walk-outline' },
  { id: 'yoga', label: 'Yoga', icon: 'body-outline' },
  { id: 'cooking', label: 'Nấu ăn', icon: 'restaurant-outline' },
  { id: 'reading', label: 'Đọc sách', icon: 'book-outline' },
  { id: 'meditation', label: 'Thiền', icon: 'medkit-outline' },
  { id: 'driving', label: 'Lái xe', icon: 'car-outline' },
];

const NOTIFICATION_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Thích', value: 'like' },
  { label: 'Bình luận', value: 'comment' },
  { label: 'Chia sẻ', value: 'share' },
  { label: 'Theo dõi', value: 'follow' },
  { label: 'Tin nhắn', value: 'message' },
];

const MOODS = [
  { id: 'happy', label: 'Vui vẻ 😊' },
  { id: 'sad', label: 'Buồn 😢' },
  { id: 'focused', label: 'Tập trung 🧠' },
  { id: 'chill', label: 'Chill 🍃' },
  { id: 'energetic', label: 'Năng động ⚡' },
  { id: 'romantic', label: 'Lãng mạn 🌹' },
  { id: 'sleepy', label: 'Buồn ngủ 😴' },
  { id: 'angry', label: 'Bực bội 😡' },
  { id: 'motivated', label: 'Có động lực 🚀' },
  { id: 'stressed', label: 'Căng thẳng 😰' },
  { id: 'nostalgic', label: 'Hoài niệm � ' },
  { id: 'boring', label: 'Chán nản 😐' },
  { id: "heartbroken", label: 'Đau khổ 💔' },
];

const BROWSE_CATEGORIES = [
  { id: "3", name: "POP", color: "#4facfe", colorEnd: "#e0c3fc", icon: "heart" },
  { id: "4", name: "K-POP", color: "#e8198b", colorEnd: "#f794a4", icon: "people" },
  { id: "6", name: "V-POP", color: "#ff0844", colorEnd: "#f9d423", icon: "star" },
  { id: "2", name: "C-POP", color: "#f5576c", colorEnd: "#fee140", icon: "snow" },
  { id: "5", name: "J-POP", color: "#e8198b", colorEnd: "#efefef", icon: "disc" },
  { id: "7", name: "RAP", color: "#c71d6f", colorEnd: "#96deda", icon: "mic" },
  { id: "12", name: "ROCK", color: "#e8198b", colorEnd: "#FFBD71", icon: "mic" },
  { id: "8", name: "HIP-HOP", color: "#2b5876", colorEnd: "#dad4ec", icon: "headset" },
  { id: "9", name: "DANCE", color: "#009efd", colorEnd: "#38f9d7", icon: "body" },
  { id: "10", name: "INDIE", color: "#a18cd1", colorEnd: "#FBC2EB", icon: "leaf" },
  { id: "1", name: "TAMIL", color: "#eacda3", colorEnd: "#94B447", icon: "musical-notes" },
  { id: "11", name: "JAZZ", color: "#FF7A7B", colorEnd: "#FFBD71", icon: "musical-note" },
];

const FILTER_TYPES = ["All", "Track", "Artist", "Album", "Playlist", "User"];

const ARTIST_DATA = [
  {
    "spotifyId": "3Nrfpe0tUJi4K4DXYWgMUX",
    "name": "BTS",
    "genres": [
      "k-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebd642648235ebf3460d2d1f6a",
    "totalFollowers": 81063906,
    "type": "artist"
  },
  {
    "spotifyId": "5RmQ8k4l3HZ8JoPb4mNsML",
    "name": "Agust D",
    "genres": [
      "k-pop",
      "k-rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb191d43dca6f2f5a126e43e4b",
    "totalFollowers": 15501873,
    "type": "artist"
  },
  {
    "spotifyId": "2auC28zjQyVTsiZKNgPRGs",
    "name": "RM",
    "genres": [
      "k-pop",
      "k-rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb847fe9bbfef3acf7981acd2a",
    "totalFollowers": 17682294,
    "type": "artist"
  },
  {
    "spotifyId": "3JsHnjpbhX4SnySpvpa9DK",
    "name": "V",
    "genres": [
      "k-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb8e7d00d3aae87cf8fc6946e2",
    "totalFollowers": 20041156,
    "type": "artist"
  },
  {
    "spotifyId": "6HaGTQPmzraVmaVxvz6EUc",
    "name": "Jung Kook",
    "genres": [
      "k-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb40a7268dd742e5f63759b960",
    "totalFollowers": 18544435,
    "type": "artist"
  },
  {
    "spotifyId": "0b1sIQumIAsNbqAoIClSpy",
    "name": "j-hope",
    "genres": [
      "k-pop",
      "k-rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb25c2401c3595f0ac35e19b98",
    "totalFollowers": 19182844,
    "type": "artist"
  },
  {
    "spotifyId": "77AiFEVeAVj2ORpC85QVJs",
    "name": "Steve Aoki",
    "genres": [
      "electro house",
      "edm"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebcf85b39d94c486218a687248",
    "totalFollowers": 3788173,
    "type": "artist"
  },
  {
    "spotifyId": "7yquVKfxBuNFJbG9cy2R8A",
    "name": "Vũ Cát Tường",
    "genres": [
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebb6f728660d5609ec077de870",
    "totalFollowers": 904099,
    "type": "artist"
  },
  {
    "spotifyId": "7Cp2hGcriAaDUAWpXnSEwm",
    "name": "buitruonglinh",
    "genres": [
      "v-pop",
      "vietnamese lo-fi",
      "vietnam indie",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb9adfc46417bb7d546b4ab3dd",
    "totalFollowers": 803620,
    "type": "artist"
  },
  {
    "spotifyId": "15qIW0R8ys6DkGKygGnMEN",
    "name": "Kiều Chi",
    "genres": [
      "v-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebe62ee19fc33a48d29b388437",
    "totalFollowers": 12988,
    "type": "artist"
  },
  {
    "spotifyId": "3euFcFd5Dc7JAz6t7oKg7m",
    "name": "BMZ",
    "genres": [
      "v-pop",
      "vinahouse",
      "vietnam indie",
      "vietnamese lo-fi"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb72ee71305a5799765ff63db4",
    "totalFollowers": 13194,
    "type": "artist"
  },
  {
    "spotifyId": "33J4sIJ9vp7KgdKpxXm6z6",
    "name": "Minsicko",
    "genres": [
      "vietnamese hip hop",
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebbc3e8e565ba02855a050dde2",
    "totalFollowers": 3097,
    "type": "artist"
  },
  {
    "spotifyId": "5xY6E5PMZNtz9jDvxTRiGI",
    "name": "Dangrangto",
    "genres": [
      "vietnamese hip hop",
      "v-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb5b09f4c3eeb52b57f76dccbc",
    "totalFollowers": 448373,
    "type": "artist"
  },
  {
    "spotifyId": "1y28JlO6rDMUB5rkcA4RAh",
    "name": "52Hz",
    "genres": [
      "v-pop",
      "vietnam indie",
      "vietnamese hip hop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb72856734dbbdac3027b447e3",
    "totalFollowers": 294841,
    "type": "artist"
  },
  {
    "spotifyId": "2dC1IBU9NOD9xsQJ5RE7j7",
    "name": "Puppy",
    "genres": [
      "v-pop",
      "vietnamese hip hop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb980a220d32409b1164cc9a1d",
    "totalFollowers": 113401,
    "type": "artist"
  },
  {
    "spotifyId": "37yCp3F1wG0gNrnaLkIdDV",
    "name": "Đậu Tất Đạt",
    "genres": [
      "v-pop",
      "vietnamese hip hop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebb91df56f1f2b479d34ffd5c8",
    "totalFollowers": 2060,
    "type": "artist"
  },
  {
    "spotifyId": "4KPyQxL1zqEiBcTwW6c9HE",
    "name": "Dương Domic",
    "genres": [
      "v-pop",
      "vietnamese hip hop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb352d5672d70464e67c3ae963",
    "totalFollowers": 683644,
    "type": "artist"
  },
  {
    "spotifyId": "75Ki5hBCOpDtKGoFyTvLxP",
    "name": "Lou Hoàng",
    "genres": [
      "v-pop",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb1ecb294a0e1b2749d648f555",
    "totalFollowers": 555240,
    "type": "artist"
  },
  {
    "spotifyId": "6CGGvCBHWqQ4HXtn5aLhbh",
    "name": "SOOBIN",
    "genres": [
      "v-pop",
      "vietnamese hip hop",
      "vietnam indie",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb4bf18316dd0bd42ea5f9f8ec",
    "totalFollowers": 1227574,
    "type": "artist"
  },
  {
    "spotifyId": "3diftVOq7aEIebXKkC34oR",
    "name": "tlinh",
    "genres": [
      "v-pop",
      "vietnamese hip hop",
      "vietnam indie",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb230e62752ca87da1d85d0445",
    "totalFollowers": 1721325,
    "type": "artist"
  },
  {
    "spotifyId": "30rE8bXvAPUPL4GC7LnnWc",
    "name": "Andree Right Hand",
    "genres": [
      "vietnamese hip hop",
      "v-pop",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b273ae9f6efe502c816fa98bc214",
    "totalFollowers": 56,
    "type": "artist"
  },
  {
    "spotifyId": "3pYWVw3JZ4mb73xm3ngI7C",
    "name": "Kris V",
    "genres": [
      "v-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb2110bbc301da1799b43c295a",
    "totalFollowers": 231,
    "type": "artist"
  },
  {
    "spotifyId": "7BnpRENhA3oHJ0BU24pkgj",
    "name": "Baby Sam",
    "genres": [],
    "totalFollowers": 6,
    "type": "artist"
  },
  {
    "spotifyId": "4f3P0wtyRbZ0nGpH3U01VY",
    "name": "Vine",
    "genres": [],
    "totalFollowers": 8,
    "type": "artist"
  },
  {
    "spotifyId": "1zSv9qZANOWB4HRE8sxeTL",
    "name": "RPT MCK",
    "genres": [
      "vietnamese hip hop",
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebb97791c136d7354ad7792555",
    "totalFollowers": 1276801,
    "type": "artist"
  },
  {
    "spotifyId": "2v14NO80QYditUms7sbEIZ",
    "name": "Trung Trần",
    "genres": [
      "vietnamese hip hop",
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb29e2bb2de6d2385d77089ee8",
    "totalFollowers": 29471,
    "type": "artist"
  },
  {
    "spotifyId": "6xRZoWlE9twEkMC5NW4Z9f",
    "name": "Hoàng Tôn",
    "genres": [
      "v-pop",
      "vietnamese hip hop",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebedbcd6617c30e3c85939c8c1",
    "totalFollowers": 289696,
    "type": "artist"
  },
  {
    "spotifyId": "08xn7sYY4KworP8Vc3GoiU",
    "name": "Orinn",
    "genres": [
      "vinahouse",
      "vietnamese lo-fi",
      "v-pop",
      "lo-fi"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb4fdf52f134b5262c39d66ce5",
    "totalFollowers": 589714,
    "type": "artist"
  },
  {
    "spotifyId": "78eABhM9sdaI0SgOSkBN3H",
    "name": "Marcus",
    "genres": [
      "v-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb549c97d0183f29010caf59b5",
    "totalFollowers": 61,
    "type": "artist"
  },
  {
    "spotifyId": "5dfZ5uSmzR7VQK0udbAVpf",
    "name": "Sơn Tùng M-TP",
    "genres": [
      "v-pop",
      "vinahouse",
      "vietnamese hip hop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb5a79a6ca8c60e4ec1440be53",
    "totalFollowers": 7325171,
    "type": "artist"
  },
  {
    "spotifyId": "2m8Bk9or6quybzoQbM0zQt",
    "name": "SlimV",
    "genres": [
      "v-pop",
      "vinahouse",
      "vietnamese hip hop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebc22a603a6c20b3030007fc27",
    "totalFollowers": 2618,
    "type": "artist"
  },
  {
    "spotifyId": "06HL4z0CvFAxyc27GXpf02",
    "name": "Taylor Swift",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebe2e8e7ff002a4afda1c7147e",
    "totalFollowers": 144788773,
    "type": "artist"
  },
  {
    "spotifyId": "74KM79TiuVKeVCqs8QtB0B",
    "name": "Sabrina Carpenter",
    "genres": [
      "pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb78e45cfa4697ce3c437cb455",
    "totalFollowers": 26229556,
    "type": "artist"
  },
  {
    "spotifyId": "246dkjvS1zLTtiykXe5h60",
    "name": "Post Malone",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebe17c0aa1714a03d62b5ce4e0",
    "totalFollowers": 47670098,
    "type": "artist"
  },
  {
    "spotifyId": "1moxjboGR7GNWYIMWsRjgG",
    "name": "Florence + The Machine",
    "genres": [
      "baroque pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb836eb0a7a82eb8f4133ee04d",
    "totalFollowers": 7204746,
    "type": "artist"
  },
  {
    "spotifyId": "00x1fYSGhdqScXBRpSj3DW",
    "name": "Olivia Dean",
    "genres": [
      "pop soul"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb5c7577ad44daeb7ce4b941a1",
    "totalFollowers": 1334998,
    "type": "artist"
  },
  {
    "spotifyId": "2CvaqAMMsX576VBehaJ0Wx",
    "name": "Wanna One",
    "genres": [
      "k-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b27323bd8b27aeb3ad6d4f4339c4",
    "totalFollowers": 1814623,
    "type": "artist"
  },
  {
    "spotifyId": "1iQfn1B8V25iQoolQakyAZ",
    "name": "NU'EST",
    "genres": [
      "k-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb7682e26b8e7f5bfed0e87d84",
    "totalFollowers": 1002588,
    "type": "artist"
  },
  {
    "spotifyId": "1s1LcjuiFLWFwCRqCBbrIG",
    "name": "Kye Bum Zu",
    "genres": [],
    "totalFollowers": 62,
    "type": "artist"
  },
  {
    "spotifyId": "6f4srX54JFrLNK4aTJe2Sc",
    "name": "Ren Ran",
    "genres": [
      "mandopop",
      "c-pop",
      "gufeng",
      "chinese r&b",
      "taiwanese pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebf275b5cd5f576cf23bad5f94",
    "totalFollowers": 480144,
    "type": "artist"
  },
  {
    "spotifyId": "5IH6FPUwQTxPSXurCrcIov",
    "name": "Alec Benjamin",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb5af962a543938243f083cbb9",
    "totalFollowers": 5567558,
    "type": "artist"
  },
  {
    "spotifyId": "04gDigrS5kc9YWfZHwBETP",
    "name": "Maroon 5",
    "genres": [
      "pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebf8349dfb619a7f842242de77",
    "totalFollowers": 45672509,
    "type": "artist"
  },
  {
    "spotifyId": "7tYKF4w9nC0nq9CsPZTHyP",
    "name": "SZA",
    "genres": [
      "r&b"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebfd0a9fb6c252a3ba44079acf",
    "totalFollowers": 32855760,
    "type": "artist"
  },
  {
    "spotifyId": "0ZED1XzwlLHW4ZaG4lOT6m",
    "name": "Julia Michaels",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb1b098899f1cc5be055471b4d",
    "totalFollowers": 5287973,
    "type": "artist"
  },
  {
    "spotifyId": "2iUbk5KhZYZt4CRvWbwb7S",
    "name": "LunchMoney Lewis",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebe9d4824e4e40d57875b5fdcc",
    "totalFollowers": 98031,
    "type": "artist"
  },
  {
    "spotifyId": "13ubrt8QOOCPljQ2FL1Kca",
    "name": "A$AP Rocky",
    "genres": [
      "rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb5c58c41a506a0d6b32cc6cad",
    "totalFollowers": 17276225,
    "type": "artist"
  },
  {
    "spotifyId": "2YZyLoL8N0Wb9xBt1NhZWg",
    "name": "Kendrick Lamar",
    "genres": [
      "hip hop",
      "west coast hip hop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb39ba6dcd4355c03de0b50918",
    "totalFollowers": 44384749,
    "type": "artist"
  },
  {
    "spotifyId": "1RyvyyTE3xzB2ZywiAwp0i",
    "name": "Future",
    "genres": [
      "rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb7565b356bc9d9394eefa2ccb",
    "totalFollowers": 22593389,
    "type": "artist"
  },
  {
    "spotifyId": "66CXWjxzNUsdJxJ2JdwvnR",
    "name": "Ariana Grande",
    "genres": [
      "pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb6725802588d7dc1aba076ca5",
    "totalFollowers": 107199859,
    "type": "artist"
  },
  {
    "spotifyId": "2RdwBSPQiwcmiDo9kixcl8",
    "name": "Pharrell Williams",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebf0789cd783c20985ec3deb4e",
    "totalFollowers": 5297302,
    "type": "artist"
  },
  {
    "spotifyId": "0hCNtLu0JehylgoiP8L4Gh",
    "name": "Nicki Minaj",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb07a50f0a9a8f11e5a1102cbd",
    "totalFollowers": 34264030,
    "type": "artist"
  },
  {
    "spotifyId": "2wIVse2owClT7go1WT98tk",
    "name": "Missy Elliott",
    "genres": [
      "hip hop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebf6691f40d906f097e9fbaa4c",
    "totalFollowers": 2733271,
    "type": "artist"
  },
  {
    "spotifyId": "1HY2Jd0NmPuamShAr6KMms",
    "name": "Lady Gaga",
    "genres": [
      "art pop",
      "pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebaadc18cac8d48124357c38e6",
    "totalFollowers": 41984054,
    "type": "artist"
  },
  {
    "spotifyId": "4VIvfOurcf0vuLRxLkGnIG",
    "name": "Bradley Cooper",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb9400a1dccee9f0df97847c0f",
    "totalFollowers": 293886,
    "type": "artist"
  },
  {
    "spotifyId": "1uNFoZAHBGtllmzznpCI3s",
    "name": "Justin Bieber",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebaf20f7db5288bce9beede034",
    "totalFollowers": 84836490,
    "type": "artist"
  },
  {
    "spotifyId": "0VRj0yCOv2FXJNP47XQnx5",
    "name": "Quavo",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebd52229f479361a2375f6021c",
    "totalFollowers": 8053090,
    "type": "artist"
  },
  {
    "spotifyId": "5yy76ufVriyvidNSvXlRU1",
    "name": "Clever",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebc65b0b518917e5c889639fe2",
    "totalFollowers": 95296,
    "type": "artist"
  },
  {
    "spotifyId": "1tqhsYv8yBBdwANFNzHtcr",
    "name": "Lil Dicky",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebfd1780645d82ecbc3b5253cb",
    "totalFollowers": 2045397,
    "type": "artist"
  },
  {
    "spotifyId": "0Y5tJX1MQlPlqiwlOH1tJY",
    "name": "Travis Scott",
    "genres": [
      "rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb19c2790744c792d05570bb71",
    "totalFollowers": 40954612,
    "type": "artist"
  },
  {
    "spotifyId": "0cGUm45nv7Z6M6qdXYQGTX",
    "name": "Kehlani",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb57082fd22d755e80a648fac3",
    "totalFollowers": 8624067,
    "type": "artist"
  },
  {
    "spotifyId": "57LYzLEk2LcFghVwuWbcuS",
    "name": "Summer Walker",
    "genres": [
      "r&b"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebbfea105b86a4f661489ce099",
    "totalFollowers": 7980275,
    "type": "artist"
  },
  {
    "spotifyId": "6eUKZXaKkcviH0Ku9w2n3V",
    "name": "Ed Sheeran",
    "genres": [
      "soft pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebd55c95ad400aed87da52daec",
    "totalFollowers": 122551595,
    "type": "artist"
  },
  {
    "spotifyId": "1snhtMLeb2DYoMOcVbb8iB",
    "name": "Kenshi Yonezu",
    "genres": [
      "j-pop",
      "anime",
      "j-rock"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb551104d6bfdfc4de65b057a2",
    "totalFollowers": 7360457,
    "type": "artist"
  },
  {
    "spotifyId": "6pNgnvzBa6Bthsv8SrZJYl",
    "name": "Hatsune Miku",
    "genres": [
      "vocaloid"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebba025c8f62612b2ca6bfa375",
    "totalFollowers": 2598641,
    "type": "artist"
  },
  {
    "spotifyId": "5M2zpiu3UmpkILAzG32bCP",
    "name": "池田 エライザ",
    "genres": [
      "j-pop"
    ],
    "totalFollowers": 709,
    "type": "artist"
  },
  {
    "spotifyId": "6n4SsAp5VjvIBg3s9QCcPX",
    "name": "SUDA MASAKI",
    "genres": [
      "j-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebe9fcaff28ae9db39738cc33f",
    "totalFollowers": 2195209,
    "type": "artist"
  },
  {
    "spotifyId": "64tJ2EAv1R6UaZqc4iOCyj",
    "name": "YOASOBI",
    "genres": [
      "j-pop",
      "anime"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb507349709ae19263301a62f7",
    "totalFollowers": 9506809,
    "type": "artist"
  },
  {
    "spotifyId": "3PzqP5IkpLhlSdZLh7jwPn",
    "name": "WagakkiBand",
    "genres": [
      "j-rock",
      "j-pop",
      "vocaloid",
      "folk metal"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb87c09cd8a5aba63e591265fc",
    "totalFollowers": 337526,
    "type": "artist"
  },
  {
    "spotifyId": "26EDErwu7D8GCunIGrMjVA",
    "name": "NO NAME",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b27377e723cd8aa25197f950a8c6",
    "totalFollowers": 3029,
    "type": "artist"
  },
  {
    "spotifyId": "01wau5CL3Z1vfJJWkzBkqg",
    "name": "AKB48",
    "genres": [
      "j-pop",
      "c-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebb75a6796e980d08ffc4f52b6",
    "totalFollowers": 518831,
    "type": "artist"
  },
  {
    "spotifyId": "1zyD0NHjxqwqvNXoHSrjZO",
    "name": "Cliff Edge",
    "genres": [
      "j-pop",
      "j-r&b"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b273189b5784d34badef583376c4",
    "totalFollowers": 24507,
    "type": "artist"
  },
  {
    "spotifyId": "3dS0cGKSFthAFYPCTG82Fl",
    "name": "MAY'S",
    "genres": [
      "j-r&b",
      "j-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb72d8453a4241690f60e59a7d",
    "totalFollowers": 83801,
    "type": "artist"
  },
  {
    "spotifyId": "1UuqVEGVc8ZO3vPIsLCaY0",
    "name": "SHION",
    "genres": [
      "j-r&b",
      "j-rap",
      "j-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b273533dde875f1728ccd7d9ec8c",
    "totalFollowers": 31475,
    "type": "artist"
  },
  {
    "spotifyId": "2UX6TY9ZzXpBp6tKD2kNut",
    "name": "AJ",
    "genres": [
      "japanese vgm"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b273b4a8de3332711dd71003c58a",
    "totalFollowers": 706,
    "type": "artist"
  },
  {
    "spotifyId": "5O2mC2Qd9HSGuisFTl1FM8",
    "name": "RSP",
    "genres": [
      "anime",
      "j-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b27309c4b3c80d6241156e146981",
    "totalFollowers": 10532,
    "type": "artist"
  },
  {
    "spotifyId": "09lQqeo8BbaAxrWUHcGuJK",
    "name": "Maiko Nakamura",
    "genres": [
      "j-r&b",
      "j-pop",
      "city pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb6d3aa9f062f9bd6e5bb57754",
    "totalFollowers": 36965,
    "type": "artist"
  },
  {
    "spotifyId": "7lybfVE40cGcl6jmzb33Qe",
    "name": "jyA-Me",
    "genres": [
      "j-r&b",
      "kayokyoku",
      "j-pop",
      "enka"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b273d66dfcdafad4de12343efb74",
    "totalFollowers": 3986,
    "type": "artist"
  },
  {
    "spotifyId": "2EqaSEa0WkE59Aca9iXSYj",
    "name": "『ユイカ』",
    "genres": [
      "j-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb775869f50e1369fbea0c559a",
    "totalFollowers": 389558,
    "type": "artist"
  },
  {
    "spotifyId": "6rs1KAoQnFalSqSU4LTh8g",
    "name": "back number",
    "genres": [
      "j-pop",
      "j-rock"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb3f895ff0b36b97f6aba648a7",
    "totalFollowers": 5860613,
    "type": "artist"
  },
  {
    "spotifyId": "7k73EtZwoPs516ZxE72KsO",
    "name": "ONE OK ROCK",
    "genres": [
      "j-rock",
      "j-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb65f3ecf43652596ef75f3293",
    "totalFollowers": 5899926,
    "type": "artist"
  },
  {
    "spotifyId": "2GWuBfYdmPB91krBNQavHa",
    "name": "Paledusk",
    "genres": [
      "mathcore",
      "j-rock",
      "metalcore"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb9d36b5ac87f38e8ebce7dde9",
    "totalFollowers": 80499,
    "type": "artist"
  },
  {
    "spotifyId": "074tUrKhXVuH4s5Mfg0zWz",
    "name": "CHICO CARLITO",
    "genres": [
      "j-rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb17ba793f42f2ad205ffa3d1e",
    "totalFollowers": 52425,
    "type": "artist"
  },
  {
    "spotifyId": "1fTWz0OemWveF9AMkRPJKi",
    "name": "Forest Studio",
    "genres": [
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb980fdbc56854717fe9a8b50a",
    "totalFollowers": 47095,
    "type": "artist"
  },
  {
    "spotifyId": "67iEesKynAK85rx8smKhCZ",
    "name": "Tiến Luật",
    "genres": [
      "v-pop",
      "vietnam indie"
    ],
    "totalFollowers": 766,
    "type": "artist"
  },
  {
    "spotifyId": "2mpSmbp35mvG7ig3cg1jEj",
    "name": "Diệu Nhi",
    "genres": [
      "v-pop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb7ba9f1c7ca1da781dc72f2a1",
    "totalFollowers": 4837,
    "type": "artist"
  },
  {
    "spotifyId": "6oqtpFuvCTISMPeGv6P2sj",
    "name": "Bùi Công Nam",
    "genres": [
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb30b06e8ef75d11396d495259",
    "totalFollowers": 79302,
    "type": "artist"
  },
  {
    "spotifyId": "56vNGG0GJtL6p8ltx7cLvj",
    "name": "Cầm",
    "genres": [
      "v-pop",
      "vinahouse",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb15942731974bf0db725c2536",
    "totalFollowers": 15021,
    "type": "artist"
  },
  {
    "spotifyId": "5M3ffmRiOX9Q8Y4jNeR5wu",
    "name": "Wren Evans",
    "genres": [
      "v-pop",
      "vietnam indie",
      "vietnamese hip hop",
      "vinahouse"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb170428492febf4a71ef1e08e",
    "totalFollowers": 635187,
    "type": "artist"
  },
  {
    "spotifyId": "30eFAXoU2kTjJPf2cq80B8",
    "name": "WEAN",
    "genres": [
      "v-pop",
      "vietnamese hip hop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb040ce9d8a0ff0e237249a644",
    "totalFollowers": 499227,
    "type": "artist"
  },
  {
    "spotifyId": "1L1VfizWn4DkFt602yD80U",
    "name": "ERIK",
    "genres": [
      "v-pop",
      "vinahouse",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb916407e907705dc1ab9010c3",
    "totalFollowers": 1130697,
    "type": "artist"
  },
  {
    "spotifyId": "3Wj34lTDJnPp70u4YCl4jz",
    "name": "Lil Wuyn",
    "genres": [
      "vietnamese hip hop",
      "v-pop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb70cb097c71b1b2bab9f1c69a",
    "totalFollowers": 172631,
    "type": "artist"
  },
  {
    "spotifyId": "6NF9Oa4ThQWCj6mogFSrVD",
    "name": "W/N",
    "genres": [
      "v-pop",
      "vietnamese lo-fi",
      "vietnamese hip hop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb316c0f0bc6cf3a29c203ab1e",
    "totalFollowers": 1749749,
    "type": "artist"
  },
  {
    "spotifyId": "0ZbgKh0FgPYeFP38nVaEGp",
    "name": "Obito",
    "genres": [
      "v-pop",
      "vietnamese hip hop",
      "vietnam indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eba385bd3e0f67945f277792c2",
    "totalFollowers": 1225921,
    "type": "artist"
  },
  {
    "spotifyId": "1Z7VMoFxsMu5ZbPJBq5zO8",
    "name": "嚴藝丹",
    "genres": [
      "gufeng",
      "c-pop",
      "mandopop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b2733d8bb7c92d80c2afaaa03ce1",
    "totalFollowers": 13489,
    "type": "artist"
  },
  {
    "spotifyId": "5OAvvoK5e5SrxveVL7CQUX",
    "name": "Fiona Fung",
    "genres": [
      "cantopop"
    ],
    "imageUrl": "https://i.scdn.co/image/ab67616d0000b2735c61e2214b36439e731035d9",
    "totalFollowers": 12193,
    "type": "artist"
  },
  {
    "spotifyId": "5Y8PCl4iNLDIHGkCMi5i76",
    "name": "Ace Hashimoto",
    "genres": [],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb007f4fe808d9cf1b0b08a85d",
    "totalFollowers": 10146,
    "type": "artist"
  },
  {
    "spotifyId": "2u7CP5T30c8ctenzXgEV1W",
    "name": "pH-1",
    "genres": [
      "k-rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5ebb4e1a93443ecd2faf97cc2e1",
    "totalFollowers": 492684,
    "type": "artist"
  },
  {
    "spotifyId": "0UswO8FFKS2tv6dzyNyJLD",
    "name": "Slom",
    "genres": [
      "k-rap"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb1ebcdcd506f1e75b30669cbf",
    "totalFollowers": 34313,
    "type": "artist"
  },
  {
    "spotifyId": "2oNStf3CKKLM5lnzELWMcH",
    "name": "Taichi Mukai",
    "genres": [
      "j-r&b",
      "j-pop",
      "japanese indie"
    ],
    "imageUrl": "https://i.scdn.co/image/ab6761610000e5eb5b2da19cad93661d1f30bbfd",
    "totalFollowers": 138052,
    "type": "artist"
  }
];

const LANGUAGES = [
  "International",
  "Telugu",
  "Hindi",
  "Punjabi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Bengali",
];

export {
  ACTIVITIES, ARTIST_DATA, BROWSE_CATEGORIES, FILTER_TYPES, LANGUAGES, MOODS, NOTIFICATION_FILTERS
};

