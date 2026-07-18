var hanzi = require('./hanzidecomposer.js');
var dict = require('./dictionary.js');

function start() {
  hanzi.start();
  dict.start();
}

exports.start = start;
exports.decompose = hanzi.decompose;
exports.decomposeMany = hanzi.decomposeMany;
exports.ifComponentExists = hanzi.ifComponentExists;
exports.isPrimitive = hanzi.isPrimitive;
exports.definitionLookup = dict.definitionLookup;
exports.dictionarySearch = dict.dictionarySearch;
exports.getExamples = dict.getExamples;
exports.getPinyin = dict.getPinyin;
exports.segment = dict.segment;
exports.getCharacterFrequency = dict.getCharacterFrequency;
exports.determinePhoneticRegularity = dict.determinePhoneticRegularity;
exports.getRadicalMeaning = hanzi.getRadicalMeaning;
exports.getCharactersWithComponent = hanzi.getCharactersWithComponent;
exports.getPhoneticSet = dict.getPhoneticSet;
exports.getCharacterInFrequencyListByPosition =
  dict.getCharacterInFrequencyListByPosition;
