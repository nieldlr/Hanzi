var data = require('./data');
var hanzi = require('./hanzidecomposer');
var dictionarysimplified = {};
var dictionarytraditional = {};
var hanzi = require('./hanzidecomposer.js');
var phonetic_set_one = {};
var phonetic_set_two = {};

var Segmenter = require('./segmenter.js').LongestMatchSegmenter;
var segmenter = new Segmenter(definitionLookup);

function start() {
  console.log('Hanzi is compiling dictionary...');

  //Reading in CCEDICT
  var readFile = data.loadCCEDICT();
  var lines = readFile.split(/\r?\n/);
  loadIrregularPhonetics();
  loadFrequencyData();
  phonetic_set_one = require('./data/phonetic_sets_regularity_one.js')
    .regularity_one;
  phonetic_set_two = require('./data/phonetic_sets_regularity_two.js')
    .regularity_two;

  var STARTING_LINE = 30;
  for (var i = STARTING_LINE; i < lines.length; i++) {
    var multiplearray = [getElements(i)];
    while (
      multiplearray[0].traditional == nextCharTraditional(i + 1) &&
      multiplearray[0].simplified == nextCharSimplified(i + 1)
    ) {
      multiplearray.push(getElements(i + 1));
      i++;
    }

    if (
      typeof dictionarysimplified[multiplearray[0].simplified] != 'undefined'
    ) {
      var newMultipleArray = dictionarysimplified[multiplearray[0].simplified];
      for (var j = 0; j < multiplearray.length; j++) {
        newMultipleArray.push(multiplearray[j]);
      }

      dictionarysimplified[multiplearray[0].simplified] = newMultipleArray;
    } else {
      dictionarysimplified[multiplearray[0].simplified] = multiplearray;
    }

    if (
      typeof dictionarytraditional[multiplearray[0].traditional] != 'undefined'
    ) {
      var newMultipleArray =
        dictionarytraditional[multiplearray[0].traditional];
      for (var j = 0; j < multiplearray.length; j++) {
        newMultipleArray.push(multiplearray[j]);
      }

      dictionarytraditional[multiplearray[0].traditional] = newMultipleArray;
    } else {
      dictionarytraditional[multiplearray[0].traditional] = multiplearray;
    }

    // dictionarysimplified[multiplearray[0].simplified] = multiplearray;
    // dictionarytraditional[multiplearray[0].traditional] = multiplearray;
  }

  function nextCharTraditional(j) {
    if (j < lines.length) {
      var nextcharacter = lines[j].split(' ');
      var nextcheck = nextcharacter[0];
      return nextcheck;
    }
    return '';
  }

  function nextCharSimplified(j) {
    if (j < lines.length) {
      var nextcharacter = lines[j].split(' ');
      var nextcheck = nextcharacter[1];
      return nextcheck;
    }
    return '';
  }

  function getElements(i) {
    var openbracket = lines[i].indexOf('[');
    var closebracket = lines[i].indexOf(']');
    var defStart = lines[i].indexOf('/');
    var defClose = lines[i].lastIndexOf('/');
    var pinyin = lines[i].substring(openbracket + 1, closebracket);
    var definition = lines[i].substring(defStart + 1, defClose);
    var elements = lines[i].split(' ');
    var traditional = elements[0];
    var simplified = elements[1];
    return {
      traditional: traditional,
      simplified: simplified,
      pinyin: pinyin,
      definition: definition
    };
  }
}

function definitionLookup(word, scripttype) {
  if (scripttype == null) {
    if (determineIfSimplified(word)) {
      return dictionarysimplified[word];
    }
    if (!determineIfSimplified(word)) {
      return dictionarytraditional[word];
    }
  } else {
    if (scripttype == 's') {
      return dictionarysimplified[word];
    } else {
      return dictionarytraditional[word];
    }
  }
}

function dictionarySearch(character, type) {
  /*--- Types: Only = Just the characters and no alternatives. If not then finds all cases of that character ---*/
  var search = [];
  var regexstring = '^(';

  if (type == 'only') {
    for (var i = 0; i < character.length; i++) {
      if (i < character.length - 1) {
        regexstring = regexstring + character.substring(i, i + 1) + '|';
      } else {
        regexstring = regexstring + character.substring(i, i + 1) + ')+$';
      }
    }
  } else {
    regexstring = '[' + character + ']';
  }

  var re = new RegExp(regexstring, 'g');

  //First check for simplified.
  for (var word in dictionarysimplified) {
    if (dictionarysimplified.hasOwnProperty(word)) {
      if (word.search(re) != -1) {
        search.push(dictionarysimplified[word]);
      }
    }
  }

  //If there's nothing to be found, then try and look for traditional entries.
  if (search.length == 0) {
    for (word in dictionarytraditional) {
      if (dictionarytraditional.hasOwnProperty(word)) {
        if (word.search(re) != -1) {
          search.push(dictionarytraditional[word]);
        }
      }
    }
  }

  return search;
}

