export const LOMBA_LIST = [
  {
    id: "tandu-putra",
    nama: "Tandu Putra",
    biaya: 65000,
    keterangan: "2 orang per tim",
  },
  {
    id: "tandu-putri",
    nama: "Tandu Putri",
    biaya: 65000,
    keterangan: "2 orang per tim",
  },
  {
    id: "pertolongan-pertama",
    nama: "Pertolongan Pertama",
    biaya: 70000,
    keterangan: "4 orang per tim",
  },
  {
    id: "senam-poco-poco",
    nama: "Senam Kreasi Poco-Poco",
    biaya: 75000,
    keterangan: "8–10 orang per tim",
  },
  {
    id: "mojang-jajaka",
    nama: "Mojang Jajaka",
    biaya: 70000,
    keterangan: "2 orang per tim",
  },
  {
    id: "poster",
    nama: "Poster",
    biaya: 50000,
    keterangan: "3 orang per tim",
  }
];

export const ANGGOTA_PER_TIM: Record<string, { min: number; max: number }> = {
  "tandu-putra": { min: 2, max: 2 },
  "tandu-putri": { min: 2, max: 2 },
  "pertolongan-pertama": { min: 4, max: 4 },
  "senam-poco-poco": { min: 8, max: 10 },
  "mojang-jajaka": { min: 2, max: 2 },
  "poster": { min: 3, max: 3 },
};
