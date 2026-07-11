var data = require('./data');
var characters = {};
var radicals = {};
var characterswithcomponent = {};
var noglyph = 'No glyph available';

function start() {
  var i = 0;
  var lines = [];

  console.log('Hanzi is compiling data...');

  //Reading in charData - Decomposition Database
	var readFile = data.loadCJK();
  lines = readFile.split(/\r?\n/);

  for (i = 0; i < lines.length; i++) {
    var colonsplit = lines[i].split(':');
    var character = colonsplit[0];
    var decomposition = colonsplit[1];
    var openbracket = decomposition.indexOf('(');
    var closebracket = decomposition.indexOf(')');
    var typeOfDecomposition = decomposition.substring(0, openbracket);
    var components = decomposition
      .substring(openbracket + 1, closebracket)
      .split(',');
    characters[character] = {
      typeOfDecomposition: typeOfDecomposition,
      components: components
    };
  }

  //Reading in radical list
  radicals = require('./data/radicalListWithMeaning').radicalListWithMeaning;

  //Compile Components into an object array for easy lookup
  compileAllComponents();
}

function compileAllComponents(){
  var readFile = data.loadJunda();
  var lines = readFile.split(/\r?\n/);

  for (var i = 0; i < lines.length; i++) {
    var split = lines[i].split('\t');
    var character = split[1];
    var decomposition = decompose(character);
    var j = 0;
    for (; j < decomposition.components1.length; j++) {
      var component = decomposition.components1[j];
      if ('undefined' == typeof characterswithcomponent[component]) {
        if (component != noglyph) {
          characterswithcomponent[component] = [];
          characterswithcomponent[component].push(character);
        }
      } else if (
        component != noglyph &&
        unique(characterswithcomponent[component], character)
      )
        characterswithcomponent[component].push(character);
    }

    var j = 0;
    for (; j < decomposition.components2.length; j++) {
      var component = decomposition.components2[j];
      if ('undefined' == typeof characterswithcomponent[component]) {
        if (component != noglyph && component.search(/[一丨丶⺀丿乙⺃乚⺄亅丷]/g) == -1) {
          characterswithcomponent[component] = [];
          if (unique(characterswithcomponent[component], character))
            characterswithcomponent[component].push(character);
        }
      } else if (
        component != noglyph &&
        component.search(/[一丨丶⺀丿乙⺃乚⺄亅丷]/g) == -1
      ) {
        if (unique(characterswithcomponent[component], character))
          characterswithcomponent[component].push(character);
      }
    }
  }
  console.log('Done compiling');
}

function unique(array_list, token) {
  var unique = true;
  var i = 0;
  for (; i < array_list.length; i++) {
    if (array_list[i] == token) unique = false;
  }
  return unique;
}

var decomposeMany = function(characterstring, typeOfDecomposition) {
  var decomposearray = {};

  // remove spaces from input string
  characterstring = characterstring.replace(/\s/g, '');
  if (characterstring == null || characterstring == '') {
    return 'Invalid Input';
  }

  for (var i = 0; i < characterstring.length; i++) {
    var onechar = characterstring.substring(i, i + 1);

    // don't decompose the same character more than once
    if (decomposearray[onechar]) continue;

    decomposearray[onechar] = decompose(onechar, typeOfDecomposition);
  }
  return decomposearray;
};

var decompose = function(character, typeOfDecomposition) {
  character = character.replace(/\s/g, '');
  if (isMessy(character)) {
    return 'Invalid Input';
  }
  var object;

  /*-- Type of Decomposition: 1 = Only 2 components， 2 = Radical, 3 = Graphical) --*/
  if (typeOfDecomposition == null) {
    object = {
      character: character,
      components1: onceDecompose(character),
      components2: radicalDecomposition(character),
      components3: graphicalDecomposition(character)
    };
  } else if (typeOfDecomposition == 1) {
    object = {character: character, components: onceDecompose(character)};
  } else if (typeOfDecomposition == 2) {
    object = {
      character: character,
      components: radicalDecomposition(character)
    };
  } else if (typeOfDecomposition == 3) {
    object = {
      character: character,
      components: graphicalDecomposition(character)
    };
  } else {
    return;
  }
  var string = JSON.stringify(object);
  var jsonoutput = JSON.parse(string);
  return jsonoutput;

  //Functions to help with Decomposition

  function onceDecompose(character) {
    var components = getComponents(character);
    return replaceNumbers(components);
  }

  function radicalDecomposition(character) {
    var final_array = [];
    if (isRadical(character)) {
      final_array.push(character);
    } else {
      var components = getComponents(character);
      if (Array.isArray(components) && components.length >= 2) {
        for (var j = 0; j < components.length; j++) {
          final_array = final_array.concat(radicalDecomposition(components[j]));
        }
      } else {
        final_array.push(character);
      }
    }
    return replaceNumbers(final_array);
  }

  function graphicalDecomposition(character) {
    var final_array = [];
    var components = getComponents(character);
    if (Array.isArray(components) && components.length >= 2) {
      for (var j = 0; j < components.length; j++) {
        final_array = final_array.concat(graphicalDecomposition(components[j]));
      }
    } else {
      if (isNaN(character)) {
        final_array.push(character);
      } else {
        final_array = final_array.concat(resolveNumber(character));
      }
    }

    return final_array;
  }
};

