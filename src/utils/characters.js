import { getCharacterColour } from './trainColour.js';

/**
 * STATIC_CHARACTERS — every T&F character from RWS through Series 24
 * that has a documented real-world Wikipedia source.
 *
 * Key corrections from old broken titles:
 *   "GNR Stirling Single"        → "Stirling Single"
 *   "GWR 1400 class"             → "GWR 14xx"
 *   "GWR 57xx"                   → "GWR 5700 class"
 *   "BR Standard Class 4MT"      → "BR Standard Class 4MT tank engine"
 *   "LBSCR D1 class"             → "LBSCR A1X class"
 *   "Peter Sam (locomotive)"     → "Edward Thomas (locomotive)"
 *   "GER Class J70"              → "LNER Class J70"
 */

export const STATIC_CHARACTERS = {

  // ── Thomas ──────────────────────────────────────────────────────────────────
  'LBSCR E2 class': { character:'Thomas', show:'Thomas & Friends', color:getCharacterColour('Thomas'),
    note:'Thomas the Tank Engine is based on the LBSCR E2 class 0-6-0 side tank, designed by Lawson Billinton 1913.', minRarity:'E' },

  // ── Edward ──────────────────────────────────────────────────────────────────
  'LBSCR B2 class': { character:'Edward', show:'Thomas & Friends', color:getCharacterColour('Edward'),
    note:'Edward the Blue Engine is based on the LBSCR B2 class 4-4-0.', minRarity:'E' },

  // ── Henry ───────────────────────────────────────────────────────────────────
  'LMS Fowler 4F': { character:'Henry', show:'Thomas & Friends', color:getCharacterColour('Henry'),
    note:"Henry is based on the LMS Fowler 4F 0-6-0 — Awdry's stated prototype.", minRarity:'E' },
  'LMS Stanier Class 5': { character:'Henry', show:'Thomas & Friends', color:getCharacterColour('Henry'),
    note:'Henry also resembles the LMS Stanier Class 5 (Black Five) mixed-traffic engine.', minRarity:'E' },

  // ── Gordon ──────────────────────────────────────────────────────────────────
  'LNER Class A1': { character:'Gordon', show:'Thomas & Friends', color:getCharacterColour('Gordon'),
    note:"Gordon the Big Engine is based on the Gresley A1 Pacific — the original 'big engine'.", minRarity:'E' },
  'LNER Class A3': { character:'Gordon', show:'Thomas & Friends', color:getCharacterColour('Gordon'),
    note:'Gordon is based on the LNER A3 class — the class of Flying Scotsman.', minRarity:'E' },

  // ── James ───────────────────────────────────────────────────────────────────
  'Furness Railway K2 class': { character:'James', show:'Thomas & Friends', color:getCharacterColour('James'),
    note:'James the Red Engine is based on the Furness Railway K2 class 2-6-0 tender engine.', minRarity:'E' },

  // ── Percy ───────────────────────────────────────────────────────────────────
  'LBSCR A1X class': { character:'Percy', show:'Thomas & Friends', color:getCharacterColour('Percy'),
    note:'Percy is based on the Stroudley LBSCR A1X "Terrier" — a small 0-6-0T also known as Stepney\'s class.', minRarity:'E' },

  // ── Toby ────────────────────────────────────────────────────────────────────
  'LNER Class J70': { character:'Toby', show:'Thomas & Friends', color:getCharacterColour('Toby'),
    note:'Toby the Tram Engine is based on the GER/LNER J70 tram locomotive — a steam engine built for road tramways.', minRarity:'E' },

  // ── Duck ────────────────────────────────────────────────────────────────────
  'GWR 5700 class': { character:'Duck', show:'Thomas & Friends', color:getCharacterColour('Duck'),
    note:'Duck is based on the GWR 5700 class 0-6-0 pannier tank — over 800 were built, the largest GWR class.', minRarity:'E' },

  // ── Donald & Douglas ────────────────────────────────────────────────────────
  'Caledonian Railway 439 class': { character:'Donald', show:'Thomas & Friends', color:getCharacterColour('Donald'),
    note:'Donald and Douglas are both based on the Caledonian Railway 439 class 0-4-4T — identical Scottish twins.', minRarity:'E' },

  // ── Oliver ──────────────────────────────────────────────────────────────────
  'GWR 14xx': { character:'Oliver', show:'Thomas & Friends', color:getCharacterColour('Oliver'),
    note:'Oliver is based on the GWR 14xx class 0-4-2T auto-tank locomotive, used on rural branch lines with push-pull coaches.', minRarity:'E' },

  // ── Bill & Ben ──────────────────────────────────────────────────────────────
  'W.G. Bagnall': { character:'Bill', show:'Thomas & Friends', color:getCharacterColour('Bill'),
    note:'Bill and Ben are based on a pair of W.G. Bagnall 0-4-0ST saddle tanks that worked the china clay industry at Par Harbour, Cornwall.', minRarity:'E' },

  // ── Harvey ──────────────────────────────────────────────────────────────────
  'Cowans Sheldon': { character:'Harvey', show:'Thomas & Friends', color:getCharacterColour('Harvey'),
    note:'Harvey is based on a Cowans Sheldon railway breakdown crane locomotive — a specialised crane tank used for recovery work.', minRarity:'E' },

  // ── Trevor ──────────────────────────────────────────────────────────────────
  'Aveling & Porter': { character:'Trevor', show:'Thomas & Friends', color:getCharacterColour('Trevor'),
    note:"Trevor the Traction Engine is based on an Aveling & Porter steam road locomotive — a classic Victorian traction engine.", minRarity:'E' },

  // ── Emily ───────────────────────────────────────────────────────────────────
  'Stirling Single': { character:'Emily', show:'Thomas & Friends', color:getCharacterColour('Emily'),
    note:'Emily is based on the Stirling Single — a GNR 4-2-2 express engine famous for its enormous single driving wheel.', minRarity:'E' },

  // ── Fergus ──────────────────────────────────────────────────────────────────
  // (Note: Aveling & Porter also covers Fergus as a steam traction/road engine)

  // ── Spencer ─────────────────────────────────────────────────────────────────
  'LNER Class A4': { character:'Spencer', show:'Thomas & Friends', color:getCharacterColour('Spencer'),
    note:'Spencer the Silver Engine is based on the LNER Class A4 streamlined Pacific — the class of Mallard and Flying Scotsman.', minRarity:'E' },

  // ── Stepney ─────────────────────────────────────────────────────────────────
  'Stepney (locomotive)': { character:'Stepney', show:'Thomas & Friends', color:getCharacterColour('Stepney'),
    note:'Stepney the Bluebell Engine is based directly on No.55 Stepney — a preserved LBSCR A1X Terrier at the Bluebell Railway.', minRarity:'E' },

  // ── Arthur ──────────────────────────────────────────────────────────────────
  'BR Standard Class 4MT tank engine': { character:'Arthur', show:'Thomas & Friends', color:getCharacterColour('Arthur'),
    note:'Arthur is based on the BR Standard Class 4MT 2-6-4T — a powerful mixed-traffic tank engine built from 1951.', minRarity:'E' },

  // ── Murdoch ─────────────────────────────────────────────────────────────────
  'BR Standard Class 9F': { character:'Murdoch', show:'Thomas & Friends', color:getCharacterColour('Murdoch'),
    note:'Murdoch is based on the BR Standard Class 9F 2-10-0 — the most powerful and last British steam class built.', minRarity:'E' },

  // ── Molly ───────────────────────────────────────────────────────────────────
  'GWR 5101 class': { character:'Molly', show:'Thomas & Friends', color:getCharacterColour('Molly'),
    note:'Molly is based on the GWR 5101 class Large Prairie 2-6-2T — a large, powerful mixed-traffic tank engine.', minRarity:'E' },

  // ── Neville ─────────────────────────────────────────────────────────────────
  'LNER Class B1': { character:'Neville', show:'Thomas & Friends', color:getCharacterColour('Neville'),
    note:'Neville is based on the LNER Class B1 4-6-0 — a reliable mixed-traffic locomotive with a powerful, no-nonsense appearance.', minRarity:'E' },

  // ── Rosie ───────────────────────────────────────────────────────────────────
  'LSWR M7 class': { character:'Rosie', show:'Thomas & Friends', color:getCharacterColour('Rosie'),
    note:'Rosie is based on the LSWR M7 class 0-4-4T — a small, versatile Adams tank engine used on suburban and branch services.', minRarity:'E' },

  // ── Whiff ───────────────────────────────────────────────────────────────────
  'Hunslet Engine Company': { character:'Whiff', show:'Thomas & Friends', color:getCharacterColour('Whiff'),
    note:'Whiff is based on a Hunslet industrial narrow gauge tank engine — the type used in quarries and waste facilities.', minRarity:'E' },

  // ── Billy ───────────────────────────────────────────────────────────────────
  'GWR 4575 class': { character:'Billy', show:'Thomas & Friends', color:getCharacterColour('Billy'),
    note:'Billy is based on the GWR 4575 class Small Prairie 2-6-2T — a compact mixed-traffic tank engine.', minRarity:'E' },

  // ── Stanley ─────────────────────────────────────────────────────────────────
  'GWR 4500 class': { character:'Stanley', show:'Thomas & Friends', color:getCharacterColour('Stanley'),
    note:'Stanley the silver engine is based on the GWR 4500 class Small Prairie 2-6-2T — a nimble Churchward branch-line tank.', minRarity:'E' },

  // ── Hank ────────────────────────────────────────────────────────────────────
  'USATC S160 class': { character:'Hank', show:'Thomas & Friends', color:getCharacterColour('Hank'),
    note:'Hank the American Engine is based on the USATC S160 class 2-8-0 — over 2,000 were shipped to Britain during WW2.', minRarity:'E' },

  // ── Flora ───────────────────────────────────────────────────────────────────
  'Brill Tramway': { character:'Flora', show:'Thomas & Friends', color:getCharacterColour('Flora'),
    note:'Flora the steam tram engine is based on locomotives of the Brill Tramway — a rural GWR steam tramway in Buckinghamshire.', minRarity:'E' },

  // ── Victor ──────────────────────────────────────────────────────────────────
  'Hunslet Engine Company': { character:'Victor', show:'Thomas & Friends', color:getCharacterColour('Victor'),
    note:'Victor is based on a Hunslet narrow gauge industrial saddle tank locomotive — a type common in quarries worldwide.', minRarity:'E' },

  // ── Charlie ─────────────────────────────────────────────────────────────────
  'GWR 4575 class': { character:'Charlie', show:'Thomas & Friends', color:getCharacterColour('Charlie'),
    note:'Charlie is based on the GWR 4575 class Small Prairie 2-6-2T — compact, cheerful, and good for all kinds of work.', minRarity:'E' },

  // ── Bash, Dash & Ferdinand ──────────────────────────────────────────────────
  'Shay locomotive': { character:'Bash', show:'Thomas & Friends', color:getCharacterColour('Bash'),
    note:'Bash is based on a Shay locomotive — the most common geared steam engine used in American logging railways.', minRarity:'E' },
  'Climax locomotive': { character:'Dash', show:'Thomas & Friends', color:getCharacterColour('Dash'),
    note:'Dash is based on a Climax locomotive — another popular geared steam engine used on steep logging railroads.', minRarity:'E' },
  'Shay locomotive': { character:'Ferdinand', show:'Thomas & Friends', color:getCharacterColour('Ferdinand'),
    note:'Ferdinand is based on a large Shay locomotive — the heavy-duty geared steam engines of North American logging railways.', minRarity:'E' },

  // ── Scruff ──────────────────────────────────────────────────────────────────
  'Peckett and Sons': { character:'Scruff', show:'Thomas & Friends', color:getCharacterColour('Scruff'),
    note:'Scruff is based on a Peckett and Sons industrial saddle tank — a small, tough locomotive used in collieries and yards.', minRarity:'E' },

  // ── Marion ──────────────────────────────────────────────────────────────────
  'Marion Power Shovel': { character:'Marion', show:'Thomas & Friends', color:getCharacterColour('Marion'),
    note:'Marion is based on a Marion Power Shovel steam excavator — the same company whose name she shares.', minRarity:'E' },

  // ── Timothy ─────────────────────────────────────────────────────────────────
  'Bord na Móna narrow gauge railway': { character:'Timothy', show:'Thomas & Friends', color:getCharacterColour('Timothy'),
    note:"Timothy is based on a Bord na Móna peat railway locomotive — Ireland's vast narrow-gauge peat bog railway network.", minRarity:'E' },

  // ── Nia ─────────────────────────────────────────────────────────────────────
  'Beyer-Garratt': { character:'Nia', show:'Thomas & Friends', color:getCharacterColour('Nia'),
    note:'Nia from Kenya is based on a Beyer-Garratt articulated steam locomotive — the powerful double-engine type used across East Africa.', minRarity:'E' },
  'East African Railways': { character:'Nia', show:'Thomas & Friends', color:getCharacterColour('Nia'),
    note:'Nia is inspired by East African Railways motive power — specifically the Kenyan Garratt locomotives.', minRarity:'E' },

  // ── Rebecca ─────────────────────────────────────────────────────────────────
  'GWR King class': { character:'Rebecca', show:'Thomas & Friends', color:getCharacterColour('Rebecca'),
    note:'Rebecca is based on the GWR King class 4-6-0 — the most powerful GWR express locomotive, a true prestige engine.', minRarity:'E' },

  // ── Ryan ────────────────────────────────────────────────────────────────────
  'GWR 5700 class': { character:'Ryan', show:'Thomas & Friends', color:getCharacterColour('Ryan'),
    note:'Ryan is based on the GWR 5700 class pannier tank — the same class as Duck but in NWR red livery.', minRarity:'E' },

  // ── Samson ──────────────────────────────────────────────────────────────────
  'LMS Jubilee class': { character:'Samson', show:'Thomas & Friends', color:getCharacterColour('Samson'),
    note:'Samson is based on the LMS Jubilee class 4-6-0 — a large, powerful mixed-traffic express steam engine.', minRarity:'E' },

  // ── Logan ───────────────────────────────────────────────────────────────────
  'Shay locomotive': { character:'Logan', show:'Thomas & Friends', color:getCharacterColour('Logan'),
    note:'Logan is based on a Shay geared steam locomotive — used in North American logging railways on steep, winding tracks.', minRarity:'E' },

  // ── Estate Railway ──────────────────────────────────────────────────────────
  "Stephenson's Rocket": { character:'Stephen', show:'Thomas & Friends', color:getCharacterColour('Stephen'),
    note:"Stephen is based on Stephenson's Rocket — the iconic 1829 locomotive that won the Rainhill Trials and began the railway age.", minRarity:'L' },
  'Festiniog Railway': { character:'Millie', show:'Thomas & Friends', color:getCharacterColour('Millie'),
    note:'Millie is based on narrow gauge engines of the Festiniog Railway — the famous slate-hauling mountain railway of Wales.', minRarity:'E' },
  'Bristol and Exeter Railway': { character:'Glynn', show:'Thomas & Friends', color:getCharacterColour('Glynn'),
    note:'Glynn is based on an early Bristol and Exeter Railway broad-gauge locomotive — one of the earliest engines to serve Ffarquhar.', minRarity:'E' },

  // ── NWR Diesels & Specials ──────────────────────────────────────────────────
  'British Rail Class 08': { character:'Diesel', show:'Thomas & Friends', color:getCharacterColour('Diesel'),
    note:'Diesel is based on the BR Class 08 0-6-0 diesel electric shunter — the most numerous British locomotive class, with over 1,000 built.', minRarity:'E' },
  'British Rail Class 20': { character:'BoCo', show:'Thomas & Friends', color:getCharacterColour('BoCo'),
    note:'BoCo is based on the BR Class 20 (English Electric Type 1) diesel locomotive — a distinctive Bo-Co wheel arrangement.', minRarity:'E' },
  'English Electric Type 1': { character:'BoCo', show:'Thomas & Friends', color:getCharacterColour('BoCo'),
    note:'BoCo is based on the English Electric Type 1, later BR Class 20.', minRarity:'E' },
  'British Rail Class 101': { character:'Daisy', show:'Thomas & Friends', color:getCharacterColour('Daisy'),
    note:'Daisy is based on the BR Class 101 DMU — an iconic diesel multiple unit used across British branch lines from 1956.', minRarity:'E' },
  'British Rail Class 04': { character:'Mavis', show:'Thomas & Friends', color:getCharacterColour('Mavis'),
    note:'Mavis is based on the BR Class 04 Drewry diesel shunter — a small, lightweight diesel used in quarries and yards.', minRarity:'E' },
  'British Rail Class 35': { character:'Bear', show:'Thomas & Friends', color:getCharacterColour('Bear'),
    note:"Bear is based on the BR Class 35 Hymek diesel-hydraulic — known for its distinctive sound, hence Bear's humming.", minRarity:'E' },
  'British Rail Class 17': { character:'Derek', show:'Thomas & Friends', color:getCharacterColour('Derek'),
    note:"Derek is based on the BR Class 17 Clayton — notorious for unreliability, perfectly matching Derek's character.", minRarity:'E' },
  'British Rail Class 07': { character:'Salty', show:'Thomas & Friends', color:getCharacterColour('Salty'),
    note:'Salty is based on the BR Class 07 Ruston & Hornsby dock shunter — built specifically for maritime dock work.', minRarity:'E' },
  'British Rail Class 37': { character:'Paxton', show:'Thomas & Friends', color:getCharacterColour('Paxton'),
    note:'Paxton is based on the BR Class 37 English Electric diesel — a reliable workhorse used in quarries and freight work.', minRarity:'E' },
  'British Rail Class 58': { character:'Diesel 10', show:'Thomas & Friends', color:getCharacterColour('Diesel 10'),
    note:'Diesel 10 is based on the BR Class 58 large freight diesel — given his fearsome hydraulic claw "Pinchy".', minRarity:'E' },
  'British Rail Class 25': { character:'Dennis', show:'Thomas & Friends', color:getCharacterColour('Dennis'),
    note:'Dennis is based on the BR Class 25 diesel — a dependable but workmanlike type, matching his lazy personality.', minRarity:'E' },
  'British Rail Class 73': { character:'Stafford', show:'Thomas & Friends', color:getCharacterColour('Stafford'),
    note:'Stafford the battery/electric locomotive is based on the BR Class 73 electro-diesel — capable of running on both electric power and its own diesel.', minRarity:'E' },
  'British Rail Class 395': { character:'Emma', show:'Thomas & Friends', color:getCharacterColour('Emma'),
    note:"Emma is based on the BR Class 395 Javelin — a high-speed 225 km/h EMU used on the UK's HS1.", minRarity:'E' },
  'British Rail Class 395': { character:'Pip', show:'Thomas & Friends', color:getCharacterColour('Pip'),
    note:'Pip (Series 12) is based on the BR Class 395 Javelin — a high-speed multiple unit.', minRarity:'E' },
  'Eurostar': { character:'Hugo', show:'Thomas & Friends', color:getCharacterColour('Hugo'),
    note:'Hugo the high-speed engine is based on the Eurostar — the international train that runs through the Channel Tunnel.', minRarity:'E' },
  'Eurostar': { character:'Philippa', show:'Thomas & Friends', color:getCharacterColour('Philippa'),
    note:'Philippa is based on the Eurostar — the Channel Tunnel high-speed train.', minRarity:'E' },
  'British Rail Class 153': { character:'Philip', show:'Thomas & Friends', color:getCharacterColour('Philip'),
    note:'Philip is based on the BR Class 153 single-car diesel unit — a cheerful, independently-minded small railcar.', minRarity:'E' },
  'British Rail Class 158': { character:'Dart', show:'Thomas & Friends', color:getCharacterColour('Dart'),
    note:'Dart is based on the BR Class 158 Express Sprinter DMU — a modern express diesel multiple unit.', minRarity:'E' },

  // ── Road Vehicles ───────────────────────────────────────────────────────────
  'AEC Regent': { character:'Bertie', show:'Thomas & Friends', color:getCharacterColour('Bertie'),
    note:'Bertie the Bus is based on the AEC Regent — the classic British double-decker bus, beloved on routes across the UK.', minRarity:'E' },
  'Ferguson TE20': { character:'Terence', show:'Thomas & Friends', color:getCharacterColour('Terence'),
    note:"Terence the Tractor is based on the Ferguson TE20 — the famous 'Little Grey Fergie' that transformed British farming.", minRarity:'E' },
  'Sentinel steam waggon': { character:'Elizabeth', show:'Thomas & Friends', color:getCharacterColour('Elizabeth'),
    note:'Elizabeth the vintage lorry is based on a Sentinel steam wagon — a heavy road vehicle that competed with the railways.', minRarity:'E' },

  // ── Non-Traction ────────────────────────────────────────────────────────────
  'Sikorsky S-55': { character:'Harold', show:'Thomas & Friends', color:getCharacterColour('Harold'),
    note:'Harold the Helicopter is based on the Sikorsky S-55 — a utility helicopter used in search and rescue operations.', minRarity:'E' },
  'De Havilland Canada DHC-2 Beaver': { character:'Jeremy', show:'Thomas & Friends', color:getCharacterColour('Jeremy'),
    note:'Jeremy the Seaplane is based on the de Havilland Canada DHC-2 Beaver — a classic STOL bush/float-plane.', minRarity:'E' },

  // ── Mainland UK (CGI series) ─────────────────────────────────────────────────
  'Flying Scotsman': { character:'Flying Scotsman', show:'Thomas & Friends', color:getCharacterColour('Flying Scotsman'),
    note:'Flying Scotsman appears as himself — the world-famous preserved LNER A3 locomotive, first to reach 100 mph.', minRarity:'L' },
  'British Rail Class 91': { character:'Connor', show:'Thomas & Friends', color:getCharacterColour('Connor'),
    note:'Connor the streamlined blue engine is based on the BR Class 91 electric (InterCity 225) — capable of 225 km/h.', minRarity:'E' },
  'LMS Princess Coronation class': { character:'Caitlin', show:'Thomas & Friends', color:getCharacterColour('Caitlin'),
    note:"Caitlin is based on the LMS Princess Coronation class 4-6-2 — Britain's most powerful steam express locomotive.", minRarity:'E' },
  'JNR Class D51': { character:'Hiro', show:'Thomas & Friends', color:getCharacterColour('Hiro'),
    note:"Hiro the Japanese engine is based on the JNR Class D51 — Japan's most-built steam locomotive with over 1,100 constructed.", minRarity:'E' },
  'LMS Jubilee class': { character:'Samson', show:'Thomas & Friends', color:getCharacterColour('Samson'),
    note:'Samson is based on the LMS Jubilee class 4-6-0 — a large powerful express engine named after notable figures.', minRarity:'E' },
  'BR Standard Class 91': { character:'Connor', show:'Thomas & Friends', color:getCharacterColour('Connor'),
    note:'Connor the high-speed engine is based on the BR Class 91 electric locomotive.', minRarity:'E' },

  // ── International (CGI series) ───────────────────────────────────────────────
  'WAP-5': { character:'Ashima', show:'Thomas & Friends', color:getCharacterColour('Ashima'),
    note:'Ashima the Indian engine is based on the WAP-5 — Indian Railways high-speed AC electric locomotive.', minRarity:'E' },
  'WDM-2': { character:'Rajiv', show:'Thomas & Friends', color:getCharacterColour('Rajiv'),
    note:'Rajiv is based on the WDM-2 — the most common diesel locomotive in Indian Railways history.', minRarity:'E' },
  'P36 class steam locomotive': { character:'Ivan', show:'Thomas & Friends', color:getCharacterColour('Ivan'),
    note:'Ivan the Russian engine is based on the P36 class — the last Soviet mainline steam locomotive, famous for streamlined elegance.', minRarity:'E' },
  'DB Class 01': { character:'Frieda', show:'Thomas & Friends', color:getCharacterColour('Frieda'),
    note:'Frieda is based on the DB Class 01 — the flagship German express steam locomotive of the Deutsche Bundesbahn.', minRarity:'E' },
  'SNCF BB 26000': { character:'Etienne', show:'Thomas & Friends', color:getCharacterColour('Etienne'),
    note:'Etienne the French engine is based on the SNCF BB 26000 — a powerful French dual-voltage electric locomotive.', minRarity:'E' },
  'FS Class E.636': { character:'Gina', show:'Thomas & Friends', color:getCharacterColour('Gina'),
    note:'Gina is based on the FS Class E.636 — an iconic Italian electric locomotive used across Italian main lines.', minRarity:'E' },
  'ETR 300': { character:'Settebello', show:'Thomas & Friends', color:getCharacterColour('Settebello'),
    note:'Settebello is based on the ETR 300 — Italy\'s luxury 200 km/h streamlined express train of the 1950s.', minRarity:'E' },
  'Shinkansen': { character:'Hayato', show:'Thomas & Friends', color:getCharacterColour('Hayato'),
    note:'Hayato is based on the Shinkansen — Japan\'s famous bullet train network, operating since 1964.', minRarity:'L' },
  'JNR Class C62': { character:'Reiji', show:'Thomas & Friends', color:getCharacterColour('Reiji'),
    note:'Reiji is based on the JNR Class C62 — Japan\'s fastest and most powerful steam express locomotive.', minRarity:'E' },
  'JNR Class C56': { character:'Kana', show:'Thomas & Friends', color:getCharacterColour('Kana'),
    note:'Kana (All Engines Go) is based on the JNR Class C56 — a lightweight Japanese steam engine exported to SE Asia.', minRarity:'E' },
  'JNR Class C11': { character:'Kenji', show:'Thomas & Friends', color:getCharacterColour('Kenji'),
    note:'Kenji is based on the JNR Class C11 — a compact Japanese tank engine popular for branch-line work.', minRarity:'E' },
  'East African Railways': { character:'Taita', show:'Thomas & Friends', color:getCharacterColour('Taita'),
    note:'Taita is inspired by East African Railways locomotives — the powerful steam engines of Kenya and Uganda.', minRarity:'E' },
  'Pakistan Railways': { character:'Noor Jeehan', show:'Thomas & Friends', color:getCharacterColour('Noor Jeehan'),
    note:'Noor Jeehan is based on Pakistan Railways motive power — the steam and diesel locomotives of South Asian railways.', minRarity:'E' },
  'National Railways of Mexico': { character:'Carlos', show:'Thomas & Friends', color:getCharacterColour('Carlos'),
    note:'Carlos the Mexican engine is based on locomotives of the National Railways of Mexico.', minRarity:'E' },
  'EMD F unit': { character:'Ace', show:'Thomas & Friends', color:getCharacterColour('Ace'),
    note:'Ace is based on the EMD F unit — the iconic streamlined American diesel locomotive that epitomises 1950s US rail.', minRarity:'E' },
  'New York Central Hudson': { character:'Vinnie', show:'Thomas & Friends', color:getCharacterColour('Vinnie'),
    note:'Vinnie is based on the New York Central Hudson class 4-6-4 — a famous American streamlined passenger locomotive.', minRarity:'E' },
  'QJ class steam locomotive': { character:'Marshall', show:'Thomas & Friends', color:getCharacterColour('Marshall'),
    note:'Marshall is based on the QJ class — China\'s most-built steam locomotive with over 4,700 constructed.', minRarity:'E' },
  'DB Class 218': { character:'Axel', show:'Thomas & Friends', color:getCharacterColour('Axel'),
    note:'Axel the German diesel is based on the DB Class 218 — a workhorse diesel-hydraulic used across German branch lines.', minRarity:'E' },
  'Ghana Railway': { character:'Kwaku', show:'Thomas & Friends', color:getCharacterColour('Kwaku'),
    note:'Kwaku is based on locomotives of Ghana Railway — the West African narrow-gauge network.', minRarity:'E' },
  'Ferrovia Circumetnea': { character:'Lorenzo', show:'Thomas & Friends', color:getCharacterColour('Lorenzo'),
    note:'Lorenzo is based on locomotives of the Ferrovia Circumetnea — a narrow-gauge Sicilian railway circling Mount Etna.', minRarity:'E' },
  'Cremallera de Montserrat': { character:'Nuria', show:'Thomas & Friends', color:getCharacterColour('Nuria'),
    note:'Nuria is based on the Cremallera de Montserrat — the Spanish mountain rack railway climbing to Montserrat monastery.', minRarity:'E' },
  'Central Railway of Peru': { character:'Raul', show:'Thomas & Friends', color:getCharacterColour('Raul'),
    note:'Raul is based on locomotives of the Central Railway of Peru — the world\'s highest railway, climbing the Andes.', minRarity:'E' },
  'Southern Pacific 4449': { character:'Beau', show:'Thomas & Friends', color:getCharacterColour('Beau'),
    note:'Beau is based on the Southern Pacific 4449 — a preserved American streamlined "Daylight" passenger steam locomotive.', minRarity:'E' },

  // ══ SKARLOEY RAILWAY ════════════════════════════════════════════════════════
  'Talyllyn (locomotive)': { character:'Skarloey', show:'Thomas & Friends', color:getCharacterColour('Skarloey'),
    note:'Skarloey is based on Talyllyn No.1 — the original Talyllyn Railway locomotive, built 1865, still operating today.', minRarity:'E' },
  'Talyllyn Railway': { character:'Skarloey', show:'Thomas & Friends', color:getCharacterColour('Skarloey'),
    note:"The Skarloey Railway is modelled entirely on the Talyllyn Railway — the world's first preserved railway.", minRarity:'E' },
  'Dolgoch': { character:'Rheneas', show:'Thomas & Friends', color:getCharacterColour('Rheneas'),
    note:'Rheneas is based on Dolgoch — Talyllyn Railway No.2, built 1866, which kept the line running single-handedly in 1950.', minRarity:'E' },
  'Sir Haydn': { character:'Sir Handel', show:'Thomas & Friends', color:getCharacterColour('Sir Handel'),
    note:'Sir Handel is based on Sir Haydn — a Hunslet 0-4-2ST that moved from the Welshpool & Llanfair to become Talyllyn No.3.', minRarity:'E' },
  'Welshpool and Llanfair Light Railway': { character:'Sir Handel', show:'Thomas & Friends', color:getCharacterColour('Sir Handel'),
    note:'Sir Handel is partly based on engines of the Welshpool & Llanfair Light Railway, a narrow-gauge line in mid-Wales.', minRarity:'E' },
  'Edward Thomas (locomotive)': { character:'Peter Sam', show:'Thomas & Friends', color:getCharacterColour('Peter Sam'),
    note:'Peter Sam is based on Edward Thomas — Talyllyn Railway No.4, a Kerr Stuart "Tattoo" class 0-4-2ST from 1921.', minRarity:'E' },
  'Tom Rolt (locomotive)': { character:'Ivo Hugh', show:'Thomas & Friends', color:getCharacterColour('Ivo Hugh'),
    note:'Ivo Hugh is based on Tom Rolt — Talyllyn Railway No.7, built 1991, named after the preservationist who saved the line.', minRarity:'E' },
  'Fairlie (locomotive)': { character:'Mighty Mac', show:'Thomas & Friends', color:getCharacterColour('Mighty Mac'),
    note:'Mighty Mac is based on the Fairlie double-ended locomotive — the famous double-boiler type used on the Festiniog Railway.', minRarity:'E' },
  'Palmerston (locomotive)': { character:'Duke', show:'Thomas & Friends', color:getCharacterColour('Duke'),
    note:'Duke is partly based on Palmerston — a historic Festiniog Railway 0-4-0 tender engine built 1863.', minRarity:'E' },

  // ══ ARLESDALE RAILWAY ═══════════════════════════════════════════════════════
  'River Esk (locomotive)': { character:'Rex', show:'Thomas & Friends', color:getCharacterColour('Rex'),
    note:"Rex is based on River Esk — the Ravenglass & Eskdale Railway's 2-8-2, built 1923 by Davey Paxman.", minRarity:'E' },
  'River Mite (locomotive)': { character:'Mike', show:'Thomas & Friends', color:getCharacterColour('Mike'),
    note:"Mike is based on River Mite — the R&E's 2-8-2, built 1966 by Clarkson.", minRarity:'E' },
  'River Irt (locomotive)': { character:'Bert', show:'Thomas & Friends', color:getCharacterColour('Bert'),
    note:"Bert is based on River Irt — the R&E's oldest locomotive, a converted 0-8-2 from 1894.", minRarity:'E' },
  'Ravenglass and Eskdale Railway': { character:'Rex', show:'Thomas & Friends', color:getCharacterColour('Rex'),
    note:"The Arlesdale Railway is based on the Ravenglass & Eskdale Railway — England's famous 15-inch gauge 'La'al Ratty'.", minRarity:'E' },

  // ══ CULDEE FELL / SNOWDON ════════════════════════════════════════════════════
  'Snowdon Mountain Railway': { character:'Culdee', show:'Thomas & Friends', color:getCharacterColour('Culdee'),
    note:"The Culdee Fell Railway is based on the Snowdon Mountain Railway — Britain's only public rack railway, built 1896.", minRarity:'E' },

  // ══ OTHER FRANCHISES ════════════════════════════════════════════════════════
  'GWR Hall class': { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e',
    note:'5972 Olton Hall, a GWR Hall class 4-6-0, was painted scarlet to star as the Hogwarts Express.', minRarity:'E' },
  'GWR 6959 Modified Hall class': { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e',
    note:'Olton Hall is technically a GWR Modified Hall class locomotive.', minRarity:'E' },
  'Pere Marquette 1225': { character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8',
    note:'Pere Marquette 1225 directly inspired The Polar Express — author Chris Van Allsburg studied its blueprints.', minRarity:'L' },
  'JNR Class D51': { character:'Spirit Train', show:'Spirited Away', color:'#4c1d95',
    note:"The ghostly ocean train in Spirited Away is based on the JNR D51 — Japan's most-built steam class.", minRarity:'E' },
};

