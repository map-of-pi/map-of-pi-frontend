export interface Business {
  name: string;
  busineesType: string;
  address: string;
}

export interface IShopData {
  isPiPaymentEnabled: boolean;
  shopName: string | undefined;
  shopType: string;
  shopAddress: string;
  shopDescription: string;
  shopImage: any;
  shopPhone: string;
  shopEmail: string;
}

export interface ICoordinate {
  lat: number;
  long: number;
}

/// DUMMY COORDINATES
export const dummyCoordinates: ICoordinate[] = [
  { lat: 28.1234, long: -15.4365 },
  { lat: 28.1256, long: -15.4342 },
  { lat: 28.1198, long: -15.4301 },
  { lat: 28.1283, long: -15.4389 },
  { lat: 28.1267, long: -15.4432 },
  { lat: 28.1211, long: -15.4467 },
  { lat: 28.1189, long: -15.4355 },
  { lat: 28.1223, long: -15.4398 },
  { lat: 28.1239, long: -15.4421 },
  { lat: 28.1265, long: -15.4347 },
  { lat: 28.1247, long: -15.4321 },
  { lat: 28.1276, long: -15.4312 },
  { lat: 28.1202, long: -15.4376 },
  { lat: 28.1193, long: -15.4409 },
  { lat: 28.1229, long: -15.4445 },
  { lat: 28.1254, long: -15.4387 },
  { lat: 28.1232, long: -15.4336 },
  { lat: 28.1278, long: -15.4392 },
  { lat: 28.1245, long: -15.4359 },
  { lat: 28.1215, long: -15.4412 },
  { lat: 28.1283, long: -15.4389 },
  { lat: 28.1, long: -15.45 },
  { lat: -1.9676713450672898, long: 30.190665829199233 },
  { lat: 28.1267, long: -15.4432 },
  { lat: 28.1211, long: -15.4467 },
  { lat: 28.1189, long: -15.4355 },
  { lat: 28.1223, long: -15.4398 },
  { lat: 30.0444, long: 31.2357 }, // Cairo, Egypt
  { lat: 36.8065, long: 10.1815 }, // Tunis, Tunisia
  { lat: 34.0333, long: -6.85 }, // Rabat, Morocco
  { lat: 35.6895, long: 10.9422 }, // Sfax, Tunisia
  { lat: 32.2808, long: -9.2333 }, // Agadir, Morocco
  { lat: 27.1767, long: 31.1859 }, // Luxor, Egypt
  { lat: 31.6338, long: -8.0083 }, // Marrakesh, Morocco
  { lat: 30.7875, long: 29.7077 }, // Alexandria, Egypt
  { lat: 33.9716, long: -6.8498 }, // Casablanca, Morocco
  { lat: 33.8869, long: 9.5375 }, // Monastir, Tunisia
  // West Africa
  { lat: 6.5244, long: 3.3792 }, // Lagos, Nigeria
  { lat: 6.2094, long: -1.6643 }, // Accra, Ghana
  { lat: 5.560014, long: -0.205744 }, // Tema, Ghana
  { lat: 5.6333, long: -0.2333 }, // Accra, Ghana
  { lat: 9.0579, long: 7.4951 }, // Abuja, Nigeria
  { lat: 6.335, long: 5.627 }, // Ibadan, Nigeria
  { lat: 9.0579, long: 7.4951 }, // Abuja, Nigeria
  { lat: 14.6928, long: -17.4467 }, // Dakar, Senegal
  { lat: 13.4549, long: -16.579 }, // Banjul, Gambia
  { lat: 8.484, long: -13.22994 }, // Freetown, Sierra Leone
  // East Africa
  { lat: -1.2921, long: 36.8219 }, // Nairobi, Kenya
  { lat: -6.1659, long: 39.2026 }, // Dar es Salaam, Tanzania
  { lat: -3.3725, long: 29.3602 }, // Bujumbura, Burundi
  { lat: -1.9536, long: 30.0606 }, // Kigali, Rwanda
  { lat: 0.3136, long: 32.5811 }, // Kampala, Uganda
  { lat: -1.9706, long: 30.1044 }, // Entebbe, Uganda
  { lat: -0.7893, long: 36.8237 }, // Thika, Kenya
  { lat: -0.0236, long: 37.9062 }, // Nakuru, Kenya
  { lat: -4.0435, long: 39.6682 }, // Mombasa, Kenya
  // Central Africa
  { lat: 4.0511, long: 9.7679 }, // Douala, Cameroon
  { lat: 0.3317, long: 6.7311 }, // Libreville, Gabon
  { lat: 3.848, long: 11.5021 }, // Yaoundé, Cameroon
  { lat: 6.1303, long: 1.2163 }, // Lomé, Togo
  { lat: 4.0615, long: 9.7875 }, // Bafoussam, Cameroon
  { lat: 4.0435, long: 9.7043 }, // Buea, Cameroon
  { lat: 4.0667, long: 9.7333 }, // Limbe, Cameroon
  { lat: 2.9404, long: 9.9104 }, // Kribi, Cameroon
  { lat: 3.8667, long: 11.5167 }, // Doumé, Cameroon
  // Southern Africa
  { lat: -25.746, long: 28.1881 }, // Pretoria, South Africa
  { lat: -17.8252, long: 31.0335 }, // Harare, Zimbabwe
  { lat: -33.9249, long: 18.4241 }, // Cape Town, South Africa
  { lat: -19.0154, long: 29.1549 }, // Bulawayo, Zimbabwe
  { lat: -26.2041, long: 28.0473 }, // Johannesburg, South Africa
  { lat: -29.8579, long: 31.0292 }, // Durban, South Africa
  { lat: -22.9576, long: 18.4904 }, // Windhoek, Namibia
  { lat: -22.5597, long: 17.0832 }, // Gaborone, Botswana
  { lat: -22.57, long: 17.083611 }, // Gaborone, Botswana
  { lat: -22.2666, long: 26.7247 }, // Mahalapye, Botswana
  // Other regions
  { lat: 11.8251, long: 42.5903 }, // Djibouti City, Djibouti
  { lat: 12.05, long: -61.75 }, // Saint George's, Grenada
  { lat: -4.4419, long: 15.2663 }, // Brazzaville, Congo
  { lat: -25.746, long: 28.1881 }, // Pretoria, South Africa
  { lat: -17.8252, long: 31.0335 }, // Harare, Zimbabwe
  { lat: -33.9249, long: 18.4241 }, // Cape Town, South Africa
  { lat: -19.0154, long: 29.1549 }, // Bulawayo, Zimbabwe
  { lat: -26.2041, long: 28.0473 }, // Johannesburg, South Africa
  { lat: -29.8579, long: 31.0292 }, // Durban, South Africa
  { lat: -22.9576, long: 18.4904 }, // Windhoek, Namibia
  { lat: -22.5597, long: 17.0832 }, // Gaborone, Botswana
  { lat: -22.57, long: 17.083611 }, // Gaborone, Botswana
  { lat: -22.2666, long: 26.7247 }, // Mahalapye, Botswana
  { lat: 30.033, long: 31.233 }, // Cairo, Egypt
  { lat: 30.0626, long: 31.2497 }, // Heliopolis, Egypt
  { lat: 31.205753, long: 29.924526 }, // Alexandria, Egypt
  { lat: 36.8065, long: 10.1815 }, // Tunis, Tunisia
  { lat: 33.8869, long: 9.5375 }, // Monastir, Tunisia
  { lat: 36.4614, long: 10.7351 }, // Nabeul, Tunisia
  { lat: 33.8948, long: 8.551 }, // Sousse, Tunisia
  { lat: 35.6895, long: 10.9422 }, // Sfax, Tunisia
  { lat: 37.2763, long: 9.8733 }, // Bizerte, Tunisia
  { lat: 30.7875, long: 29.7077 }, // Alexandria, Egypt
  { lat: 31.6338, long: -8.0083 }, // Marrakesh, Morocco
  { lat: 31.7917, long: -7.0926 }, // Ouarzazate, Morocco
  { lat: 33.9716, long: -6.8498 }, // Casablanca, Morocco
  { lat: 34.0333, long: -6.85 }, // Rabat, Morocco
  { lat: 32.2808, long: -9.2333 }, // Agadir, Morocco
  { lat: 27.1767, long: 31.1859 }, // Luxor, Egypt
  { lat: 30.0444, long: 31.2357 }, // Cairo, Egypt
  { lat: 36.8065, long: 10.1815 }, // Tunis, Tunisia
  { lat: 34.0333, long: -6.85 }, // Rabat, Morocco
  { lat: 35.6895, long: 10.9422 }, // Sfax, Tunisia
  { lat: 32.2808, long: -9.2333 }, // Agadir, Morocco
  { lat: 27.1767, long: 31.1859 }, // Luxor, Egypt
  { lat: 31.6338, long: -8.0083 }, // Marrakesh, Morocco
  { lat: 30.7875, long: 29.7077 }, // Alexandria, Egypt
  { lat: 33.9716, long: -6.8498 }, // Casablanca, Morocco
  { lat: 33.8869, long: 9.5375 }, // Monastir, Tunisia
  { lat: 6.5244, long: 3.3792 }, // Lagos, Nigeria
  { lat: 6.2094, long: -1.6643 }, // Accra, Ghana
  { lat: 5.560014, long: -0.205744 }, // Tema, Ghana
  { lat: 5.6333, long: -0.2333 }, // Accra, Ghana
  { lat: 9.0579, long: 7.4951 }, // Abuja, Nigeria
  { lat: 6.335, long: 5.627 }, // Ibadan, Nigeria
  { lat: 9.0579, long: 7.4951 }, // Abuja, Nigeria
  { lat: 14.6928, long: -17.4467 }, // Dakar, Senegal
  { lat: 13.4549, long: -16.579 }, // Banjul, Gambia
  { lat: 8.484, long: -13.22994 }, // Freetown, Sierra Leone
  { lat: -1.9437, long: 30.0596 }, // Gasabo
  { lat: -1.9562, long: 30.0914 }, // Kicukiro
  { lat: -1.9403, long: 30.0658 }, // Nyarugenge

  // Southern Province
  { lat: -2.6042, long: 29.7291 }, // Gisagara
  { lat: -2.2833, long: 29.75 }, // Huye
  { lat: -2.4628, long: 29.5725 }, // Kamonyi
  { lat: -2.0257, long: 29.3491 }, // Muhanga
  { lat: -2.4597, long: 29.5613 }, // Nyanza
  { lat: -2.1233, long: 29.7606 }, // Nyaruguru
  { lat: -2.3707, long: 29.7233 }, // Ruhango

  // Northern Province
  { lat: -1.6957, long: 29.2587 }, // Burera
  { lat: -1.6279, long: 29.7451 }, // Gakenke
  { lat: -1.7322, long: 29.4604 }, // Gicumbi
  { lat: -1.9853, long: 29.6832 }, // Musanze
  { lat: -1.7435, long: 29.4313 }, // Rulindo

  // Eastern Province
  { lat: -1.5303, long: 30.0676 }, // Bugesera
  { lat: -1.9519, long: 30.2516 }, // Gatsibo
  { lat: -2.0008, long: 30.1195 }, // Kayonza
  { lat: -2.4905, long: 30.1341 }, // Kirehe
  { lat: -1.9506, long: 30.4119 }, // Ngoma
  { lat: -2.4098, long: 30.426 }, // Nyagatare

  // Western Province
  { lat: -2.3483, long: 29.6942 }, // Karongi
  { lat: -2.2076, long: 29.0868 }, // Ngororero
  { lat: -2.6033, long: 29.7567 }, // Nyabihu
  { lat: -1.9374, long: 29.9178 }, // Nyamasheke
  { lat: -2.5895, long: 29.7435 }, // Rubavu
  { lat: -2.4535, long: 29.6947 }, // Rusizi
  { lat: -2.5741, long: 29.7454 }, // Rutsiro
  { lat: 51.5074, long: -0.1278 }, // London
  { lat: 52.4862, long: -1.8904 }, // Birmingham
  { lat: 53.4084, long: -2.9916 }, // Liverpool
  { lat: 53.8008, long: -1.5491 }, // Leeds
  { lat: 52.6369, long: -1.1398 }, // Leicester
  { lat: 51.4545, long: -2.5879 }, // Bristol
  { lat: 52.6295, long: -1.123 }, // Coventry
  { lat: 53.4808, long: -2.2426 }, // Manchester
  { lat: 51.4543, long: -0.9781 }, // Reading
  { lat: 51.3758, long: -2.3599 }, // Bath
  { lat: 51.4826, long: -3.1785 }, // Cardiff
  { lat: 52.1307, long: -3.7837 }, // Aberystwyth
  { lat: 50.7184, long: -1.8806 }, // Southampton
  { lat: 52.4068, long: -1.5197 }, // Solihull
  { lat: 50.3755, long: -4.1427 }, // Plymouth
  { lat: 51.45, long: -2.5833 }, // South Gloucestershire
  { lat: 52.1936, long: 0.1561 }, // Cambridge
  { lat: 52.0406, long: -0.7594 }, // Bedford
  { lat: 53.8008, long: -1.5491 }, // Leeds
  { lat: 50.9097, long: -1.4044 }, // Portsmouth

  // Scotland
  { lat: 55.9533, long: -3.1883 }, // Edinburgh
  { lat: 55.8642, long: -4.2518 }, // Glasgow
  { lat: 56.4907, long: -4.2026 }, // Fort William
  { lat: 57.4778, long: -4.2247 }, // Inverness
  { lat: 57.1497, long: -2.0943 }, // Aberdeen
  { lat: 56.343, long: -2.7956 }, // St Andrews
  { lat: 56.0717, long: -3.4523 }, // Falkirk
  { lat: 55.9411, long: -3.1889 }, // Livingston
  { lat: 55.9533, long: -3.1883 }, // Edinburgh
  { lat: 56.4907, long: -4.2026 }, // Fort William

  // Wales
  { lat: 51.4816, long: -3.1791 }, // Cardiff
  { lat: 51.6214, long: -3.9436 }, // Swansea
  { lat: 51.8139, long: -3.0291 }, // Brecon Beacons
  { lat: 51.6472, long: -3.1207 }, // Pontypridd
  { lat: 51.7917, long: -3.229 }, // Merthyr Tydfil
  { lat: 51.8797, long: -3.9861 }, // Carmarthen
  { lat: 52.7101, long: -3.8936 }, // Aberystwyth
  { lat: 53.2765, long: -3.826 }, // Bangor
  { lat: 53.324, long: -3.8305 }, // Conwy
  { lat: 51.4816, long: -3.1791 }, // Cardiff

  // Northern Ireland
  { lat: 54.5973, long: -5.9301 }, // Belfast
  { lat: 54.352, long: -6.6588 }, // Armagh
  { lat: 54.331, long: -6.4323 }, // Dungannon
  { lat: 54.9047, long: -6.2751 }, // Derry
  { lat: 54.6538, long: -5.6639 }, // Bangor
  { lat: 54.338, long: -7.6452 }, // Enniskillen
  { lat: 54.4761, long: -6.3353 }, // Lisburn
  { lat: 54.5207, long: -6.0426 }, // Antrim
  { lat: 54.6194, long: -5.8747 }, // Newtownards
  { lat: 54.5973, long: -5.9301 },

  { lat: 6.5244, long: 3.3792 }, // Lagos
  { lat: 9.0579, long: 7.4951 }, // Abuja
  { lat: 6.5244, long: 7.5603 }, // Onitsha
  { lat: 10.3093, long: 9.8439 }, // Maiduguri
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 10.3167, long: 9.0833 }, // Kano
  { lat: 4.8156, long: 7.0498 }, // Port Harcourt
  { lat: 11.8469, long: 13.1571 }, // Sokoto
  { lat: 5.5557, long: 5.7818 }, // Benin City
  { lat: 7.1907, long: 3.4158 }, // Abeokuta
  { lat: 10.2923, long: 13.2687 }, // Yola
  { lat: 11.9653, long: 8.315 }, // Gusau
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan
  { lat: 7.3775, long: 3.947 }, // Ibadan

  // Egypt
  { lat: 30.0444, long: 31.2357 }, // Cairo
  { lat: 30.0626, long: 31.2497 }, // Heliopolis
  { lat: 31.205753, long: 29.924526 }, // Alexandria
  { lat: 27.1767, long: 31.1859 }, // Luxor
  { lat: 31.7917, long: -7.0926 }, // Ouarzazate
  { lat: 30.7875, long: 29.7077 }, // Alexandria
  { lat: 36.8065, long: 10.1815 }, // Tunis
  { lat: 34.0333, long: -6.85 }, // Rabat
  { lat: 35.6895, long: 10.9422 }, // Sfax
  { lat: 32.2808, long: -9.2333 }, // Agadir
  { lat: 27.1767, long: 31.1859 }, // Luxor
  { lat: 33.9716, long: -6.8498 }, // Casablanca
  { lat: 33.8869, long: 9.5375 }, // Monastir
  { lat: 36.4614, long: 10.7351 }, // Nabeul
  { lat: 33.8948, long: 8.551 }, // Sousse
  { lat: 35.6895, long: 10.9422 }, // Sfax
  { lat: 37.2763, long: 9.8733 }, // Bizerte
  { lat: 31.6338, long: -8.0083 }, // Marrakesh
  { lat: 33.9716, long: -6.8498 }, // Casablanca
  { lat: 33.8869, long: 9.5375 }, // Monastir
  { lat: 36.4614, long: 10.7351 }, // Nabeul
  { lat: 33.8948, long: 8.551 }, // Sousse
  { lat: 35.6895, long: 10.9422 }, // Sfax
  { lat: 37.2763, long: 9.8733 }, // Bizerte

  // Algeria
  { lat: 36.7372, long: 3.087 }, // Algiers
  { lat: 36.2927, long: 1.9836 }, // Constantine
  { lat: 36.7528, long: 3.042 }, // Boumerdès
  { lat: 35.6976, long: 0.6353 }, // Oran
  { lat: 35.5428, long: -0.618 }, // Tlemcen
  { lat: 35.705, long: -0.6253 }, // Tlemcen
  { lat: 35.282, long: 1.645 }, // Béjaïa
  { lat: 36.7651, long: 5.0843 }, // Skikda
  { lat: 36.2439, long: 1.971 }, // Constantine
  { lat: 35.1972, long: 1.6432 }, // Béjaïa
  { lat: 34.8506, long: 0.1403 }, // Tizi Ouzou
  { lat: 37.5665, long: 126.978 }, // Seoul
  { lat: 35.1796, long: 129.0756 }, // Busan
  { lat: 35.8714, long: 128.6014 }, // Daegu
  { lat: 36.3504, long: 127.3845 }, // Daejeon
  { lat: 37.4572, long: 126.7372 }, // Incheon
  { lat: 35.1595, long: 126.8526 }, // Gwangju
  { lat: 35.2321, long: 129.0825 }, // Ulsan
  { lat: 37.9075, long: 127.0596 }, // Gyeonggi
  { lat: 37.8856, long: 127.73 }, // Gangwon
  { lat: 36.8003, long: 127.7007 }, // Chungcheong
  { lat: 35.5413, long: 126.7317 }, // Jeolla
  { lat: 36.5763, long: 128.5053 }, // Gyeongsang
  { lat: 33.4996, long: 126.5312 }, // Jeju
  { lat: 35.5184, long: 129.3624 }, // Gyeongbuk
  { lat: 35.5494, long: 126.9056 }, // Gyeongnam
  { lat: 36.0322, long: 129.3652 }, // Pohang
  { lat: 35.0728, long: 129.052 }, // Yangsan
  { lat: 35.2331, long: 129.0823 }, // Ulsan
  { lat: 36.2008, long: 127.054 }, // Sejong
  { lat: 37.526, long: 127.134 }, // Seoul
  { lat: 37.4486, long: 126.6685 }, // Incheon
  { lat: 35.1667, long: 129.0667 }, // Busan
  { lat: 35.1414, long: 126.793 }, // Gwangju
  { lat: 37.5665, long: 126.978 }, // Seoul
  { lat: 37.2894, long: 127.0082 }, // Suwon
  { lat: 37.2636, long: 127.0286 }, // Bundang
  { lat: 37.5683, long: 126.9778 }, // Jongno
  { lat: 37.2753, long: 127.0094 }, // Yongin
  { lat: 35.2027, long: 128.1227 }, // Gimhae
  { lat: 35.242, long: 128.6811 }, // Changwon
  { lat: 35.1116, long: 126.8512 },
];
