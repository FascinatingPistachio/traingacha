// Derives a display colour for a Thomas & Friends character using two methods:
// 1. Known canonical livery map (accurate for the main cast)
// 2. Fuzzy keyword extraction from the character's Wikipedia extract text

const KNOWN_LIVERIES = {
  // NWR Main Cast
  thomas:'#1565c0',edward:'#1976d2',henry:'#2e7d32',gordon:'#1a237e',james:'#c62828',
  percy:'#2e7d32',toby:'#4e342e',duck:'#2e7d32',donald:'#37474f',douglas:'#37474f',
  oliver:'#2e7d32',bill:'#fdd835',ben:'#fdd835',harvey:'#c62828',emily:'#1b5e20',
  fergus:'#c62828',arthur:'#1565c0',murdoch:'#4e342e',molly:'#fdd835',neville:'#212121',
  rosie:'#ad1457',whiff:'#388e3c',billy:'#c62828',stanley:'#9e9e9e',hank:'#c62828',
  flora:'#f57f17',victor:'#c62828',charlie:'#f9a825',bash:'#2e7d32',dash:'#1565c0',
  ferdinand:'#2e7d32',scruff:'#795548',belle:'#1565c0',porter:'#212121',marion:'#fdd835',
  timothy:'#f57f17',ryan:'#c62828',nia:'#e65100',rebecca:'#f9a825',
  // NWR Diesels & Specials
  diesel:'#212121',daisy:'#4caf50',boco:'#1b5e20',mavis:'#212121',derek:'#2e7d32',
  arry:'#212121',bert:'#212121',diesel10:'#212121',salty:'#1565c0',dennis:'#fdd835',
  den:'#212121',paxton:'#1565c0',sidney:'#9e9e9e',norman:'#c62828',philip:'#fdd835',
  hugo:'#9e9e9e',stafford:'#9e9e9e',bear:'#1565c0',philippa:'#ad1457',emma:'#fdd835',
  flynn:'#c62828',dart:'#2e7d32',sonny:'#f9a825',
  // NWR Non-Locos
  skiff:'#1565c0',elizabeth:'#4e342e',kevin:'#f57f17',harold:'#9e9e9e',jeremy:'#9e9e9e',
  cranky:'#fdd835',big_mickey:'#c62828',carly:'#9e9e9e',reg:'#795548',winston:'#c62828',
  rocky:'#f9a825',hector:'#212121',toad:'#4e342e',annie:'#c62828',clarabel:'#c62828',
  henrietta:'#c62828',victoria:'#c62828',
  // Skarloey Railway
  skarloey:'#c62828',rheneas:'#c62828',sir_handel:'#1565c0',peter_sam:'#1565c0',
  rusty:'#bf360c',duncan:'#f9a825',duke:'#9e9e9e',bertram:'#4e342e',mighty_mac:'#c62828',
  proteus:'#4e342e',freddie:'#f9a825',luke:'#2e7d32',ivo_hugh:'#c62828',madge:'#c62828',
  colin:'#1565c0',merrick:'#fdd835',owen:'#c62828',
  // Arlesdale Railway
  rex:'#c62828',mike:'#c62828',frank:'#212121',jock:'#1565c0',
  // Culdee Fell Railway
  godred:'#c62828',ernest:'#c62828',wilfred:'#2e7d32',culdee:'#c62828',
  shane_dooiney:'#1565c0',patrick:'#2e7d32',alaric:'#2e7d32',eric:'#c62828',catherine:'#c62828',
  // Mid Sodor Railway
  smudger:'#2e7d32',albert:'#9e9e9e',gerry:'#fdd835',jennings:'#212121',
  john:'#1565c0',atlas:'#212121',alfred:'#2e7d32',
  // Estate Railway
  stephen:'#fdd835',millie:'#f9a825',glynn:'#c62828',
  // UK Mainland
  flying_scotsman:'#004d00',spencer:'#78909c',hiro:'#212121',connor:'#1565c0',
  caitlin:'#b3e5fc',samson:'#b71c1c',logan:'#4e342e',merlin:'#2e7d32',lexi:'#ad1457',
  theo:'#9e9e9e',hurricane:'#37474f',frankie:'#f57f17',beresford:'#c62828',
  bradford:'#fdd835',stepney:'#2e7d32',bluebell:'#1565c0',primrose:'#fdd835',
  dwayne:'#c62828',eddy:'#1565c0',sixteen:'#9e9e9e',thirteen:'#9e9e9e',
  // International
  marshall:'#c62828',carlos:'#c62828',natalie:'#f9a825',vinnie:'#212121',beau:'#1565c0',
  carter:'#c62828',emerson:'#fdd835',raul:'#c62828',gator:'#2e7d32',axel:'#f9a825',
  etienne:'#1565c0',frieda:'#c62828',gina:'#c62828',settebello:'#c62828',ivan:'#1565c0',
  nuria:'#fdd835',kwaku:'#f9a825',kobe:'#c62828',an_an:'#c62828',ashima:'#d81b60',
  coran:'#2e7d32',noor_jeehan:'#e65100',rajinda:'#c62828',rajiv:'#e65100',shankar:'#fdd835',
  ace:'#c62828',angelique:'#1565c0',tony:'#fdd835',reiji:'#1565c0',taita:'#c62828',
  hayato:'#c62828',ryusei:'#c62828',goro:'#2e7d32',lilac:'#9c27b0',kaito:'#1565c0',
  kisuke:'#fdd835',kenya:'#4e342e',gustavo:'#c62828',gabriela:'#ad1457',cassia:'#2e7d32',
  stefano:'#1565c0',ester:'#fdd835',lorenzo:'#4a148c',beppe:'#2e7d32',kenji:'#c62828',
  marcio:'#1565c0',marcia:'#ad1457',zoom:'#c62828',
  // All Engines Go
  kana:'#c62828',sandy:'#fdd835',bruno:'#37474f',tess:'#f57f17',pullman:'#1565c0',
  // The Pack
  nelson:'#fdd835',jack:'#fdd835',alfie:'#fdd835',max:'#fdd835',monty:'#fdd835',
  kelly:'#c62828',byron:'#fdd835',ned:'#f9a825',isobella:'#c62828',buster:'#fdd835',
  // Other Vehicles
  bertie:'#c62828',algy:'#c62828',bulgy:'#c62828',terence:'#c62828',trevor:'#2e7d32',
  george:'#fdd835',caroline:'#fdd835',butch:'#c62828',lady:'#9c27b0',pip:'#1565c0',
  // Legacy aliases
  noor:'#e65100',yong:'#c62828',natasha:'#1565c0',the_fat_controller:'#212121',
  connor2:'#1565c0',ryan2:'#1976d2',phillip:'#4a148c',
};

