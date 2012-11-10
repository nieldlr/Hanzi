var fs = require('fs');
var dictionarysimplified = {};
var dictionarytraditional = {};

function start(){
	console.log("Hanzi is compiling dictionary...");
	
	//Reading in CCEDICT
	var readFile = fs.readFileSync(__dirname + '/dicts/cedict_ts.u8', 'utf-8');
	var lines = readFile.split(/\r?\n/);
	loadIrregularPhonetics();

	var STARTING_LINE = 30;
	for(var i=STARTING_LINE; i<lines.length; i++){
		var multiplearray = [getElements(i)];
		while(multiplearray[0][0] == nextChar(i+1)){
			multiplearray.push(getElements(i+1));
			i++;
		}

		dictionarysimplified[multiplearray[0][1]] = multiplearray;
		dictionarytraditional[multiplearray[0][0]] = multiplearray;
	}

	function nextChar(j){
		if(j<lines.length){
			var nextcharacter = lines[j].split(" ");
			var nextcheck = nextcharacter[0];
			return nextcheck;
		}
		return "";
	}

	function getElements(i){
		var openbracket = lines[i].indexOf('[');
		var closebracket = lines[i].indexOf(']');
		var defStart = lines[i].indexOf('/');
		var defClose = lines[i].lastIndexOf('/');
		var pinyin = lines[i].substring(openbracket+1, closebracket);
		var definition = lines[i].substring(defStart+1, defClose);
		var elements = lines[i].split(" ");
		var traditional = elements[0];
		var simplified = elements[1];
		return [traditional, simplified, pinyin, definition];
	}
}

function definitionLookup(word, scripttype){
	if(scripttype == null){
		var tradplusimp = [];
		if("undefined" != typeof dictionarysimplified[word]){
			tradplusimp = dictionarysimplified[word];
		}
		if("undefined" != typeof dictionarytraditional[word]){
			tradplusimp = dictionarytraditional[word];
		}
		return tradplusimp;
	}
	else{
		if(scripttype == "s"){
			return dictionarysimplified[word];
		}
		else{
			return dictionarytraditional[word];
		}
	}
	
}

function dictionarySearch(character, type){
	/*--- Types: Only = Just the characters and no alternatives. If not then finds all cases of that character ---*/
	var search = [];
	var regexstring = "^(";
	
	if(type == "only"){
		for(var i=0; i<character.length; i++){
			if(i < character.length-1){
				regexstring = regexstring + character.substring(i, i+1) + "|";
			}
			else{
				regexstring = regexstring + character.substring(i, i+1) + ")+$";
			}
		}
	}
	else{
		regexstring = "["+character+"]";
	}

	var re = new RegExp(regexstring, 'g');

	//First check for simplified.
	for(var word in dictionarysimplified){
		if(dictionarysimplified.hasOwnProperty(word)){
			if(word.search(re) != -1){
				search.push(dictionarysimplified[word]);
			}
		}
	}

	//If there's nothing to be found, then try and look for traditional entries.
	if(search == ""){
		for(word in dictionarytraditional){
			if(dictionarytraditional.hasOwnProperty(word)){
				if(word.search(re) != -1){
					search.push(dictionarytraditional[word]);
				}
			}
		}
	}
	
	return search;
}

function getExamples(character, type){
	/*--- Does a dictionary search and finds the most useful example words ---*/
	var potentialexamples = dictionarySearch(character, type);
	

}
/* Prototype Features */
var irregularphonetics = {};
function loadIrregularPhonetics(){
	var readFile = fs.readFileSync(__dirname + '/data/irregularphonetics.txt', 'utf-8');
	var lines = readFile.split(/\r?\n/);
	for(var i=0; i<lines.length; i++){
		var splits = lines[i].split(":");
		var character = splits[0];
		var pinyin = splits[1];
		irregularphonetics[character]=pinyin;
	}
}

function getPinyin(character, scripttype){
	if(scripttype == "s"){
		//These are for components not found in CC-CEDICT.
		if("undefined" != typeof irregularphonetics[character]){
			return irregularphonetics[character];
		}
		if(character == null){
			return "nof";
		}
		if(character.search(/[㇐㇇㇚𤴓𠂇㇒㇑⺊阝㇟⺀㇓㇝𪜋⺁𠮛㇔龶㇃丆㇏⺌⺹⺆㇛㇠㇆⺧⺮龸⺈㇗龴㇕㇈㇖⺤㇎⺺䧹㇂㇉⺪㇀]/g) != -1){
			return "stroke";
		}
		if(isNaN(character)==false){
			return "number";
		}
		if("undefined" == typeof dictionarysimplified[character]){
			//console.log(character);
			return "nof";
		}
		if(dictionarysimplified[character][2]!=null){
			return dictionarysimplified[character][2];
		}
		else{
			return "nof";
		}
	}
	else{
		for(var i=0; i<dictionary.length; i++){
			if(dictionary[i][0] == character){
				return dictionary[i][2];
			}
		}
	}
}

function comparePhoneticRadical(character, phonetic){
	var charpinyin = getPinyin(character, 's').toLowerCase();
	var phoneticpinyin;

	switch(phonetic){
		case "咅":
			phoneticpinyin = "pou3";
			break;
		case "昷":
			phoneticpinyin = "wen1";
			break;
		case "罙":
			phoneticpinyin = "shen1";
			break;
		case "畐":
			phoneticpinyin = "fu2";
			break;
		case "啇":
			phoneticpinyin = "di2";
			break;
		default:
			phoneticpinyin = getPinyin(phonetic, 's').toLowerCase();
	}

	//console.log('Character Pinyin: '+ charpinyin + ' - Phonetic Pinyin: ' + phoneticpinyin);
	return determinePhoneticRegularity(charpinyin, phoneticpinyin);
}

function determinePhoneticRegularity(character, phonetic){
	var regularity = 0;
	// Regularity Scale: 1 = Exact Match (with tone), 2 = Syllable Match (without tone)
	// 3 = Similar in Rhyme, 4 = Similar in Onset, 0 = No regularity
	//console.log("Testing " + character + " = " + phonetic);
	if (character.syllable() == phonetic.syllable()){
		regularity = 2;
		if (character == phonetic){
			regularity = 1;
		}
	}
	/////WORK BACKWARDS
	return regularity;
}

String.prototype.syllable = function(){
	// Returns Pinyin sans tone
	return this.substring(0, this.length-1);
};

exports.start = start;
exports.definitionLookup = definitionLookup;
exports.dictionarySearch = dictionarySearch;
exports.getPinyin = getPinyin;
exports.comparePhoneticRadical = comparePhoneticRadical;
exports.determinePhoneticRegularity = determinePhoneticRegularity;