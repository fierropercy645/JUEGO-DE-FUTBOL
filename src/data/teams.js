export const DEFAULT_TEAMS = [
  {
    id: 'atletico-capital',
    name: 'Atlético Capital',
    shortName: 'ATC',
    primaryColor: '#e63946',
    secondaryColor: '#ffffff',
    overall: 84,
    attack: 86,
    defense: 82,
    speed: 85,
    formation: '4-3-3',
    players: [
      { id: 'atc-1', name: 'V. Soto', number: 1, position: 'GK', overall: 83, speed: 70, pass: 68, shotPower: 75, shotAccuracy: 50, defense: 85, ballControl: 70, stamina: 85 },
      { id: 'atc-2', name: 'R. Mendez', number: 4, position: 'DEF', overall: 82, speed: 78, pass: 75, shotPower: 70, shotAccuracy: 60, defense: 84, ballControl: 76, stamina: 88 },
      { id: 'atc-3', name: 'L. Moreno', number: 8, position: 'MID', overall: 85, speed: 82, pass: 88, shotPower: 80, shotAccuracy: 78, defense: 78, ballControl: 87, stamina: 90 },
      { id: 'atc-4', name: 'G. Morales', number: 9, position: 'FWD', overall: 87, speed: 89, pass: 80, shotPower: 90, shotAccuracy: 88, defense: 55, ballControl: 88, stamina: 86 },
      { id: 'atc-5', name: 'A. Rojas', number: 11, position: 'FWD', overall: 84, speed: 88, pass: 82, shotPower: 82, shotAccuracy: 82, defense: 60, ballControl: 85, stamina: 84 },
      // Suplentes de banquillo
      { id: 'atc-6', name: 'M. Ospina', number: 12, position: 'GK', overall: 80, speed: 68, pass: 65, shotPower: 70, shotAccuracy: 50, defense: 81, ballControl: 68, stamina: 84 },
      { id: 'atc-7', name: 'C. Zapata', number: 2, position: 'DEF', overall: 81, speed: 80, pass: 72, shotPower: 68, shotAccuracy: 55, defense: 82, ballControl: 72, stamina: 86 },
      { id: 'atc-8', name: 'J. Quintero', number: 10, position: 'MID', overall: 84, speed: 78, pass: 91, shotPower: 84, shotAccuracy: 84, defense: 60, ballControl: 90, stamina: 80 },
      { id: 'atc-9', name: 'R. Borre', number: 19, position: 'FWD', overall: 82, speed: 85, pass: 76, shotPower: 83, shotAccuracy: 81, defense: 64, ballControl: 82, stamina: 89 }
    ]
  },
  {
    id: 'deportivo-caribe',
    name: 'Deportivo Caribe',
    shortName: 'DCA',
    primaryColor: '#0077b6',
    secondaryColor: '#f3c623',
    overall: 82,
    attack: 83,
    defense: 80,
    speed: 86,
    formation: '4-3-3',
    players: [
      { id: 'dca-1', name: 'K. Navas', number: 1, position: 'GK', overall: 82, speed: 72, pass: 65, shotPower: 70, shotAccuracy: 50, defense: 84, ballControl: 68, stamina: 85 },
      { id: 'dca-2', name: 'D. Mina', number: 3, position: 'DEF', overall: 81, speed: 79, pass: 72, shotPower: 72, shotAccuracy: 58, defense: 83, ballControl: 74, stamina: 86 },
      { id: 'dca-3', name: 'E. James', number: 10, position: 'MID', overall: 84, speed: 81, pass: 89, shotPower: 83, shotAccuracy: 82, defense: 65, ballControl: 89, stamina: 82 },
      { id: 'dca-4', name: 'J. Valencia', number: 7, position: 'FWD', overall: 83, speed: 89, pass: 76, shotPower: 84, shotAccuracy: 83, defense: 50, ballControl: 84, stamina: 85 },
      { id: 'dca-5', name: 'C. Bacca', number: 9, position: 'FWD', overall: 82, speed: 83, pass: 75, shotPower: 85, shotAccuracy: 85, defense: 52, ballControl: 81, stamina: 83 },
      // Suplentes de banquillo
      { id: 'dca-6', name: 'A. Montero', number: 12, position: 'GK', overall: 79, speed: 67, pass: 64, shotPower: 68, shotAccuracy: 48, defense: 80, ballControl: 66, stamina: 83 },
      { id: 'dca-7', name: 'W. Tesillo', number: 6, position: 'DEF', overall: 80, speed: 76, pass: 73, shotPower: 70, shotAccuracy: 52, defense: 81, ballControl: 73, stamina: 85 },
      { id: 'dca-8', name: 'W. Barrios', number: 5, position: 'MID', overall: 83, speed: 80, pass: 79, shotPower: 75, shotAccuracy: 65, defense: 85, ballControl: 80, stamina: 92 },
      { id: 'dca-9', name: 'L. Muriel', number: 19, position: 'FWD', overall: 82, speed: 88, pass: 78, shotPower: 84, shotAccuracy: 82, defense: 50, ballControl: 85, stamina: 80 }
    ]
  },
  {
    id: 'real-montana',
    name: 'Real Montaña',
    shortName: 'RMO',
    primaryColor: '#2b2d42',
    secondaryColor: '#edf2f4',
    overall: 85,
    attack: 85,
    defense: 86,
    speed: 81,
    formation: '4-4-2',
    players: [
      { id: 'rmo-1', name: 'H. Lloris', number: 1, position: 'GK', overall: 85, speed: 68, pass: 70, shotPower: 72, shotAccuracy: 50, defense: 88, ballControl: 72, stamina: 85 },
      { id: 'rmo-2', name: 'S. Ramos', number: 4, position: 'DEF', overall: 86, speed: 76, pass: 78, shotPower: 82, shotAccuracy: 70, defense: 88, ballControl: 79, stamina: 87 },
      { id: 'rmo-3', name: 'T. Kroos', number: 8, position: 'MID', overall: 87, speed: 74, pass: 93, shotPower: 84, shotAccuracy: 85, defense: 75, ballControl: 90, stamina: 86 },
      { id: 'rmo-4', name: 'K. Benzema', number: 9, position: 'FWD', overall: 86, speed: 82, pass: 84, shotPower: 87, shotAccuracy: 88, defense: 58, ballControl: 89, stamina: 85 },
      { id: 'rmo-5', name: 'M. Casemiro', number: 14, position: 'MID', overall: 84, speed: 75, pass: 79, shotPower: 83, shotAccuracy: 72, defense: 87, ballControl: 80, stamina: 89 },
      // Suplentes de banquillo
      { id: 'rmo-6', name: 'A. Lunin', number: 13, position: 'GK', overall: 81, speed: 69, pass: 71, shotPower: 70, shotAccuracy: 50, defense: 82, ballControl: 70, stamina: 84 },
      { id: 'rmo-7', name: 'E. Militao', number: 3, position: 'DEF', overall: 83, speed: 82, pass: 75, shotPower: 74, shotAccuracy: 55, defense: 84, ballControl: 76, stamina: 86 },
      { id: 'rmo-8', name: 'L. Modric', number: 10, position: 'MID', overall: 86, speed: 76, pass: 92, shotPower: 82, shotAccuracy: 84, defense: 74, ballControl: 91, stamina: 82 },
      { id: 'rmo-9', name: 'G. Bale', number: 11, position: 'FWD', overall: 84, speed: 89, pass: 81, shotPower: 90, shotAccuracy: 84, defense: 55, ballControl: 85, stamina: 81 }
    ]
  },
  {
    id: 'union-pacifico',
    name: 'Unión del Pacífico',
    shortName: 'UDP',
    primaryColor: '#2a9d8f',
    secondaryColor: '#e76f51',
    overall: 80,
    attack: 79,
    defense: 81,
    speed: 80,
    formation: '4-4-2',
    players: [
      { id: 'udp-1', name: 'C. Bravo', number: 1, position: 'GK', overall: 80, speed: 68, pass: 74, shotPower: 70, shotAccuracy: 50, defense: 81, ballControl: 74, stamina: 84 },
      { id: 'udp-2', name: 'G. Medel', number: 17, position: 'DEF', overall: 82, speed: 78, pass: 75, shotPower: 76, shotAccuracy: 60, defense: 84, ballControl: 76, stamina: 89 },
      { id: 'udp-3', name: 'A. Vidal', number: 8, position: 'MID', overall: 82, speed: 79, pass: 80, shotPower: 83, shotAccuracy: 79, defense: 82, ballControl: 82, stamina: 92 },
      { id: 'udp-4', name: 'A. Sanchez', number: 7, position: 'FWD', overall: 83, speed: 85, pass: 81, shotPower: 82, shotAccuracy: 82, defense: 62, ballControl: 86, stamina: 85 },
      { id: 'udp-5', name: 'E. Vargas', number: 11, position: 'FWD', overall: 79, speed: 83, pass: 74, shotPower: 81, shotAccuracy: 80, defense: 54, ballControl: 80, stamina: 83 },
      // Suplentes de banquillo
      { id: 'udp-6', name: 'B. Cortes', number: 12, position: 'GK', overall: 78, speed: 68, pass: 68, shotPower: 68, shotAccuracy: 48, defense: 79, ballControl: 68, stamina: 83 },
      { id: 'udp-7', name: 'M. Isla', number: 4, position: 'DEF', overall: 80, speed: 82, pass: 76, shotPower: 72, shotAccuracy: 62, defense: 79, ballControl: 78, stamina: 86 },
      { id: 'udp-8', name: 'C. Aranguiz', number: 20, position: 'MID', overall: 81, speed: 77, pass: 84, shotPower: 78, shotAccuracy: 76, defense: 80, ballControl: 82, stamina: 87 },
      { id: 'udp-9', name: 'B. Brereton', number: 22, position: 'FWD', overall: 80, speed: 82, pass: 73, shotPower: 83, shotAccuracy: 81, defense: 58, ballControl: 79, stamina: 86 }
    ]
  },
  {
    id: 'sporting-central',
    name: 'Sporting Central',
    shortName: 'SPC',
    primaryColor: '#588157',
    secondaryColor: '#ffffff',
    overall: 81,
    attack: 81,
    defense: 81,
    speed: 81,
    formation: '4-3-3',
    players: [
      { id: 'spc-1', name: 'F. Muslera', number: 1, position: 'GK', overall: 80, speed: 67, pass: 66, shotPower: 70, shotAccuracy: 50, defense: 82, ballControl: 67, stamina: 85 },
      { id: 'spc-2', name: 'D. Godin', number: 3, position: 'DEF', overall: 82, speed: 73, pass: 72, shotPower: 74, shotAccuracy: 62, defense: 86, ballControl: 73, stamina: 86 },
      { id: 'spc-3', name: 'F. Valverde', number: 15, position: 'MID', overall: 85, speed: 88, pass: 84, shotPower: 86, shotAccuracy: 82, defense: 80, ballControl: 84, stamina: 94 },
      { id: 'spc-4', name: 'L. Suarez', number: 9, position: 'FWD', overall: 83, speed: 78, pass: 80, shotPower: 88, shotAccuracy: 88, defense: 56, ballControl: 84, stamina: 84 },
      { id: 'spc-5', name: 'D. Nunez', number: 11, position: 'FWD', overall: 82, speed: 89, pass: 74, shotPower: 86, shotAccuracy: 81, defense: 55, ballControl: 81, stamina: 88 },
      // Suplentes de banquillo
      { id: 'spc-6', name: 'S. Rochet', number: 12, position: 'GK', overall: 79, speed: 68, pass: 67, shotPower: 68, shotAccuracy: 48, defense: 80, ballControl: 67, stamina: 84 },
      { id: 'spc-7', name: 'J. Gimenez', number: 2, position: 'DEF', overall: 82, speed: 77, pass: 73, shotPower: 72, shotAccuracy: 54, defense: 84, ballControl: 74, stamina: 85 },
      { id: 'spc-8', name: 'R. Bentancur', number: 6, position: 'MID', overall: 82, speed: 79, pass: 84, shotPower: 80, shotAccuracy: 77, defense: 81, ballControl: 83, stamina: 88 },
      { id: 'spc-9', name: 'E. Cavani', number: 21, position: 'FWD', overall: 82, speed: 78, pass: 77, shotPower: 87, shotAccuracy: 86, defense: 62, ballControl: 82, stamina: 83 }
    ]
  },
  {
    id: 'independiente-norte',
    name: 'Independiente del Norte',
    shortName: 'IDN',
    primaryColor: '#d90429',
    secondaryColor: '#000000',
    overall: 83,
    attack: 84,
    defense: 81,
    speed: 83,
    formation: '4-2-3-1',
    players: [
      { id: 'idn-1', name: 'E. Martinez', number: 23, position: 'GK', overall: 85, speed: 70, pass: 72, shotPower: 74, shotAccuracy: 50, defense: 87, ballControl: 72, stamina: 86 },
      { id: 'idn-2', name: 'C. Romero', number: 13, position: 'DEF', overall: 83, speed: 80, pass: 74, shotPower: 70, shotAccuracy: 58, defense: 86, ballControl: 77, stamina: 87 },
      { id: 'idn-3', name: 'R. De Paul', number: 7, position: 'MID', overall: 83, speed: 81, pass: 83, shotPower: 81, shotAccuracy: 78, defense: 79, ballControl: 83, stamina: 93 },
      { id: 'idn-4', name: 'L. Messi', number: 10, position: 'FWD', overall: 90, speed: 85, pass: 94, shotPower: 89, shotAccuracy: 95, defense: 48, ballControl: 96, stamina: 80 },
      { id: 'idn-5', name: 'J. Alvarez', number: 9, position: 'FWD', overall: 83, speed: 86, pass: 80, shotPower: 84, shotAccuracy: 84, defense: 66, ballControl: 84, stamina: 90 },
      // Suplentes de banquillo
      { id: 'idn-6', name: 'F. Armani', number: 1, position: 'GK', overall: 80, speed: 68, pass: 68, shotPower: 70, shotAccuracy: 50, defense: 81, ballControl: 68, stamina: 84 },
      { id: 'idn-7', name: 'N. Otamendi', number: 19, position: 'DEF', overall: 82, speed: 72, pass: 74, shotPower: 74, shotAccuracy: 56, defense: 84, ballControl: 75, stamina: 85 },
      { id: 'idn-8', name: 'A. Mac Allister', number: 20, position: 'MID', overall: 84, speed: 79, pass: 87, shotPower: 82, shotAccuracy: 81, defense: 77, ballControl: 85, stamina: 89 },
      { id: 'idn-9', name: 'A. Di Maria', number: 11, position: 'FWD', overall: 84, speed: 84, pass: 88, shotPower: 84, shotAccuracy: 86, defense: 54, ballControl: 88, stamina: 81 }
    ]
  },
  {
    id: 'deportivo-aurora',
    name: 'Deportivo Aurora',
    shortName: 'DAU',
    primaryColor: '#7209b7',
    secondaryColor: '#4cc9f0',
    overall: 79,
    attack: 80,
    defense: 78,
    speed: 82,
    formation: '4-3-3',
    players: [
      { id: 'dau-1', name: 'P. Gallese', number: 1, position: 'GK', overall: 80, speed: 70, pass: 68, shotPower: 70, shotAccuracy: 50, defense: 81, ballControl: 68, stamina: 85 },
      { id: 'dau-2', name: 'L. Advincula', number: 17, position: 'DEF', overall: 79, speed: 88, pass: 73, shotPower: 75, shotAccuracy: 64, defense: 78, ballControl: 77, stamina: 88 },
      { id: 'dau-3', name: 'R. Tapia', number: 13, position: 'MID', overall: 80, speed: 76, pass: 79, shotPower: 78, shotAccuracy: 70, defense: 82, ballControl: 78, stamina: 87 },
      { id: 'dau-4', name: 'C. Cueva', number: 10, position: 'MID', overall: 79, speed: 80, pass: 84, shotPower: 76, shotAccuracy: 78, defense: 55, ballControl: 85, stamina: 78 },
      { id: 'dau-5', name: 'G. Lapadula', number: 9, position: 'FWD', overall: 80, speed: 80, pass: 74, shotPower: 83, shotAccuracy: 82, defense: 60, ballControl: 80, stamina: 86 },
      // Suplentes de banquillo
      { id: 'dau-6', name: 'C. Caceda', number: 12, position: 'GK', overall: 77, speed: 67, pass: 65, shotPower: 67, shotAccuracy: 48, defense: 78, ballControl: 66, stamina: 83 },
      { id: 'dau-7', name: 'C. Zambrano', number: 5, position: 'DEF', overall: 79, speed: 75, pass: 72, shotPower: 72, shotAccuracy: 52, defense: 81, ballControl: 73, stamina: 85 },
      { id: 'dau-8', name: 'Y. Yotun', number: 19, position: 'MID', overall: 79, speed: 76, pass: 82, shotPower: 76, shotAccuracy: 75, defense: 76, ballControl: 80, stamina: 84 },
      { id: 'dau-9', name: 'P. Guerrero', number: 14, position: 'FWD', overall: 79, speed: 73, pass: 76, shotPower: 85, shotAccuracy: 84, defense: 55, ballControl: 81, stamina: 78 }
    ]
  },
  {
    id: 'estrella-del-sur',
    name: 'Estrella del Sur',
    shortName: 'EDS',
    primaryColor: '#ffb703',
    secondaryColor: '#023047',
    overall: 82,
    attack: 83,
    defense: 81,
    speed: 84,
    formation: '4-3-3',
    players: [
      { id: 'eds-1', name: 'Alisson', number: 1, position: 'GK', overall: 86, speed: 72, pass: 75, shotPower: 72, shotAccuracy: 50, defense: 88, ballControl: 76, stamina: 86 },
      { id: 'eds-2', name: 'Marquinhos', number: 4, position: 'DEF', overall: 85, speed: 81, pass: 77, shotPower: 70, shotAccuracy: 56, defense: 87, ballControl: 78, stamina: 86 },
      { id: 'eds-3', name: 'Casemiro', number: 5, position: 'MID', overall: 84, speed: 74, pass: 80, shotPower: 84, shotAccuracy: 74, defense: 86, ballControl: 81, stamina: 88 },
      { id: 'eds-4', name: 'Vinicius Jr', number: 7, position: 'FWD', overall: 88, speed: 95, pass: 82, shotPower: 84, shotAccuracy: 85, defense: 50, ballControl: 92, stamina: 90 },
      { id: 'eds-5', name: 'Rodrygo', number: 11, position: 'FWD', overall: 84, speed: 89, pass: 83, shotPower: 83, shotAccuracy: 84, defense: 54, ballControl: 87, stamina: 87 },
      // Suplentes de banquillo
      { id: 'eds-6', name: 'Ederson', number: 12, position: 'GK', overall: 85, speed: 71, pass: 80, shotPower: 74, shotAccuracy: 50, defense: 86, ballControl: 78, stamina: 85 },
      { id: 'eds-7', name: 'E. Militao', number: 3, position: 'DEF', overall: 84, speed: 83, pass: 76, shotPower: 72, shotAccuracy: 55, defense: 85, ballControl: 77, stamina: 87 },
      { id: 'eds-8', name: 'B. Guimaraes', number: 8, position: 'MID', overall: 83, speed: 78, pass: 85, shotPower: 79, shotAccuracy: 78, defense: 81, ballControl: 84, stamina: 91 },
      { id: 'eds-9', name: 'Endrick', number: 9, position: 'FWD', overall: 81, speed: 88, pass: 74, shotPower: 85, shotAccuracy: 82, defense: 52, ballControl: 83, stamina: 85 }
    ]
  }
];
