export const boardroles = {
  president: {
    fr: "président",
    en: "president",
    de: "Präsident",
    nl: "voorzitter",
  },
  vice_president: {
    fr: "vice-président",
    en: "vice president",
    de: "Vizepräsident",
    nl: "vicevoorzitter",
  },
  secretary: {
    fr: "secrétaire",
    en: "secretary",
    de: "Sekretär",
    nl: "secretaris",
  },
  treasurer: {
    fr: "trésorier",
    en: "treasurer",
    de: "Schatzmeister",
    nl: "penningmeester",
  },
  tournament_director: {
    fr: "directeur de tournoi",
    en: "tournament director",
    de: "Turnierleiter",
    nl: "toernooileider",
  },
  youth_director: {
    fr: "directeur de jeunesse",
    en: "youth director",
    de: "Jugendleiter",
    nl: "jeugdleider",
  },
  interclub_director: {
    fr: "directeur d'interclubs",
    en: "interclub director",
    de: "Interclubleiter",
    nl: "verantwoordlijke interclub",
  },
  webmaster: {
    fr: "webmaster",
    en: "webmaster",
    de: "Webmaster",
    nl: "webmaster",
  },
  bar_manager: {
    fr: "responsable du bar",
    en: "bar manager",
    de: "Barleiter",
    nl: "barmanager",
  },
  press_officer: {
    fr: "attaché de presse",
    en: "press manager",
    de: "Pressesprecher",
    nl: "persverantwoordelijke",
  },
};

export const CLUB_STATUS = {
  CONSULTING: 0,
  MODIFYING: 1,
};

export const EMPTY_BOARD = {
  president: { idnumber: 0 },
  vice_president: { idnumber: 0 },
  secretary: { idnumber: 0 },
  treasurer: { idnumber: 0 },
  tournament_director: { idnumber: 0 },
  youth_director: { idnumber: 0 },
  interclub_director: { idnumber: 0 },
  webmaster: { idnumber: 0 },
  bar_manager: { idnumber: 0 },
  press_officer: { idnumber: 0 },
};

export const visibility_items = [
  { text: "Hidden", value: "HIDDEN" },
  { text: "Club", value: "CLUB" },
  { text: "Public", value: "PUBLIC" },
];

export const EMPTY_CLUB = {
  venue: "",
  address: "",
  openinghours: {},
};

export const ROLES = ["ClubAdmin", "InterclubAdmin"];
