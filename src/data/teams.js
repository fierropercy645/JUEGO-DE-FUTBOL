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
      { id: 'atc-5', name: 'A. Rojas', number: 11, position: 'FWD', overall: 84, speed: 88, pass: 82, shotPower: 82, shotAccuracy: 82, defense: 60, ballControl: 85, stamina: 84 }
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
      { id: 'dca-5', name: 'C. Bacca', number: 9, position: 'FWD', overall: 82, speed: 83, pass: 75, shotPower: 85, shotAccuracy: 85, defense: 52, ballControl: 81, stamina: 83 }
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
      { id: 'rmo-5', name: 'M. Casemiro', number: 14, position: 'MID', overall: 84, speed: 75, pass: 79, shotPower: 83, shotAccuracy: 72, defense: 87, ballControl: 80, stamina: 89 }
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
      { id: 'udp-5', name: 'E. Vargas', number: 11, position: 'FWD', overall: 79, speed: 83, pass: 74, shotPower: 81, shotAccuracy: 80, defense: 54, ballControl: 80, stamina: 83 }
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
      { id: 'spc-5', name: 'D. Nunez', number: 11, position: 'FWD', overall: 82, speed: 89, pass: 74, shotPower: 86, shotAccuracy: 81, defense: 55, ballControl: 81, stamina: 88 }
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
      { id: 'idn-5', name: 'J. Alvarez', number: 9, position: 'FWD', overall: 83, speed: 86, pass: 80, shotPower: 84, shotAccuracy: 84, defense: 66, ballControl: 84, stamina: 90 }
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
      { id: 'dau-5', name: 'G. Lapadula', number: 9, position: 'FWD', overall: 80, speed: 80, pass: 74, shotPower: 83, shotAccuracy: 82, defense: 60, ballControl: 80, stamina: 86 }
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
      { id: 'eds-5', name: 'Rodrygo', number: 11, position: 'FWD', overall: 84, speed: 89, pass: 83, shotPower: 83, shotAccuracy: 84, defense: 54, ballControl: 87, stamina: 87 }
    ]
  }
];
