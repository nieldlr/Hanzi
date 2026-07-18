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

function compileAllComponents() {
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
        if (
          component != noglyph &&
          component.search(/[一丨丶⺀丿乙⺃乚⺄亅丷]/g) == -1
        ) {
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

  /*-- Type of Decomposition: 1 = Only 2 components， 2 = Radical, 3 = Graphical, 4 = Primitive) --*/
  if (typeOfDecomposition == null) {
    object = {
      character: character,
      components1: onceDecompose(character),
      components2: radicalDecomposition(character),
      components3: flattenTree(graphicalTree(character)),
      components4: flattenTree(primitiveTree(character))
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
      components: flattenTree(graphicalTree(character))
    };
  } else if (typeOfDecomposition == 4) {
    object = {
      character: character,
      components: flattenTree(primitiveTree(character))
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
};

function replaceNumbers(characters) {
  var finalreview = [];
  for (var i = 0; i < characters.length; i++) {
    if (isNaN(characters[i])) {
      finalreview.push(characters[i]);
    } else {
      finalreview.push('No glyph available');
    }
  }

  return finalreview;
}

function resolveNumber(number) {
  var numberscleared = [];
  var components = getComponents(number);
  var i = 0;
  for (; i < components.length; i++) {
    if (isNaN(components[i])) {
      numberscleared.push(components[i]);
    } else {
      numberscleared = numberscleared.concat(resolveNumber(components[i]));
    }
  }

  return numberscleared;
}

/*
 * Decomposition trees. A node is { character, children }; a numbered grouping
 * node (no Unicode glyph) is shown as { character: 'No glyph available', id:
 * <number>, children }. Leaves have an empty children array. There are two
 * trees, differing only in where they stop:
 *   - graphicalTree stops at strokes (like level-3 flat).
 *   - primitiveTree stops at primitives (like level-4 flat): it keeps a split
 *     frame whole and collapses an unnameable stroke-blob to one gap leaf.
 * The endpoint logic is NOT duplicated here — the trees reuse isPrimitive /
 * isStop / isUnnameableBlob / resolveNumber. The flat level-3 and level-4
 * component arrays are just flattenTree() of the respective tree, so the two
 * views can never drift apart.
 */
function makeNode(token, children) {
  if (isNaN(token)) {
    return {character: token, children: children};
  }
  // a numbered grouping node: no glyph, but keep its id so it can be traced
  return {character: noglyph, id: token, children: children};
}

// In-order leaf characters of a tree — the flat decomposition. A leaf is a node
// with no children; its character is a named glyph or the "No glyph available"
// gap (both emitted). Nodes with children are structural and contribute only
// their descendants, exactly as the old flat recursions did.
function flattenTree(node) {
  if (!node) {
    return [];
  }
  if (node.children.length === 0) {
    return [node.character];
  }
  var out = [];
  for (var i = 0; i < node.children.length; i++) {
    out = out.concat(flattenTree(node.children[i]));
  }
  return out;
}

// Graphical tree (基础 strokes): recurse through every real join and expand
// numbered nodes down to their named strokes; stop at a single-component /
// atomic node. Mirrors the old graphicalDecomposition exactly.
function graphicalTree(character) {
  var components = getComponents(character);
  if (Array.isArray(components) && components.length >= 2) {
    var children = [];
    for (var j = 0; j < components.length; j++) {
      children.push(graphicalTree(components[j]));
    }
    return makeNode(character, children);
  }
  if (isNaN(character)) {
    return makeNode(character, []); // a named single/atomic node is a stroke-level leaf
  }
  // a numbered leaf-ish node: expand to its named strokes (resolveNumber)
  var named = resolveNumber(character);
  var kids = [];
  for (var k = 0; k < named.length; k++) {
    kids.push(makeNode(named[k], []));
  }
  return makeNode(character, kids);
}

// Primitive tree (基础部件): stop at primitives. Keeps a split frame whole and
// surfaces an unnameable stroke-blob as one gap leaf. Mirrors the old
// primitiveDecomposition exactly; a droppable bare numbered node returns null so
// it leaves no leaf (matching the old []).
function primitiveTree(character) {
  if (isPrimitive(character)) {
    return makeNode(character, []);
  }
  var components = getComponents(character);
  if (!Array.isArray(components)) {
    // not a primitive, but atomic/unknown: a named glyph is a leaf; a bare
    // numbered node contributes nothing
    return isNaN(character) ? makeNode(character, []) : null;
  }
  // "split" configuration (哀 = split(衣,口)): keep the frame (components[0])
  // whole and decompose only the filling — 哀 -> [衣, 口], 襄 -> [衣, …].
  if (
    ifComponentExists(character) &&
    characters[character].typeOfDecomposition.split('/')[0] === 'split'
  ) {
    var schildren = [makeNode(components[0], [])]; // frame kept whole (leaf)
    for (var s = 1; s < components.length; s++) {
      var st = primitiveTree(components[s]);
      if (st) {
        schildren.push(st);
      }
    }
    return makeNode(character, schildren);
  }
  var childnodes = [];
  for (var j = 0; j < components.length; j++) {
    var component = components[j];
    if (!isNaN(component) && isUnnameableBlob(component)) {
      // a glyph-less stroke-blob (发's top-left, 隹's right, 师's left): one gap
      // leaf rather than loose strokes
      childnodes.push(makeNode(component, []));
    } else {
      var ct = primitiveTree(component);
      if (ct) {
        childnodes.push(ct);
      }
    }
  }
  return makeNode(character, childnodes);
}

/*
 * Public: a decomposition tree for a character.
 *   type 'primitive' -> stop at primitives (基础部件)
 *   type 'graphical'  -> continue down to strokes
 * Returns the root node { character, children }; level-3/4 flat decompositions
 * are flattenTree() of the same trees, so they stay in lockstep.
 */
function getDecompositionTree(character, type) {
  if (character == null) {
    return 'Invalid Input';
  }
  character = character.replace(/\s/g, '');
  if (isMessy(character)) {
    return 'Invalid Input';
  }
  var t = type == null ? 'primitive' : ('' + type).toLowerCase();
  if (t === 'graphical') {
    return graphicalTree(character);
  }
  if (t === 'primitive') {
    return primitiveTree(character);
  }
  return 'Invalid Type';
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

/*
 * A single stroke: the CJK Strokes block (U+31C0–U+31EF, e.g. ㇆ ㇒) plus the
 * canonical basic strokes (一 丨 丶 丿 乙 …). Used to tell an independent
 * single-stroke component apart from a named multi-stroke component.
 */
function isStroke(token) {
  if (typeof token != 'string' || token.length === 0) {
    return false;
  }
  var cp = token.codePointAt(0);
  if (cp >= 0x31c0 && cp <= 0x31ef) {
    return true;
  }
  return '一丨丶丿乙亅乛乚乁乀乂丷⺀⺁⺂⺃⺄㇐'.indexOf(token) !== -1;
}

/*
 * True when these components are two (or more) genuine building blocks and
 * nothing else — a join of recognisable pieces (成 = 万 + 戈, 遀 = 辶 + 隋's right)
 * rather than a piece plus a stroke or an unnameable stroke-blob (万 = 一 + <hook>,
 * 发 = <blob> + 又). A token counts as a building block if it is a named glyph OR a
 * numbered grouping node that is itself a real component (not a pure stroke-blob):
 * a numbered node has no Unicode codepoint but is still a building block (隋's right
 * side, 邃's 穴+㒸 top), so it is treated like any character. This is what lets a
 * radical wrapping a glyph-less compound (遀 = sbl(辶, 51179)) split the same way
 * 迯 = sbl(辶, 外) does, while 发/隹 (radical + stroke-blob) still stop.
 */
function joinsTwoComponents(components) {
  var count = 0;
  for (var i = 0; i < components.length; i++) {
    var token = components[i];
    if (isStroke(token)) {
      continue;
    }
    if (isNaN(token) || !isUnnameableBlob(token)) {
      count++;
    }
  }
  return count >= 2 && count === components.length;
}

/*
 * Decide whether decomposition should stop at this node — i.e. it is a
 * recognisable building block rather than something to break up further. This is
 * read straight from Gavin Grover's composition codes:
 *   - contained / fused base codes (w.* = within, lock, built) -> stop (大, 木, 日)
 *   - a modified form (m.*) -> stop (口 = mc(囗))
 *   - the /t /m /s /o suffixes say whether the join touches, molds, snaps or
 *     overlaps: an overlap (/o) always fuses (东, 心, 甲); a touch/mold/snap fuses
 *     UNLESS it joins two components (万, 事, 囗 stop; 成, 古 split).
 *   - a surround base code (s.* = one part wraps another, e.g. str = around the
 *     top-right) is a tight join too: it fuses UNLESS it joins two components
 *     (彐 = str(㇕,二), 发 stop; 国 = s(囗,玉), 所 = 戶 + 斤, 遀 = sbl(辶, 隋's right) split).
 * "Two components" (see joinsTwoComponents) counts a numbered grouping node as a
 * building block unless it is a pure stroke-blob — so a radical wrapping a
 * glyph-less compound splits, while a radical wrapping a stroke-blob (发) stops.
 */
function isStop(character) {
  if (!isNaN(character)) {
    return false;
  }
  if ('undefined' == typeof characters[character]) {
    return true; // not decomposable -> atomic
  }
  var code = characters[character].typeOfDecomposition;
  var base = code.split('/')[0];
  var suffix = code.split('/')[1] || '';
  if (base === 'split') {
    return false; // a split frame always decomposes (see primitiveDecomposition)
  }
  if (
    base.charAt(0) === 'w' ||
    base.charAt(0) === 'm' ||
    base === 'lock' ||
    base === 'built'
  ) {
    return true;
  }
  if (suffix === 'o') {
    return true;
  }
  if (
    base.charAt(0) === 's' ||
    suffix === 'm' ||
    suffix === 's' ||
    suffix === 't'
  ) {
    return !joinsTwoComponents(characters[character].components);
  }
  return false;
}

/*
 * True when a node contains no NAMED component anywhere in its expansion — it is
 * built entirely from strokes, directly or via unnamed numbered stroke-clusters
 * (the 丶丨 grouping inside 门). Here a named glyph (二, 八, 人) always counts as
 * "named", even a stroke-built one, so this stays FALSE for a numbered cluster
 * that holds any recognisable component (the 匕匕 of 能, the 刀牛 of 解). It marks
 * a truly unnameable blob that primitiveDecomposition surfaces as one gap
 * ("No glyph available") instead of a pile of loose strokes. Cached; the
 * false-before-recurse write also guards against any cycle in the data.
 */
var strokesOnlyCache = {};
function resolvesToStrokesOnly(character) {
  if (isStroke(character)) {
    return true;
  }
  if (strokesOnlyCache.hasOwnProperty(character)) {
    return strokesOnlyCache[character];
  }
  strokesOnlyCache[character] = false;
  var result = true;
  var components = getComponents(character);
  if (!Array.isArray(components)) {
    result = false; // a non-stroke atomic leaf is itself a named component
  } else {
    for (var i = 0; i < components.length; i++) {
      var c = components[i];
      if (isStroke(c)) {
        continue;
      }
      if (isNaN(c) || !resolvesToStrokesOnly(c)) {
        result = false; // a named component, or a cluster that holds one
        break;
      }
    }
  }
  strokesOnlyCache[character] = result;
  return result;
}

/*
 * True for a named glyph built purely from the frame strokes 一 and 丨 (二, 三, 十,
 * 王, 土, 士 …). Such a stack reads as strokes rather than as a distinct component,
 * so — unlike 八, 匕, 人 (which carry slants/hooks ㇒ ㇏ 乚) — it must NOT keep a
 * numbered node from counting as an unnameable blob. This is why 隹's right side
 * (loose strokes + 二) reads as one blob and 隹 stops whole, while 解's 刀牛 cluster
 * (real components) does not.
 */
var trivialStackCache = {};
function isTrivialStrokeStack(character) {
  if (character === '一' || character === '丨') {
    return true;
  }
  if (isStroke(character)) {
    return false; // any other stroke (㇒, ㇏, 丶) is not a frame stroke
  }
  if (trivialStackCache.hasOwnProperty(character)) {
    return trivialStackCache[character];
  }
  trivialStackCache[character] = false;
  var components = getComponents(character);
  var result = Array.isArray(components) && components.length > 0;
  for (var i = 0; result && i < components.length; i++) {
    if (!isTrivialStrokeStack(components[i])) {
      result = false;
    }
  }
  trivialStackCache[character] = result;
  return result;
}

/*
 * True when a numbered grouping node holds NO recognisable component — only
 * strokes and trivial frame-stroke stacks (二, 三). It is a coherent shape with no
 * Unicode glyph (隹's right side, 发's top-left). A real named glyph inside (刀 in
 * 解, 匕 in 能, 八 in 其) makes it nameable, not a blob. Distinct from
 * resolvesToStrokesOnly, which treats every named glyph — even 二 — as a
 * component; here 二 dissolves so the blob is recognised instead of being
 * traversed and shredded into loose strokes.
 */
var blobCache = {};
function isUnnameableBlob(node) {
  var components = getComponents(node);
  if (!Array.isArray(components)) {
    return false;
  }
  if (blobCache.hasOwnProperty(node)) {
    return blobCache[node];
  }
  blobCache[node] = false;
  var result = true;
  for (var i = 0; i < components.length; i++) {
    var c = components[i];
    if (isStroke(c) || isTrivialStrokeStack(c)) {
      continue;
    }
    if (isNaN(c) || !isUnnameableBlob(c)) {
      result = false; // a real named glyph, or a nested node that holds one
      break;
    }
  }
  blobCache[node] = result;
  return result;
}

/*
 * True when a character or component is a primitive — an indivisible building
 * block that primitive decomposition (type 4) stops at rather than breaking
 * apart. A token not in the data, or an unnamed numbered grouping node, is never
 * a primitive. isStop() covers the fused / contained / modified / overlap /
 * surround cases (大, 木, 哀, 心, 彐). Otherwise a genuine join of two components
 * splits (当 = ⺌ + 彐, 售 = 隹 + 口, 遀 = 辶 + a glyph-less compound); and a shape that
 * is nothing but strokes is atomic (八, 二, 门). A numbered node is treated as a
 * character: a compound one decomposes, and an unnameable stroke-blob one surfaces
 * as a "No glyph available" gap beside its siblings (师 = <blob> + 帀) rather than
 * forcing the whole character to stop. A radical that should stay whole despite a
 * blob part (隹, 钅) is given a stopping code (built/lock/w) in the data instead.
 */
function isPrimitive(character) {
  if (!ifComponentExists(character) || !isNaN(character)) {
    return false;
  }
  if (isStop(character)) {
    return true;
  }
  var components = getComponents(character);
  if (!Array.isArray(components) || components.length < 2) {
    return true;
  }
  if (joinsTwoComponents(components)) {
    return false;
  }
  return resolvesToStrokesOnly(character);
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
exports.getDecompositionTree = getDecompositionTree;
exports.ifComponentExists = ifComponentExists;
exports.isPrimitive = isPrimitive;
exports.getRadicalMeaning = getRadicalMeaning;
exports.getCharactersWithComponent = getCharactersWithComponent;