function replaceNumbers(characters){
	var finalreview = [];
	for(var i=0; i<characters.length; i++){
		if(isNaN(characters[i])){
			finalreview.push(characters[i]);
		}
		else{
			finalreview.push('No glyph available');
		}
	}

	return finalreview;
}

function resolveNumber(number){
	var numberscleared = [];
	var components = getComponents(number);
	var i=0;
	for(; i<components.length; i++){
		if(isNaN(components[i])){
			numberscleared.push(components[i]);
		}
		else{
			numberscleared = numberscleared.concat(resolveNumber(components[i]));
		}
	}

	return numberscleared;
}

function getCharactersWithComponent(component) {
  if ('undefined' != typeof radicals[component]) {
    var components = findSameMeaningRadicals(component);
    var characters = [];
    var i = 0;
    for (; i < components.length; i++) {
      if ('undefined' != typeof characterswithcomponent[components[i]])
        characters = characters.concat(characterswithcomponent[components[i]]);
    }
    return characters;
  } else {
    if ('undefined' != typeof characterswithcomponent[component])
      return characterswithcomponent[component];
    else return component + ' not found';
  }
}

function findSameMeaningRadicals(radical) {
  var same_radicals = [];
  var meaning = radicals[radical];
  for (var radical in radicals) {
    if (radicals.hasOwnProperty(radical)) {
      if (radicals[radical] == meaning) same_radicals.push(radical);
    }
  }
  return same_radicals;
}

function isRadical(character) {
  var isRad = false;
  if ('undefined' != typeof radicals[character]) {
    isRad = true;
  }
  return isRad;
}

function getComponents(character) {
  if (ifComponentExists(character)) {
    if (characters[character].typeOfDecomposition == 'c') {
      return character;
    } else {
      return expandComponents(character);
    }
  } else {
    return character;
  }
}

/*
 * Gavin Grover's "r.*" codes (ra, rd, r3tr, r4sq, ...) describe a single
 * constituent that repeats and/or reflects to form the character, so the data
 * only lists that one constituent. Expand it into the number of copies the code
 * implies (林 = ra(木) -> [木, 木], 森 = r3tr(木) -> [木, 木, 木]) so every
 * decomposition level accounts for the repetition.
 */
function expandComponents(character) {
  var decomposition = characters[character];
  var count = repeatCount(decomposition.typeOfDecomposition);
  if (count > 1 && decomposition.components.length === 1) {
    var repeated = [];
    for (var i = 0; i < count; i++) {
      repeated.push(decomposition.components[0]);
    }
    return repeated;
  }
  return decomposition.components;
}

/*
 * Number of times a decomposition code repeats its constituent. Only the "r.*"
 * repeat codes multiply; pure reflections/rotations (refh, refv, refr, rot)
 * keep a single copy. Codes carrying a digit (r3tr, r4sq, r5x) repeat that many
 * times; the remaining repeat codes (ra, rd, rrefr, rst, rrotu, ...) repeat twice.
 */
function repeatCount(typeOfDecomposition) {
  var code = typeOfDecomposition.split('/')[0];
  if (code.charAt(0) != 'r') return 1;
  if (code.indexOf('ref') === 0 || code === 'rot') return 1;
  var digit = code.match(/^r([2-9])/);
  if (digit) return parseInt(digit[1], 10);
  return 2;
}

function getRadicalMeaning(radical) {
  if (isRadical(radical)) {
    return radicals[radical];
  } else {
    return 'N/A';
  }
}

function ifComponentExists(component) {
  return 'undefined' != typeof characters[component];
}

function isMessy(character) {
  //If no input is sent
  if (character == null || character == '') {
    return true;
  }
  //If it's not a Chinese character
  return 'undefined' == typeof getComponents(character);
}

exports.start = start;
exports.decompose = decompose;
exports.decomposeMany = decomposeMany;
exports.ifComponentExists = ifComponentExists;
exports.getRadicalMeaning = getRadicalMeaning;
exports.getCharactersWithComponent = getCharactersWithComponent;