function getExamples(character) {
  /*--- Does a dictionary search and finds the most useful example words ---*/

  var isSimplified = determineIfSimplified(character);

  var potentialexamples = dictionarySearch(character);
  var allfreq = [];
  var lowfreq = [];
  var midfreq = [];
  var highfreq = [];
  var i = 0;
  for (; i < potentialexamples.length; i++) {
    //Create Array of Frequency Points to calculate distributions
    //It takes the frequency accounts of both scripts into account.

    var wordsimp = potentialexamples[i][0].simplified;
    var wordtrad = potentialexamples[i][0].traditional;

    var totalfrequency = 0;
    if ('undefined' != typeof wordfreq[wordsimp]) {
      totalfrequency = totalfrequency + parseInt(wordfreq[wordsimp]);
    }
    if ('undefined' != typeof wordfreq[wordtrad]) {
      totalfrequency = totalfrequency + parseInt(wordfreq[wordtrad]);
    }
    allfreq.push(totalfrequency);
  }

  //Calculate mean, variance + sd
  allfreq.sort(function(a, b) {
    return a - b;
  });
  var mean = calculateMean();
  var variance = calculateVariance(mean);
  var sd = Math.sqrt(variance);

  determineFreqCategories();

  //Create frequency categories
  function determineFreqCategories() {
    if (mean - sd < 0) {
      var lowrange = 0 + mean / 3;
    } else {
      var lowrange = mean - sd;
    }
    var midrange = [mean + sd, lowrange];
    var highrange = mean + sd;

    var i = 0;
    for (; i < potentialexamples.length; i++) {
      var word = potentialexamples[i][0];

      if ('undefined' != typeof wordfreq[word.simplified]) {
        pushFrequency(word);
      }
    }

    function pushFrequency(word) {
      if (wordfreq[word.simplified] < lowrange) {
        lowfreq.push(word);
      }
      if (
        wordfreq[word.simplified] >= midrange[1] &&
        wordfreq[word.simplified] < midrange[0]
      ) {
        midfreq.push(word);
      }
      if (wordfreq[word.simplified] >= highrange) {
        highfreq.push(word);
      }
    }
  }
  var examplewords = [highfreq, midfreq, lowfreq];
  return examplewords;

  function calculateMean() {
    var total = 0;
    var i = 0;
    for (; i < allfreq.length; i++) {
      total = total + parseInt(allfreq[i], 10);
    }
    var mean = total / allfreq.length;
    return mean;
  }

  function calculateVariance() {
    var total = 0;
    var i = 0;
    for (; i < allfreq.length; i++) {
      var localvar = parseInt(allfreq[i], 10) - mean;
      total = total + localvar * localvar;
    }
    var variance = total / allfreq.length;
    return variance;
  }
}

function determineIfSimplified(character) {
  if ('undefined' != typeof dictionarysimplified[character]) {
    return true;
  }
  if ('undefined' != typeof dictionarytraditional[character]) {
    return false;
  }
}

var charfreq = {};
var characterFrequencyCountIndex = [];
var wordfreq = {};
function loadFrequencyData() {
  console.log('Starting to read frequency data');

  var readFile = data.loadLeiden();
  var lines = readFile.split(/\r?\n/);

  var i = 0;
  for (; i < lines.length; i++) {
    var splits = lines[i].split(',');
    var word = splits[0];
    var freq = splits[1];
    wordfreq[word] = freq;
  }

  var readFile = data.loadFrequencyWithScriptVariantsRemoved();
  lines = readFile.split(/\r?\n/);
  var i = 0;
  for (; i < lines.length; i++) {
    var splits = lines[i].split('\t');
    var number = splits[0];
    var character = splits[1];

    charfreq[character] = {
      number: number,
      character: character,
      count: splits[2],
      percentage: splits[3],
      pinyin: splits[4],
      meaning: splits[5]
    };

    characterFrequencyCountIndex[number] = character;
  }
  console.log('Frequency data loaded');
}