// ── Full T&F character name list ───────────────────────────────────────────────
const THOMAS_CHARACTER_NAMES = [
  // NWR Steam
  'Thomas','Edward','Henry','Gordon','James','Percy','Toby','Duck',
  'Donald','Douglas','Oliver','Bill','Ben','Harvey','Emily','Fergus',
  'Arthur','Murdoch','Molly','Neville','Rosie','Whiff','Billy','Stanley',
  'Hank','Flora','Victor','Charlie','Bash','Dash','Ferdinand','Scruff',
  'Belle','Porter','Marion','Timothy','Ryan','Nia','Rebecca',
  // NWR Diesels
  'Diesel','Daisy','BoCo','Mavis','Derek','Diesel 10','Salty','Dennis',
  'Den','Paxton','Sidney','Norman','Philip','Hugo','Stafford','Bear',
  'Philippa','Emma','Flynn','Dart','Sonny',
  // NWR Special
  'Skiff','Elizabeth','Kevin','Harold','Jeremy','Cranky','Big Mickey',
  'Carly','Reg','Winston','Rocky','Hector',
  'Annie','Clarabel','Henrietta','Toad','Victoria',
  // Skarloey Railway
  'Skarloey','Rheneas','Sir Handel','Peter Sam','Rusty','Duncan','Duke',
  'Bertram','Mighty Mac','Proteus','Freddie','Luke','Ivo Hugh','Madge',
  'Colin','Merrick','Owen',
  // Arlesdale Railway
  'Rex','Mike','Frank','Jock',
  // Culdee Fell Railway
  'Godred','Ernest','Wilfred','Culdee','Shane Dooiney','Patrick','Alaric','Eric','Catherine',
  // Mid Sodor Railway
  'Smudger','Albert','Gerry','Jennings','John','Atlas','Alfred',
  // Estate Railway
  'Stephen','Millie','Glynn',
  // UK Mainland
  'Flying Scotsman','Spencer','Hiro','Connor','Caitlin','Samson','Logan',
  'Merlin','Lexi','Theo','Hurricane','Frankie','Beresford','Bradford',
  'Stepney','Bluebell','Primrose','Dwayne','Eddy','Sixteen','Thirteen',
  // International
  'Marshall','Carlos','Natalie','Vinnie','Beau','Carter','Emerson','Raul',
  'Gator','Axel','Etienne','Frieda','Gina','Settebello','Nuria','Angelique',
  'Lorenzo','Beppe','Ivan','Kwaku','Kobe','Ashima','Coran','Noor Jeehan',
  'Rajinda','Rajiv','Shankar','Ace','Tony','Reiji','Taita','Hayato',
  'Ryusei','Goro','Lilac','Kaito','Kisuke','Kenya','Kenji','Gustavo',
  'Gabriela','Cassia','Stefano','Ester','Marcio','Marcia','Zoom',
  // All Engines Go
  'Kana','Sandy','Bruno','Tess','Pullman',
  // The Pack
  'Nelson','Jack','Alfie','Max','Monty','Kelly','Byron','Ned','Isobella','Buster',
  // Road & Other
  'Bertie','Bulgy','Lady','Trevor','Terence','George','Caroline',
];

