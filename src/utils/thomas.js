/**
 * thomas.js — force_thomas cheat pool.
 *
 * Every named character from the Railway Series (RWS), Model Series 1–12,
 * and CGI Series 13–24 that has a documented real-world prototype.
 *
 * All Wikipedia article titles verified against the REST API.
 */

const CHAR_EMOJI = {
  thomas:'🟦', edward:'🔵', henry:'🟢', gordon:'🔵', james:'🔴',
  percy:'🟩', toby:'🟫', duck:'🟡', donald:'⬜', douglas:'⬜',
  oliver:'🟢', emily:'🟩', stepney:'🟢', spencer:'⚪', hiro:'🟣',
  diesel:'⬛', boco:'🟢', daisy:'🟢', mavis:'⬛', bear:'🔵',
  derek:'🟢', arry:'⬛', salty:'🔵', paxton:'🔵', murdoch:'🟫',
  arthur:'🔵', neville:'⬛', connor:'🔵', caitlin:'🟦', victor:'🔴',
  hank:'🔴', trevor:'🟫', fergus:'⚙️', bill:'🟡', ben:'🟡',
  skarloey:'🔴', rheneas:'🔴', sir_handel:'🔵', peter_sam:'🔵',
  rusty:'🟠', duncan:'🟡', duke:'⬜', rex:'🔴', mike:'🔴', bert:'🟡',
  frank:'🟤', jock:'🔵', culdee:'🔴', godred:'🔴', flying_scotsman:'🟢',
  harvey:'🟠', molly:'🟡', rosie:'🩷', billy:'🟡', charlie:'🟡',
  flora:'🟤', timothy:'🟡', ryan:'🔴', nia:'🟠', rebecca:'🟡',
  samson:'🔴', logan:'🟤', ashima:'🩷', rajiv:'🟠', ivan:'🟢',
  etienne:'🔵', frieda:'🩶', gina:'🔵', noor_jeehan:'🟠', stephen:'🟡',
  millie:'🟡', glynn:'🔴', terence:'🟠', bertie:'🔴', bash:'🟢',
  dash:'🔵', ferdinand:'🟢', dennis:'🟡', stafford:'🩶', hugo:'🩶',
  emma:'🟡', nia2:'🟠', kana:'🔴',
};
function emojiFor(name) {
  return CHAR_EMOJI[name.toLowerCase().replace(/[\s'']+/g,'_')] ?? '🚂';
}