var irregularphonetics = {};
function loadIrregularPhonetics() {
  var readFile = data.loadIrregularPhonetics();
  var lines = readFile.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var splits = lines[i].split(':');
    var character = splits[0];
    var pinyin = splits[1];
    irregularphonetics[character] = pinyin;
  }
}

function getPinyin(character) {
  //These are for components not found in CC-CEDICT.
  if ('undefined' != typeof dictionarysimplified[character]) {
    var i = 0;
    var pinyinarray = [];
    for (; i < dictionarysimplified[character].length; i++) {
      pinyinarray[i] = dictionarysimplified[character][i].pinyin;
    }
    return pinyinarray;
  }
  if ('undefined' != typeof dictionarytraditional[character]) {
    var i = 0;
    var pinyinarray = [];
    for (; i < dictionarytraditional[character].length; i++) {
      pinyinarray[i] = dictionarytraditional[character][i].pinyin;
    }
    return pinyinarray;
  }
  if ('undefined' != typeof irregularphonetics[character]) {
    return [irregularphonetics[character]];
  }
  if (
    character.search(/[㇐㇇㇚𤴓𠂇㇒㇑⺊阝㇟⺀㇓㇝𪜋⺁𠮛㇔龶㇃丆㇏⺌⺹⺆㇛㇠㇆⺧⺮龸⺈㇗龴㇕㇈㇖⺤㇎⺺䧹㇂㇉⺪㇀]/g) !=
    -1
  ) {
    return ['_stroke'];
  }
  if (isNaN(character) == false) {
    return ['_number'];
  }
  return null;
}

function determinePhoneticRegularity(decomposition) {
  var regularityarray = {};
  //An object is not passed to this function, create the decomposition object with the character input
  if ('undefined' == typeof decomposition.character) {
    decomposition = hanzi.decompose(decomposition);
  }

  //Get all possible pronunciations for character
  var charpinyin = getPinyin(decomposition.character);
  if (charpinyin == null) {
    return (regularityarray = null);
  }

  var phoneticpinyin = [];

  //Determine phonetic regularity for components on level 1 decomposition
  for (var k = 0; k < decomposition.components1.length; k++) {
    phoneticpinyin = getPinyin(decomposition.components1[k]); //Get the pinyin of the component

    var i = 0;
    for (; i < charpinyin.length; i++) {
      //Compare it with all the possible pronunciations of the character
      //Init Object
      if ('undefined' == typeof regularityarray[charpinyin[i]]) {
        //If the object store has no character pinyin stored yet, create the point
        regularityarray[charpinyin[i]] = {
          character: decomposition.character,
          component: [],
          phoneticpinyin: [],
          regularity: []
        };
      }

      if (phoneticpinyin == null) {
        //If the component has no pronunciation found, nullify the regularity computation
        regularityarray[charpinyin[i]].phoneticpinyin.push(null);
        regularityarray[charpinyin[i]].component.push(
          decomposition.components1[k]
        );
        regularityarray[charpinyin[i]].regularity.push(null);
      } else {
        //Compare the character pinyin to all possible phonetic pinyin pronunciations
        var j = 0;
        for (; j < phoneticpinyin.length; j++) {
          regularityarray[charpinyin[i]].phoneticpinyin.push(phoneticpinyin[j]);
          regularityarray[charpinyin[i]].component.push(
            decomposition.components1[k]
          );
          regularityarray[charpinyin[i]].regularity.push(
            getRegularityScale(charpinyin[i], phoneticpinyin[j])
          );
        }
      }
    }
  }

  for (var k = 0; k < decomposition.components2.length; k++) {
    phoneticpinyin = getPinyin(decomposition.components2[k]); //Get the pinyin of the component

    var i = 0;
    for (; i < charpinyin.length; i++) {
      //Compare it with all the possible pronunciations of the character
      //Init Object
      if ('undefined' == typeof regularityarray[charpinyin[i]]) {
        //If the object store has no character pinyin stored yet, create the point
        regularityarray[charpinyin[i]] = {
          character: decomposition.character,
          component: [],
          phoneticpinyin: [],
          regularity: []
        };
      }

      if (phoneticpinyin == null) {
        //If the component has no pronunciation found, nullify the regularity computation
        regularityarray[charpinyin[i]].phoneticpinyin.push(null);
        regularityarray[charpinyin[i]].component.push(
          decomposition.components2[k]
        );
        regularityarray[charpinyin[i]].regularity.push(null);
      } else {
        //Compare the character pinyin to all possible phonetic pinyin pronunciations
        var j = 0;
        for (; j < phoneticpinyin.length; j++) {
          regularityarray[charpinyin[i]].phoneticpinyin.push(phoneticpinyin[j]);
          regularityarray[charpinyin[i]].component.push(
            decomposition.components2[k]
          );
          regularityarray[charpinyin[i]].regularity.push(
            getRegularityScale(charpinyin[i], phoneticpinyin[j])
          );
        }
      }
    }
  }
  return regularityarray;
}