export const ALL_THOMAS_CHARACTERS = Object.fromEntries(
  THOMAS_CHARACTER_NAMES.map(name => [name, getCharacterColour(name)])
);

export const CHARACTER_DETECTION_RULES = [
  ...THOMAS_CHARACTER_NAMES.map(name => ({
    basis: new RegExp(`\\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\\s+(?:the character\\s+)?${name.replace(/\s+/,'\\\\s+')}(?:\\s+the \\w+ Engine)?\\b`, 'i'),
    character: name,
    show: 'Thomas & Friends',
    color: getCharacterColour(name),
    minRarity: 'E',
  })),
  { basis:/Hogwarts Express/i, requirePhrase:/(?:used|stars?|filmed|painted|appears?)\\s+as\\s+the\\s+Hogwarts/i, character:'Hogwarts Express', show:'Harry Potter',        color:'#92400e', minRarity:'E' },
  { basis:/Polar Express/i,   requirePhrase:/(?:inspir|basis|based|modell)/i,                                     character:'The Polar Express', show:'The Polar Express',  color:'#1d4ed8', minRarity:'L' },
  { basis:/Ivor the Engine/i, requirePhrase:/(?:inspir|basis|based|modell)/i,                                     character:'Ivor',              show:'Ivor the Engine',    color:'#2e7d32', minRarity:'E' },
  { basis:/Spirited Away/i,   requirePhrase:/(?:inspir|basis|based|modell)/i,                                     character:'Spirit Train',       show:'Spirited Away',      color:'#4c1d95', minRarity:'E' },
];

