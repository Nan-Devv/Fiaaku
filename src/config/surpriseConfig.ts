export interface PetalMessage {
  id: number;
  chapter: string;
  title: string;
  note: string;
}

export interface MemoryPhoto {
  url: string;
  artworkVariant: 'meadow' | 'silhouette' | 'bouquet' | 'lantern';
  title: string;
  date: string;
  caption: string;
  location: string;
}

export const SURPRISE_CONFIG = {
  // 8 digit tanggal spesial untuk membuka gerbang taman rahasia
  passcode: '24022024',
  passcodeHint: 'Masukkan 8 digit tanggal spesial kita (DDMMYYYY)',

  // Nama Panggilan & Pengirim
  wifeName: 'Amiiii',
  husbandName: 'Suamimu',
  birthdayDate: 'THE DAY MY FAVORITE PERSON WAS BORN',
  editionLabel: '04 DECEMBER',

  // Judul & Subjudul Utama
  heroTitle: 'Selamat Ulang Tahun, Fiaaku ',
  heroSubtitle:
    'Di antara setiap perjalanan kehidupan, kehadiranmu selalu menjadi anugerah terindah yang menghadirkan kehangatan, ketenangan, dan makna dalam setiap langkah kita.',

  // Pengaturan Lagu Latar & Suara Sambutan Pria
  bgMusicUrl: '/audio/spesial_songs.mp3',
  bgMusicTitle: 'Melodi Cinta Kita',
  welcomeVoiceUrl: '/audio/suara_abi.mp3',
  welcomeVoiceLabel: 'Suara Sambutan Suamimu',
  welcomeVoiceText:
    'Selamat datang istriku tercinta ini suara asli abi lo hihi.',

  // 12 Bisikan Cinta untuk 12 Kelopak Bunga Matahari Interaktif
  petalMessages: [
    {
      id: 1,
      chapter: 'Kelopak I · Cahaya Pagi',
      title: 'Senyummu Adalah Fajar Terindahku',
      note: 'Di tengah sibuk dan riuhnya dunia, senyuman tulus darimu selalu menjadi tempat ternyaman untuk hatiku pulang. ❤️'
    },
    {
      id: 2,
      chapter: 'Kelopak II · Ketulusan',
      title: 'Hati yang Mekar Penuh Kasih',
      note: 'Cara kamu menjaga cinta dan merawat rumah kecil kita selalu menjadi hal sederhana yang paling aku syukuri. Bersamamu, rumah bukan sekadar tempat pulang, tetapi tempat terbaik untuk merasa bahagia. ❤️'
    },
    {
      id: 3,
      chapter: 'Kelopak III · Melodi',
      title: 'Tawamu Adalah Musik Terindah',
      note: 'Tawamu adalah suara terindah bagiku. Semoga bahagia selalu punya alasan untuk singgah di hatimu. ❤️'
    },
    {
      id: 4,
      chapter: 'Kelopak IV · Keanggunan',
      title: 'Tegar & Lembut di Setiap Musim',
      note: 'Seperti bunga matahari yang selalu mencari cahaya, ketegaran dan kelembutanmu selalu menjadi inspirasiku. ❤️'
    },
    {
      id: 5,
      chapter: 'Kelopak V · Sahabat',
      title: 'Teman Perjalanan Seumur Hidup',
      note: 'Dari cerita sederhana hingga mimpi besar, semuanya terasa lebih indah karena ada kamu di sisiku. ❤️'
    },
    {
      id: 6,
      chapter: 'Kelopak VI · Keteduhan',
      title: 'Pelukan yang Menenangkan Dunia',
      note: 'Di pelukmu, segala lelah terasa reda. Terima kasih telah menjadi rumah ternyaman untukku pulang. 🤍🏡'
    },
    {
      id: 7,
      chapter: 'Kelopak VII · Harapan',
      title: 'Mekarnya Semua Impianmu',
      note: 'Di setiap langkah dan impianmu, aku akan selalu ada untuk mendukungmu. Selamat bertumbuh, cintaku. 🌷✨'
    },
    {
      id: 8,
      chapter: 'Kelopak VIII · Arah',
      title: 'Penerang di Setiap Langkahku',
      note: 'Saat dunia terasa tak pasti, ketulusan hatimu selalu menjadi cahaya yang menuntunku pulang. 🕊️🤍'
    },
    {
      id: 9,
      chapter: 'Kelopak IX · Syukur',
      title: 'Anugerah Terindah dalam Doaku',
      note: 'Di antara segala nikmat kehidupan, hadirmu selalu menjadi salah satu hal yang paling kusyukuri. 🌸'
    },
    {
      id: 10,
      chapter: 'Kelopak X · Harmoni',
      title: 'Lembut Menjaga Cinta Kita',
      note: 'Terima kasih telah mencintaiku dengan segala kurangku dan tetap memilih berjalan bersama. Selamanya, kita saling menggenggam. 🫶🏻'
    },
    {
      id: 11,
      chapter: 'Kelopak XI · Masa Depan',
      title: 'Menua Bersamamu Adalah Impianku',
      note: 'Aku ingin menua bersamamu, menikmati setiap pagi hingga rambut memutih dan cinta kita tetap utuh. 🌅🤍'
    },
    {
      id: 12,
      chapter: 'Kelopak XII · Selamanya',
      title: 'Memilihmu Lagi dan Selamanya',
      note: 'Jika harus memilih seribu kali, aku akan tetap memilihmu sebagai teman hidupku. Selamat ulang tahun, cintaku. Semoga bahagiamu selalu terjaga. 💐❤️'
    }
  ] as PetalMessage[],

  // Surat Cinta di dalam Amplop Segel Lilin Emas
  loveLetter: {
    greeting: 'Untuk Amiiku Tercinta,',
    paragraphs: [
      'Hari ini menjadi hari yang istimewa karena seseorang yang paling berarti dalam hidupku kembali bertambah usia. Ami, jika aku diminta menuliskan semua alasan mengapa aku bersyukur memilikimu, mungkin tidak akan pernah cukup kata untuk menggambarkan betapa berharganya kehadiranmu dalam hidupku.',
      'Seperti bunga matahari yang selalu mencari cahaya, Ami selalu menghadirkan kehangatan, kesabaran, dan ketenangan di rumah kecil kita. Terima kasih sudah menjadi istri yang luar biasa, sahabat terbaik dalam setiap cerita, dan tempat ternyaman untukku pulang setelah melewati panjangnya hari.',
      'Di usia barumu ini, doaku sederhana tetapi sungguh tulus: semoga Tuhan selalu menjaga kesehatanmu, melimpahkan kebahagiaan, dan memudahkan setiap langkahmu dalam meraih semua impian. Selamat ulang tahun, Ami. Semoga senyummu selalu terjaga dan semoga aku bisa terus menjadi bagian dari setiap kebahagiaanmu. 🌻🤍'
    ],
    closing: 'Selamanya mencintaimu,',
    signature: 'Suamimu Tercinta'
  },

  // 4 Foto Kenangan (Ganti / taruh foto di `public/foto/kenangan-1..4.jpg`)
  photos: [
    {
      url: '/foto/kenangan-1.jpg',
      artworkVariant: 'meadow',
      title: 'Hangatnya Langkah Bersama',
      date: 'Bab I · Cahaya Pagi',
      location: 'Lembah Mentari',
      caption:
        'Seperti ladang bunga matahari yang mekar menyambut mentari, bersamamu setiap hari terasa cerah.'
    },
    {
      url: '/foto/kenangan-2.jpg',
      artworkVariant: 'silhouette',
      title: 'Tawa di Bawah Langit Emas',
      date: 'Bab II · Senja Keemasan',
      location: 'Ujung Cakrawala',
      caption:
        'Momen sederhana yang selalu ingin kusimpan abadi di sudut paling hangat dalam ingatan.'
    },
    {
      url: '/foto/kenangan-3.jpg',
      artworkVariant: 'bouquet',
      title: 'Pesona yang Tak Pernah Pudar',
      date: 'Bab III · Musim Mekar',
      location: 'Rumah Kecil Kita',
      caption:
        'Ke mana pun kamu melangkah, kamu selalu membawa kehangatan bagi orang-orang di sekitarmu.'
    },
    {
      url: '/foto/kenangan-4.jpg',
      artworkVariant: 'lantern',
      title: 'Perayaan Cinta & Syukur',
      date: 'Bab IV · Hari Lahirmu',
      location: 'Malam Penuh Doa',
      caption:
        'Selamat ulang tahun untuk wanita terindah yang telah mengubah hidupku menjadi kisah paling berharga.'
    }
  ] as MemoryPhoto[],

  // Video Kenangan
  video: {
    url: '/video/momen-kita.mp4',
    poster: '/foto/poster-video.jpg',
    title: 'Jejak Bahagia Kita',
    caption:
      'Setiap detik bersamamu adalah anugerah terindah yang tak pernah berhenti kusyukuri.'
  },

  // Hadiah Rahasia Mini-Game (Terbuka saat mencapai 200 Poin)
  gameReward: {
    title: 'Kupon Kejutan Spesial Ulang Tahun',
    description:
      'Tukarkan hadiah ini kapan saja: Makan malam romantis berdua & satu keinginan spesial yang langsung kukabulkan tanpa syarat.',
    code: 'LOVE-24022024',
    targetScore: 200
  }
};