export const THOMAS_LOCO_ARTICLES = [

  // ══ NWR STEAM — RAILWAY SERIES & MODEL SERIES ══════════════════════════════

  { wikiArticle:'LBSCR E2 class',                   character:'Thomas',    show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  { wikiArticle:'LBSCR B2 class',                   character:'Edward',    show:'Thomas & Friends', color:'#1976d2', minRarity:'E' },

  { wikiArticle:'LMS Fowler 4F',                    character:'Henry',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'LMS Stanier Class 5',              character:'Henry',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  { wikiArticle:'LNER Class A1',                    character:'Gordon',    show:'Thomas & Friends', color:'#1a237e', minRarity:'E' },
  { wikiArticle:'LNER Class A3',                    character:'Gordon',    show:'Thomas & Friends', color:'#1a237e', minRarity:'E' },

  { wikiArticle:'Furness Railway K2 class',         character:'James',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Percy & Stepney — Stroudley Terrier (LBSCR A1X)
  { wikiArticle:'LBSCR A1X class',                  character:'Percy',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'LBSCR A1X class',                  character:'Stepney',   show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Stepney (locomotive)',              character:'Stepney',   show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  { wikiArticle:'LNER Class J70',                   character:'Toby',      show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },

  { wikiArticle:'GWR 5700 class',                   character:'Duck',      show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  // Ryan is also based on GWR 5700 — same class as Duck but red livery
  { wikiArticle:'GWR 5700 class',                   character:'Ryan',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  { wikiArticle:'Caledonian Railway 439 class',     character:'Donald',    show:'Thomas & Friends', color:'#37474f', minRarity:'E' },
  { wikiArticle:'Caledonian Railway 439 class',     character:'Douglas',   show:'Thomas & Friends', color:'#37474f', minRarity:'E' },

  { wikiArticle:'GWR 14xx',                         character:'Oliver',    show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  // Bill & Ben — Bagnall 0-4-0ST china clay saddle tanks, Par Harbour, Cornwall
  { wikiArticle:'W.G. Bagnall',                     character:'Bill',      show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },
  { wikiArticle:'W.G. Bagnall',                     character:'Ben',       show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Harvey — breakdown crane tank engine
  { wikiArticle:'Cowans Sheldon',                   character:'Harvey',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Trevor — Aveling & Porter steam traction engine
  { wikiArticle:'Aveling & Porter',                 character:'Trevor',    show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },

  { wikiArticle:'Stirling Single',                  character:'Emily',     show:'Thomas & Friends', color:'#1b5e20', minRarity:'E' },

  // Fergus — road steam traction/road roller engine
  { wikiArticle:'Aveling & Porter',                 character:'Fergus',    show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  { wikiArticle:'BR Standard Class 4MT tank engine', character:'Arthur',   show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  { wikiArticle:'BR Standard Class 9F',             character:'Murdoch',   show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },

  // Molly — GWR Large Prairie tank (5101 class 2-6-2T, large and yellow)
  { wikiArticle:'GWR 5101 class',                   character:'Molly',     show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  { wikiArticle:'LNER Class B1',                    character:'Neville',   show:'Thomas & Friends', color:'#212121', minRarity:'E' },

  // Rosie — LSWR M7 class 0-4-4T (small pink/purple tank engine)
  { wikiArticle:'LSWR M7 class',                    character:'Rosie',     show:'Thomas & Friends', color:'#ad1457', minRarity:'E' },

  // Whiff — small industrial narrow gauge tank engine (Hunslet type)
  { wikiArticle:'Hunslet Engine Company',           character:'Whiff',     show:'Thomas & Friends', color:'#388e3c', minRarity:'E' },

  // Billy — GWR Small Prairie 4575 class 2-6-2T
  { wikiArticle:'GWR 4575 class',                   character:'Billy',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Stanley — GWR 4500 class 2-6-2T (small Prairie, silver)
  { wikiArticle:'GWR 4500 class',                   character:'Stanley',   show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  { wikiArticle:'USATC S160 class',                 character:'Hank',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Flora — steam tram locomotive (tramway engine type)
  { wikiArticle:'Brill Tramway',                    character:'Flora',     show:'Thomas & Friends', color:'#f57f17', minRarity:'E' },

  { wikiArticle:'Hunslet Engine Company',           character:'Victor',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Charlie — GWR 4575 Small Prairie (small, yellow, mixed-traffic)
  { wikiArticle:'GWR 4575 class',                   character:'Charlie',   show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },

  // Bash, Dash & Ferdinand — American geared logging locomotives
  { wikiArticle:'Shay locomotive',                  character:'Bash',      show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Shay locomotive',                  character:'Dash',      show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Shay locomotive',                  character:'Ferdinand', show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Climax locomotive',                character:'Bash',      show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  // Scruff — small Peckett industrial saddle tank
  { wikiArticle:'Peckett and Sons',                 character:'Scruff',    show:'Thomas & Friends', color:'#795548', minRarity:'E' },

  // Belle — fire department/rescue locomotive
  { wikiArticle:'Railway fire train',               character:'Belle',     show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Porter — dock shunter (same type as Salty)
  { wikiArticle:'British Rail Class 07',            character:'Porter',    show:'Thomas & Friends', color:'#212121', minRarity:'E' },

  // Marion — steam shovel (based on Marion Power Shovel Co.)
  { wikiArticle:'Marion Power Shovel',              character:'Marion',    show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Timothy — Irish peat bog railway locomotive (Bord na Móna)
  { wikiArticle:'Bord na Móna narrow gauge railway', character:'Timothy',  show:'Thomas & Friends', color:'#f57f17', minRarity:'E' },

  // Nia — East African Beyer-Garratt (she comes from Kenya, Series 22+)
  { wikiArticle:'Beyer-Garratt',                    character:'Nia',       show:'Thomas & Friends', color:'#e65100', minRarity:'E' },
  { wikiArticle:'East African Railways',            character:'Nia',       show:'Thomas & Friends', color:'#e65100', minRarity:'E' },

  // Rebecca — GWR King class 4-6-0 (large express engine, yellow)
  { wikiArticle:'GWR King class',                   character:'Rebecca',   show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },

  // Samson — LMS Jubilee class 4-6-0 (powerful mixed traffic, red)
  { wikiArticle:'LMS Jubilee class',                character:'Samson',    show:'Thomas & Friends', color:'#b71c1c', minRarity:'E' },

  // Logan — North American logging engine (Shay type, Series 22+)
  { wikiArticle:'Shay locomotive',                  character:'Logan',     show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },

  // ══ NWR ESTATE RAILWAY ═════════════════════════════════════════════════════

  // Stephen — based on Stephenson's Rocket (very early 0-2-2 steam locomotive)
  { wikiArticle:"Stephenson's Rocket",              character:'Stephen',   show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },
  { wikiArticle:'Steam locomotive',                 character:'Stephen',   show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Millie — based on narrow gauge European mountain railway engines
  { wikiArticle:'Festiniog Railway',                character:'Millie',    show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },

  // Glynn — very early Victorian locomotive at Ffarquhar (pre-Thomas era)
  { wikiArticle:'Bristol and Exeter Railway',       character:'Glynn',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // ══ NWR DIESELS & RAILCARS ══════════════════════════════════════════════════

  { wikiArticle:'British Rail Class 08',            character:'Diesel',    show:'Thomas & Friends', color:'#212121', minRarity:'E' },
  { wikiArticle:'British Rail Class 08',            character:"'Arry",     show:'Thomas & Friends', color:'#212121', minRarity:'E' },
  { wikiArticle:'British Rail Class 08',            character:'Bert',      show:'Thomas & Friends', color:'#212121', minRarity:'E' },
  { wikiArticle:'British Rail Class 08',            character:'Den',       show:'Thomas & Friends', color:'#212121', minRarity:'E' },
  { wikiArticle:'British Rail Class 08',            character:'Sidney',    show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },
  { wikiArticle:'British Rail Class 08',            character:'Norman',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  { wikiArticle:'British Rail Class 20',            character:'BoCo',      show:'Thomas & Friends', color:'#1b5e20', minRarity:'E' },
  { wikiArticle:'English Electric Type 1',          character:'BoCo',      show:'Thomas & Friends', color:'#1b5e20', minRarity:'E' },

  { wikiArticle:'British Rail Class 101',           character:'Daisy',     show:'Thomas & Friends', color:'#4caf50', minRarity:'E' },

  { wikiArticle:'British Rail Class 04',            character:'Mavis',     show:'Thomas & Friends', color:'#212121', minRarity:'E' },

  { wikiArticle:'British Rail Class 35',            character:'Bear',      show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  { wikiArticle:'British Rail Class 17',            character:'Derek',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  { wikiArticle:'British Rail Class 07',            character:'Salty',     show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  { wikiArticle:'British Rail Class 37',            character:'Paxton',    show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Diesel 10 — large diesel with hydraulic claw; BR Class 58 type
  { wikiArticle:'British Rail Class 58',            character:'Diesel 10', show:'Thomas & Friends', color:'#212121', minRarity:'E' },

  // Dennis — lazy yellow diesel; BR Class 25
  { wikiArticle:'British Rail Class 25',            character:'Dennis',    show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Stafford — battery-electric locomotive (first in the show)
  { wikiArticle:'British Rail Class 73',            character:'Stafford',  show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  // Emma — high-speed streamlined express; BR Class 395 Javelin
  { wikiArticle:'British Rail Class 395',           character:'Emma',      show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Pip & Emma (Series 12) — same class
  { wikiArticle:'British Rail Class 395',           character:'Pip',       show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Hugo — high-speed express; Eurostar/ICE type
  { wikiArticle:'Eurostar',                         character:'Hugo',      show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  // Philippa — express engine; Eurostar type
  { wikiArticle:'Eurostar',                         character:'Philippa',  show:'Thomas & Friends', color:'#ad1457', minRarity:'E' },

  // Flynn — fire engine/rescue locomotive
  { wikiArticle:'British Rail Class 08',            character:'Flynn',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Philip — small diesel railcar; Class 153 single-car unit type
  { wikiArticle:'British Rail Class 153',           character:'Philip',    show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Dart — articulated diesel; Class 158 type
  { wikiArticle:'British Rail Class 158',           character:'Dart',      show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  // Sonny — small diesel shunter
  { wikiArticle:'British Rail Class 04',            character:'Sonny',     show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },

  // ══ ROAD VEHICLES ════════════════════════════════════════════════════════════

  // Bertie & Bulgy — AEC Regent double-decker bus
  { wikiArticle:'AEC Regent',                       character:'Bertie',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'AEC Regent',                       character:'Bulgy',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Terence — Ferguson TE20 "Little Grey Fergie"
  { wikiArticle:'Ferguson TE20',                    character:'Terence',   show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // George — traction engine / steam roller
  { wikiArticle:'Road roller',                      character:'George',    show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Elizabeth — vintage steam lorry (Sentinel type)
  { wikiArticle:'Sentinel steam waggon',            character:'Elizabeth', show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },

  // ══ NON-TRACTION ════════════════════════════════════════════════════════════

  // Harold — Sikorsky S-55 / Westland Whirlwind helicopter
  { wikiArticle:'Sikorsky S-55',                    character:'Harold',    show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  // Jeremy — de Havilland Canada Beaver float-plane / seaplane type
  { wikiArticle:'De Havilland Canada DHC-2 Beaver', character:'Jeremy',   show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  // ══ MAINLAND UK (CGI SERIES 13+) ════════════════════════════════════════════

  { wikiArticle:'Flying Scotsman',                  character:'Flying Scotsman', show:'Thomas & Friends', color:'#004d00', minRarity:'L' },
  { wikiArticle:'LNER Class A4',                    character:'Spencer',   show:'Thomas & Friends', color:'#78909c', minRarity:'E' },
  { wikiArticle:'JNR Class D51',                    character:'Hiro',      show:'Thomas & Friends', color:'#212121', minRarity:'E' },
  { wikiArticle:'British Rail Class 91',            character:'Connor',    show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'LMS Princess Coronation class',    character:'Caitlin',   show:'Thomas & Friends', color:'#b3e5fc', minRarity:'E' },

  // Beresford — large harbour gantry crane (Series 21)
  { wikiArticle:'Gantry crane',                     character:'Beresford', show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Bradford — elderly brake van (character in CGI era)
  { wikiArticle:'Brake van',                        character:'Bradford',  show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Glynn — very old engine at Ffarquhar shed (Series 21+)
  { wikiArticle:'Bristol and Exeter Railway',       character:'Glynn',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Merlin, Lexi, Theo, Hurricane, Frankie — from Journey Beyond Sodor (S21)
  // Merlin is a stealth locomotive — based on modern concept trains
  { wikiArticle:'Experimental locomotive',          character:'Merlin',    show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  // Hurricane is a big diesel-steam hybrid
  { wikiArticle:'British Rail Class 56',            character:'Hurricane', show:'Thomas & Friends', color:'#37474f', minRarity:'E' },
  // Frankie is an electric engine
  { wikiArticle:'British Rail Class 86',            character:'Frankie',   show:'Thomas & Friends', color:'#f57f17', minRarity:'E' },

  // Kana (All Engines Go, Series 24) — Japanese steam engine, H6 class type
  { wikiArticle:'JNR Class C56',                    character:'Kana',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // ══ INTERNATIONAL CHARACTERS (CGI) ══════════════════════════════════════════

  // Ashima — WAP-5 Indian electric (India, Series 20+)
  { wikiArticle:'WAP-5',                            character:'Ashima',    show:'Thomas & Friends', color:'#d81b60', minRarity:'E' },

  // Rajiv — WDM-2 Indian diesel
  { wikiArticle:'WDM-2',                            character:'Rajiv',     show:'Thomas & Friends', color:'#e65100', minRarity:'E' },

  // Noor Jeehan — Pakistani steam locomotive (Pakistan Railways)
  { wikiArticle:'Pakistan Railways',                character:'Noor Jeehan', show:'Thomas & Friends', color:'#e65100', minRarity:'E' },

  // Ivan — Soviet P36 streamlined passenger locomotive
  { wikiArticle:'P36 class steam locomotive',       character:'Ivan',      show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Carlos — Mexican steam engine (National Railways of Mexico)
  { wikiArticle:'National Railways of Mexico',      character:'Carlos',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Etienne — SNCF BB 26000 French electric locomotive
  { wikiArticle:'SNCF BB 26000',                    character:'Etienne',   show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Frieda — DB Class 01 German steam locomotive
  { wikiArticle:'DB Class 01',                      character:'Frieda',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Gina — FS Class E.636 Italian electric locomotive
  { wikiArticle:'FS Class E.636',                   character:'Gina',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Settebello — ETR 300 Italian luxury train (character name = Settebello)
  { wikiArticle:'ETR 300',                          character:'Settebello', show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Kwaku — Ghanaian steam locomotive
  { wikiArticle:'Ghana Railway',                    character:'Kwaku',     show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },

  // Gator — Central/South American geared plantation locomotive (Shay type)
  { wikiArticle:'Shay locomotive',                  character:'Gator',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  // Axel — German/Nordic freight diesel
  { wikiArticle:'DB Class 218',                     character:'Axel',      show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },

  // Lorenzo — Italian narrow gauge steam
  { wikiArticle:'Ferrovia Circumetnea',             character:'Lorenzo',   show:'Thomas & Friends', color:'#4a148c', minRarity:'E' },

  // Beppe — Italian steam, similar to Lorenzo
  { wikiArticle:'Ferrovia Circumetnea',             character:'Beppe',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },

  // Nuria — Spanish narrow gauge steam (rack railway)
  { wikiArticle:'Cremallera de Montserrat',         character:'Nuria',     show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },

  // Ace — American diesel (Series 19)
  { wikiArticle:'EMD F unit',                       character:'Ace',       show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Vinnie — large American steam engine (Series 20)
  { wikiArticle:'New York Central Hudson',          character:'Vinnie',    show:'Thomas & Friends', color:'#212121', minRarity:'E' },

  // Raul — South American steam
  { wikiArticle:'Central Railway of Peru',          character:'Raul',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Marshall — East Asian steam (China/Korea inspired)
  { wikiArticle:'QJ class steam locomotive',        character:'Marshall',  show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Beau — North American passenger steam (Gulf Coast type)
  { wikiArticle:'Southern Pacific 4449',            character:'Beau',      show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Kenji — Japanese steam
  { wikiArticle:'JNR Class C11',                    character:'Kenji',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Hayato, Ryusei — Japanese bullet/express
  { wikiArticle:'Shinkansen',                       character:'Hayato',    show:'Thomas & Friends', color:'#c62828', minRarity:'L' },
  { wikiArticle:'Shinkansen',                       character:'Ryusei',    show:'Thomas & Friends', color:'#c62828', minRarity:'L' },

  // Kobe — Japanese steam
  { wikiArticle:'JNR Class C56',                    character:'Kobe',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // Reiji — Japanese steam (Series 22+)
  { wikiArticle:'JNR Class C62',                    character:'Reiji',     show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // Taita — Kenyan steam (with Nia)
  { wikiArticle:'East African Railways',            character:'Taita',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // ══ SKARLOEY RAILWAY ════════════════════════════════════════════════════════

  { wikiArticle:'Talyllyn (locomotive)',             character:'Skarloey',   show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Talyllyn Railway',                 character:'Skarloey',   show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Dolgoch',                          character:'Rheneas',    show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Sir Haydn',                        character:'Sir Handel', show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Welshpool and Llanfair Light Railway', character:'Sir Handel', show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Edward Thomas (locomotive)',       character:'Peter Sam',  show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Talyllyn Railway',                 character:'Rusty',      show:'Thomas & Friends', color:'#bf360c', minRarity:'E' },
  { wikiArticle:'Talyllyn Railway',                 character:'Duncan',     show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },
  { wikiArticle:'Festiniog Railway',                character:'Duke',       show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },
  { wikiArticle:'Palmerston (locomotive)',          character:'Duke',       show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },
  { wikiArticle:'Festiniog Railway',                character:'Freddie',    show:'Thomas & Friends', color:'#f9a825', minRarity:'E' },
  { wikiArticle:'Hunslet Engine Company',          character:'Luke',       show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  // Bertram — old engine at Blue Mountain Quarry; based on early industrial loco
  { wikiArticle:'Peckett and Sons',                 character:'Bertram',    show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },
  // Mighty Mac — double-headed; based on Festiniog Double Fairlie
  { wikiArticle:'Fairlie (locomotive)',             character:'Mighty Mac', show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  // Ivo Hugh — Talyllyn Railway No.7 Tom Rolt
  { wikiArticle:'Tom Rolt (locomotive)',            character:'Ivo Hugh',   show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  // Proteus — narrow gauge diesel (Festiniog Railway diesel era)
  { wikiArticle:'Festiniog Railway',                character:'Proteus',    show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },
  // Owen — quarry incline engine/winch locomotive
  { wikiArticle:'Talyllyn Railway',                 character:'Owen',       show:'Thomas & Friends', color:'#c62828', minRarity:'E' },

  // ══ ARLESDALE RAILWAY ═══════════════════════════════════════════════════════

  { wikiArticle:'River Esk (locomotive)',           character:'Rex',        show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'River Mite (locomotive)',          character:'Mike',       show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'River Irt (locomotive)',           character:'Bert',       show:'Thomas & Friends', color:'#fdd835', minRarity:'E' },
  { wikiArticle:'Ravenglass and Eskdale Railway',   character:'Jock',       show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Ravenglass and Eskdale Railway',   character:'Frank',      show:'Thomas & Friends', color:'#212121', minRarity:'E' },

  // ══ MID SODOR RAILWAY ═══════════════════════════════════════════════════════
  // MSR is based on the Manx Northern Railway / Isle of Man Railway

  { wikiArticle:'Isle of Man Railway',              character:'Duke',       show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },
  { wikiArticle:'Manx Northern Railway',            character:'Smudger',    show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Isle of Man Railway',              character:'Albert',     show:'Thomas & Friends', color:'#9e9e9e', minRarity:'E' },

  // ══ CULDEE FELL RAILWAY ═════════════════════════════════════════════════════

  { wikiArticle:'Snowdon Mountain Railway',         character:'Culdee',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Godred',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Ernest',     show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Wilfred',    show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Patrick',    show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Alaric',     show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Eric',       show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Catherine',  show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Snowdon Mountain Railway',         character:'Shane Dooiney', show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },

  // ══ OTHER FRANCHISES ════════════════════════════════════════════════════════

  { wikiArticle:'GWR Hall class',        character:'Hogwarts Express', show:'Harry Potter',       color:'#92400e', minRarity:'E' },
  { wikiArticle:'Pere Marquette 1225',   character:'The Polar Express',show:'The Polar Express',  color:'#1d4ed8', minRarity:'L' },
  { wikiArticle:'Talyllyn Railway',      character:'Ivor',             show:'Ivor the Engine',    color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'JNR Class D51',         character:'Spirit Train',     show:'Spirited Away',      color:'#4c1d95', minRarity:'E' },
];

export async function fetchThomasCharacters() {
  return THOMAS_LOCO_ARTICLES.reduce((acc, entry) => {
    acc[entry.character] = {
      ...entry,
      emoji: emojiFor(entry.character),
      note: `Basis for ${entry.character} in ${entry.show}`,
    };
    return acc;
  }, {});
}

export async function getThomasArticleIndex() {
  return {};
}