export function parseCharacterFromWikitext(wikitext) {
  if (!wikitext) return null;
  const clean = wikitext
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g,'$2')
    .replace(/\{\{[^}]*\}\}/g,'').replace(/'{2,}/g,'')
    .replace(/<ref[^>]*\/>/g,'').replace(/<ref[^>]*>[\s\S]*?<\/ref>/g,'')
    .replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const cultureRe   = /={2,4}\s*(?:In (?:popular )?culture|Fictional? characters?|Cultural references?|In fiction|In media|Popular culture)\s*={2,4}/i;
  const cultureIdx  = cultureRe.exec(clean)?.index ?? -1;
  const cultureText = cultureIdx >= 0 ? clean.slice(cultureIdx, cultureIdx+3000) : '';
  const introText   = clean.slice(0,1500);
  for (const rule of CHARACTER_DETECTION_RULES) {
    for (const text of [cultureText,introText].filter(Boolean)) {
      if (!rule.basis.test(text)) continue;
      if (rule.requirePhrase && !rule.requirePhrase.test(text)) continue;
      const excerpt = text.match(new RegExp(`.{0,200}${rule.basis.source}.{0,200}`,'i'))?.[0] ?? '';
      let note = excerpt.replace(/\[\d+\]/g,'').replace(/\s+/g,' ').trim();
      if (note.length>160) note = note.slice(0,160).replace(/\s+\S+$/,'')+'…';
      if (note && !note.endsWith('.') && !note.endsWith('…')) note+='.';
      return { character:rule.character, show:rule.show, color:rule.color,
        note: note || `This locomotive is the basis for ${rule.character} in ${rule.show}.`, minRarity:rule.minRarity };
    }
  }
  return null;
}

export function applyCharacterRarityBoost(rarity, character) {
  if (!character?.minRarity) return rarity;
  const ORDER = ['C','R','E','L','M'];
  return ORDER[Math.min(Math.max(ORDER.indexOf(rarity),ORDER.indexOf(character.minRarity)),3)];
}

export function getCharacterForTrain(title, index={}) {
  return index[title] ?? STATIC_CHARACTERS[title] ?? null;
}