const COLOUR_WORDS = {
  blue:'#1565c0',dark_blue:'#0d47a1',light_blue:'#1e88e5',
  red:'#c62828',dark_red:'#b71c1c',crimson:'#b71c1c',
  green:'#2e7d32',dark_green:'#1b5e20',lime:'#388e3c',
  yellow:'#f9a825',gold:'#f9a825',golden:'#f9a825',
  orange:'#e65100',amber:'#ff8f00',
  purple:'#4a148c',violet:'#4a148c',
  pink:'#ad1457',
  grey:'#546e7a',gray:'#546e7a',silver:'#78909c',
  black:'#212121',dark:'#212121',
  brown:'#4e342e',chocolate:'#4e342e',
  white:'#90a4ae',cream:'#a1887f',
};

export function getCharacterColour(characterName, extract = '') {
  const key = characterName.toLowerCase().replace(/[^a-z]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'');
  if (KNOWN_LIVERIES[key]) return KNOWN_LIVERIES[key];
  const text = (characterName + ' ' + extract).toLowerCase();
  const engineColourRe = /\b(blue|red|green|yellow|gold|orange|purple|pink|grey|gray|silver|black|brown|white|dark blue|light blue|dark green|dark red)\s+(?:engine|locomotive|tank|tender|loco|train|tram|coach)\b/g;
  const paintedRe = /\bpainted\s+(blue|red|green|yellow|gold|orange|purple|pink|grey|gray|silver|black|brown|white)\b/;
  let match = engineColourRe.exec(text);
  if (match) { const c = match[1].replace(' ','_'); if (COLOUR_WORDS[c]) return COLOUR_WORDS[c]; }
  match = paintedRe.exec(text);
  if (match && COLOUR_WORDS[match[1]]) return COLOUR_WORDS[match[1]];
  for (const [word, hex] of Object.entries(COLOUR_WORDS)) {
    const re = new RegExp(`\\b${word.replace('_','\\s+')}\\b`,'i');
    if (re.test(text.slice(0,200))) return hex;
  }
  return '#546e7a';
}