function getCharacterFrequency(character) {
  var dictEntry = definitionLookup(character);

  // Check if this character has a lookup
  if (dictEntry && dictEntry[0]) {
    //Check if we can return a simplified version
    if ('undefined' != typeof charfreq[dictEntry[0].simplified]) {
      return charfreq[dictEntry[0].simplified];
    } else {
      // If not, then this is could be a traditional character
      // that possibly exists in the frequency list
      if ('undefined' != typeof charfreq[character]) {
        return charfreq[character];
      } else {
        // If not, this is a very uncommon character
        return 'Character not found';
      }

      return charfreq[character];
    }
  } else if ('undefined' != typeof charfreq[character]) {
    // In the unlikely case that we don't have a dictionary entry
    // but it exists in the frequency list
    return charfreq[character];
  } else {
    return 'Character not found';
  }
}

function getCharacterInFrequencyListByPosition(position) {
  return getCharacterFrequency(characterFrequencyCountIndex[position]);
}

//Helper Functions
function getRegularityScale(charpinyin, phoneticpinyin) {
  if (charpinyin == null || phoneticpinyin == null) {
    return null;
  }
  var regularity = 0;
  charpinyin = new PinyinSyllable(charpinyin.toLowerCase());
  phoneticpinyin = new PinyinSyllable(phoneticpinyin.toLowerCase());

  // Regularity Scale: 1 = Exact Match (with tone), 2 = Syllable Match (without tone)
  // 3 = Similar in Initial, 4 = Similar in Final, 0 = No regularity

  //First test for Scale 1 & 2
  if (charpinyin.syllable() == phoneticpinyin.syllable()) {
    regularity = 2;
    if (charpinyin.raw_syllable == phoneticpinyin.raw_syllable) {
      regularity = 1;
    }
  }

  //If still no regularity found, test for initial & final regularity (scale 3 & 4)
  if (regularity == 0) {
    if (charpinyin.final() == phoneticpinyin.final()) {
      regularity = 4;
    } else {
      if (charpinyin.initial() == phoneticpinyin.initial()) {
        regularity = 3;
      }
    }
  }

  return regularity;
}

function getPhoneticSet(regularity_scale) {
  switch (regularity_scale) {
    case 1:
      return phonetic_set_one;
      break;
    case 2:
      return phonetic_set_two;
      break;
    default:
  }
}

function PinyinSyllable(raw_syllable) {
  this.raw_syllable = raw_syllable;
}

//Methods
PinyinSyllable.prototype.syllable = function() {
  // Returns Pinyin sans tone
  return this.raw_syllable.substring(0, this.raw_syllable.length - 1);
};

PinyinSyllable.prototype.initial = function() {
  //Returns the initial of pinyin syllable
  var initial = '';
  if (this.raw_syllable.substring(1, 2) == 'h') {
    //Take into zh, ch, sh
    initial = this.raw_syllable.substring(0, 2);
  } else {
    initial = this.raw_syllable.substring(0, 1);
  }
  return initial;
};

PinyinSyllable.prototype.final = function() {
  var syllable = this.syllable();
  var rhyme = syllable.replace(this.initial(), '');
  return rhyme;
};

exports.start = start;
exports.definitionLookup = definitionLookup;
exports.dictionarySearch = dictionarySearch;
exports.getExamples = getExamples;
exports.getPinyin = getPinyin;
exports.getCharacterFrequency = getCharacterFrequency;
exports.determinePhoneticRegularity = determinePhoneticRegularity;
exports.getPhoneticSet = getPhoneticSet;
exports.getCharacterInFrequencyListByPosition = getCharacterInFrequencyListByPosition;
exports.segment = segmenter.segment.bind(segmenter);
