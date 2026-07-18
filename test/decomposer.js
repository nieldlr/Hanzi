const assert = require('assert');
const hanzi = require('../index.js');

hanzi.start();

describe('hanzidecomposer', function() {
  it('checks if component exists', function() {
    assert(hanzi.ifComponentExists('爱'));
  });
  it("checks if component don't exist", function() {
    assert(!hanzi.ifComponentExists('$'));
  });

  it('detects invalid input', function() {
    assert.deepEqual(hanzi.decompose('a'), {
      character: 'a',
      components1: ['a'],
      components2: ['a'],
      components3: ['a'],
      components4: ['a']
    });
  });

  it("gets a character's pinyin", function() {
    assert.deepEqual(hanzi.getPinyin('的'), ['de5', 'di2', 'di4']);
  });

  it("gets a radical's meaning", function() {
    assert(hanzi.getRadicalMeaning('氵'), 'water');
    assert(hanzi.getRadicalMeaning('爫'), 'claw/talon');
    assert(hanzi.getRadicalMeaning('冖'), 'cover');
    assert(hanzi.getRadicalMeaning('𠂇'), 'left hand');
    assert(hanzi.getRadicalMeaning('又'), 'right hand');
    assert(hanzi.getRadicalMeaning('心'), 'heart');
    assert(hanzi.getRadicalMeaning('夂'), 'go');
  });

  it('gets character frequency data for simplified character', function() {
    assert.deepEqual(hanzi.getCharacterFrequency('热'), {
      number: '606',
      character: '热',
      count: '67051',
      percentage: '79.8453694124',
      pinyin: 're4',
      meaning: 'heat/to heat up/fervent/hot (of weather)/warm up'
    });
    assert.deepEqual(hanzi.getCharacterFrequency('⺙'), 'Character not found');
    assert.deepEqual(hanzi.getCharacterFrequency('好'), {
      number: '82',
      character: '好',
      count: '411866',
      percentage: '38.1712637099',
      pinyin: 'hao3/hao4',
      meaning: 'good/well, be fond of'
    });
  });

  it('gets character frequency data for traditional character', function() {
    assert.deepEqual(hanzi.getCharacterFrequency('熱'), {
      number: '606',
      character: '热',
      count: '67051',
      percentage: '79.8453694124',
      pinyin: 're4',
      meaning: 'heat/to heat up/fervent/hot (of weather)/warm up'
    });
  });

  it('gets character frequency data for simplified character with a previously different traditional frequency count', function() {
    assert.deepEqual(hanzi.getCharacterFrequency('认'), {
      number: '213',
      character: '认',
      count: '191866',
      percentage: '57.0890429779',
      pinyin: 'ren4',
      meaning: 'to recognize/to know/to admit'
    });
  });

  it('gets character frequency data for traditional character with a previously different traditional frequency count', function() {
    assert.deepEqual(hanzi.getCharacterFrequency('認'), {
      number: '213',
      character: '认',
      count: '191866',
      percentage: '57.0890429779',
      pinyin: 'ren4',
      meaning: 'to recognize/to know/to admit'
    });
  });

  it('gets character by position in frequency list', function() {
    assert.deepEqual(hanzi.getCharacterInFrequencyListByPosition(111), {
      number: '111',
      character: '机',
      count: '339823',
      percentage: '43.7756134862',
      pinyin: 'ji1',
      meaning: 'machine/opportunity/secret'
    });
  });

  it("gets a traditional character by position in frequency list that doesn't have a simplified variant", function() {
    assert.deepEqual(hanzi.getCharacterInFrequencyListByPosition(6649), {
      number: '6649',
      character: '貙',
      count: '13',
      percentage: '99.9947045027',
      pinyin: 'chu1',
      meaning: ''
    });
  });

  it('gets all characters with a given component', function() {
    assert.deepEqual(hanzi.getCharactersWithComponent('囗'), [
      '国',
      '因',
      '西',
      '回',
      '口',
      '四',
      '团',
      '图',
      '围',
      '田',
      '困',
      '恩',
      '固',
      '烟',
      '园',
      '窗',
      '圆',
      '墙',
      '惯',
      '圈',
      '贯',
      '衰',
      '菌',
      '颤',
      '傻',
      '姻',
      '咽',
      '嗯',
      '擅',
      '鄙',
      '囚',
      '捆',
      '茵',
      '禀',
      '徊',
      '凛',
      '粤',
      '檀',
      '瑙',
      '圃',
      '囱',
      '啬',
      '涸',
      '媲',
      '蔷',
      '锢',
      '蛔',
      '穑',
      '洄',
      '胭',
      '泗',
      '蓑',
      '囤',
      '囿',
      '泅',
      '摁',
      '懔',
      '囡',
      '帼',
      '氤',
      '嬗',
      '蝈',
      '邋',
      '蓖',
      '崮',
      '樯',
      '囫',
      '囟',
      '掼',
      '圜',
      '囵',
      '驷',
      '阃',
      '鬣',
      '茴',
      '囹',
      '痼',
      '廪',
      '圄',
      '卣',
      '掴',
      '腦',
      '嫱',
      '膻',
      '檩',
      '榱',
      '澶',
      '篦',
      '硇',
      '涠',
      '洇',
      '總',
      '鱲',
      '囝',
      '貔',
      '迴',
      '圉',
      '溷',
      '缞',
      '鲴',
      '悃',
      '铟',
      '腘',
      '骢',
      '躐',
      '謴',
      '璁',
      '蒽',
      '骃',
      '羶',
      '鯝',
      '镴',
      '硱',
      '鬛',
      '逌',
      '睏',
      '秵',
      '襢',
      '饘',
      '絪',
      '駰',
      '麕',
      '稟',
      '鹯',
      '邅',
      '螕',
      '顫',
      '鳣',
      '裀',
      '稛',
      '縕',
      '鱣',
      '糰',
      '驙',
      '箇',
      '膕',
      '綑',
      '臘',
      '箘',
      '聰',
      '蔥',
      '鮰',
      '驄',
      '薀',
      '祻',
      '繌',
      '圊',
      '罆',
      '薔',
      '謥',
      '貫',
      '鏆',
      '銦',
      '繬',
      '蒕',
      '穯',
      '簑',
      '碅',
      '鸇',
      '薗',
      '釦',
      '稇',
      '艢',
      '蜠',
      '蠟',
      '醞'
    ]);
  });

  it('determines phonetic regularity', function() {
    var expected = {
      di1: {
        character: '低',
        component: ['亻', '氐', '氐', '亻', '氏', '氏', '丶', '丶'],
        phoneticpinyin: [
          'ren2',
          'di1',
          'di3',
          'ren2',
          'shi4',
          'zhi1',
          'dian3',
          'zhu3'
        ],
        regularity: [0, 1, 2, 0, 4, 4, 3, 0]
      }
    };
    assert.deepEqual(hanzi.determinePhoneticRegularity('低'), expected);
  });

  it('should once decompose simplified character', function() {
    assert.deepEqual(hanzi.decompose('爱').components1, [
      'No glyph available',
      '友'
    ]);
  });
  it('should radical decompose simplified character', function() {
    assert.deepEqual(hanzi.decompose('爱').components2, [
      '爫',
      '冖',
      '𠂇',
      '又'
    ]);
  });
  it('should graphical decompose simplified character', function() {
    assert.deepEqual(hanzi.decompose('爱').components3, [
      '爫',
      '冖',
      '𠂇',
      '㇇',
      '㇏'
    ]);
  });

  it('should once decompose traditional character', function() {
    assert.deepEqual(hanzi.decompose('愛').components1, [
      'No glyph available',
      '夂'
    ]);
  });
  it('should radical decompose traditional character', function() {
    assert.deepEqual(hanzi.decompose('愛').components2, [
      '爫',
      '冖',
      '心',
      '夂'
    ]);
  });
  it('should graphical decompose traditional character', function() {
    assert.deepEqual(hanzi.decompose('愛').components3, [
      '爫',
      '冖',
      '丶',
      '丶',
      '丶',
      '㇃',
      '㇇',
      '㇏',
      '㇒'
    ]);
  });

  it('should primitive decompose simplified character', function() {
    assert.deepEqual(hanzi.decompose('爱').components4, [
      '爫',
      '冖',
      '𠂇',
      '又'
    ]);
  });
  it('should primitive decompose traditional character', function() {
    assert.deepEqual(hanzi.decompose('愛').components4, [
      '爫',
      '冖',
      '心',
      '夂'
    ]);
  });
  it('should stop primitive decomposition at meaningful units, not strokes', function() {
    // radicalDecomposition over-splits 成 into strokes; primitive stops at 万, 戈
    assert.deepEqual(hanzi.decompose('成').components4, ['万', '戈']);
    assert.deepEqual(hanzi.decompose('相').components4, ['木', '目']);
    assert.deepEqual(hanzi.decompose('明').components4, ['日', '月']);
  });
  it('keeps an indivisible primitive whole', function() {
    // 万 = d/t(一,<hook>): a touch join that is not two named components -> stop
    assert.deepEqual(hanzi.decompose('万', 4).components, ['万']);
  });
  it('keeps an independent single-stroke component (单笔部件)', function() {
    assert.deepEqual(hanzi.decompose('旦', 4).components, ['日', '一']);
  });
  it('keeps a fused/contained shape whole', function() {
    // bonded base codes stop: 大 = w(人,一) contained, 包 = lock(勹,巳) interlocked
    assert.deepEqual(hanzi.decompose('大', 4).components, ['大']);
    assert.deepEqual(hanzi.decompose('包', 4).components, ['包']);
  });
  it('splits a 衣-frame, keeping the frame whole', function() {
    // split(衣, X): 衣 is the frame the filling X sits inside — keep 衣 whole and
    // decompose only the filling, so 哀 -> [衣, 口] rather than the fused [哀]
    assert.deepEqual(hanzi.decompose('哀', 4).components, ['衣', '口']);
    assert.deepEqual(hanzi.decompose('衷', 4).components, ['衣', '中']);
    assert.deepEqual(hanzi.decompose('裹', 4).components, ['衣', '田', '木']);
    assert.deepEqual(hanzi.decompose('襄', 4).components, [
      '衣',
      '口',
      '口',
      '𠀎'
    ]);
  });
  it('stops at an overlapping (intersecting-stroke) join', function() {
    // /o overlaps are fused: 东 = d/o(七,小), 心 = d/o(𠁼,㇃)
    assert.deepEqual(hanzi.decompose('东', 4).components, ['东']);
    assert.deepEqual(hanzi.decompose('心', 4).components, ['心']);
  });
  it('splits a touch join of two named components', function() {
    // /t touch of two named pieces splits (古 = 十 + 口), and 想 -> 木, 目, 心
    assert.deepEqual(hanzi.decompose('古', 4).components, ['十', '口']);
    assert.deepEqual(hanzi.decompose('想', 4).components, ['木', '目', '心']);
  });
  it('keeps a small stroke-cluster component whole', function() {
    // 八 = rrefr(㇒) expands to two strokes but is itself a unit
    assert.deepEqual(hanzi.decompose('八', 4).components, ['八']);
    assert.deepEqual(hanzi.decompose('二', 4).components, ['二']);
  });
  it('surfaces an unnameable component as one gap, not loose strokes', function() {
    // 变's middle is a coherent shape with no Unicode glyph: shown as one gap
    // alongside its named neighbours (八, 又), not shredded into strokes
    assert.deepEqual(hanzi.decompose('变', 4).components, [
      '亠',
      'No glyph available',
      '八',
      '又'
    ]);
    // but a numbered node that still holds a named component is traversed:
    assert.deepEqual(hanzi.decompose('爱', 4).components, [
      '爫',
      '冖',
      '𠂇',
      '又'
    ]);
  });
  it('surfaces a stroke-blob part as one No-glyph gap beside its named siblings', function() {
    // a numbered node built only from strokes (师's / 归's left, 段's left) is a
    // glyph-less component: treated as a character, it surfaces as ONE "No glyph
    // available" gap while its named siblings are kept — not shredded into strokes,
    // and not forcing the whole character to stop.
    assert.deepEqual(hanzi.decompose('师', 4).components, [
      'No glyph available',
      '帀'
    ]);
    assert.deepEqual(hanzi.decompose('段', 4).components, [
      'No glyph available',
      '几',
      '又'
    ]);
    // a 二 inside the blob dissolves rather than forcing a shred (isUnnameableBlob,
    // not resolvesToStrokesOnly): 那's left (…二…) is one gap, not ㇆ 二 丨
    assert.deepEqual(hanzi.decompose('那', 4).components, [
      'No glyph available',
      '阝'
    ]);
  });
  it('stops at a surround that is not two named components', function() {
    // 彐 = str(㇕,二): a surround of one stroke + one stroke-cluster (not two
    // named components) is one recognisable unit -> stop instead of shredding
    assert.deepEqual(hanzi.decompose('彐', 4).components, ['彐']);
    assert.deepEqual(hanzi.decompose('当', 4).components, ['⺌', '彐']);
    // a surround of two named components still splits:
    assert.deepEqual(hanzi.decompose('国', 4).components, ['囗', '玉']);
    assert.deepEqual(hanzi.decompose('所', 4).components, ['戶', '斤']);
  });
  it('identifies whether a character/component is a primitive', function() {
    assert(hanzi.isPrimitive('木')); // fused pictograph
    assert(hanzi.isPrimitive('大')); // contained shape
    assert(hanzi.isPrimitive('八')); // stroke-cluster unit
    assert(!hanzi.isPrimitive('成')); // compound -> 万, 戈
    assert(!hanzi.isPrimitive('相')); // compound -> 木, 目
    assert(!hanzi.isPrimitive('哀')); // split frame -> 衣, 口
    assert(!hanzi.isPrimitive('$')); // not in the decomposition data
  });
  it('builds a primitive decomposition tree (stops at primitives)', function() {
    // split frame kept whole as a leaf, filling beside it
    assert.deepEqual(hanzi.getDecompositionTree('哀', 'primitive'), {
      character: '哀',
      children: [
        {character: '衣', children: []},
        {character: '口', children: []}
      ]
    });
    // nested: split frame + a filling that decomposes further (果 -> 田, 木)
    assert.deepEqual(hanzi.getDecompositionTree('裹', 'primitive'), {
      character: '裹',
      children: [
        {character: '衣', children: []},
        {
          character: '果',
          children: [
            {character: '田', children: []},
            {character: '木', children: []}
          ]
        }
      ]
    });
    // an unnameable stroke-blob is one gap leaf carrying its numbered id
    assert.deepEqual(hanzi.getDecompositionTree('师', 'primitive'), {
      character: '师',
      children: [
        {character: 'No glyph available', id: '37207', children: []},
        {character: '帀', children: []}
      ]
    });
  });
  it('builds a graphical decomposition tree (continues to strokes)', function() {
    assert.deepEqual(hanzi.getDecompositionTree('大', 'graphical'), {
      character: '大',
      children: [
        {
          character: '人',
          children: [
            {character: '㇒', children: []},
            {character: '㇒', children: []}
          ]
        },
        {character: '一', children: []}
      ]
    });
  });
  it('flat level-3/4 decompositions are the leaves of the trees', function() {
    // the flat arrays are just flattenTree() of the respective trees, so the two
    // views can never drift apart
    function leaves(node) {
      if (!node.children.length) return [node.character];
      return node.children.reduce((a, c) => a.concat(leaves(c)), []);
    }
    ['哀', '裹', '师', '大', '想', '林'].forEach(function(ch) {
      assert.deepEqual(
        leaves(hanzi.getDecompositionTree(ch, 'graphical')),
        hanzi.decompose(ch, 3).components
      );
      assert.deepEqual(
        leaves(hanzi.getDecompositionTree(ch, 'primitive')),
        hanzi.decompose(ch, 4).components
      );
    });
  });
  it('validates getDecompositionTree input and type', function() {
    assert.equal(hanzi.getDecompositionTree('', 'primitive'), 'Invalid Input');
    assert.equal(
      hanzi.getDecompositionTree(null, 'primitive'),
      'Invalid Input'
    );
    // an unknown single token is echoed as a leaf, just like decompose()
    assert.deepEqual(hanzi.getDecompositionTree('a', 'primitive'), {
      character: 'a',
      children: []
    });
    assert.equal(hanzi.getDecompositionTree('哀', 'nonsense'), 'Invalid Type');
    // type defaults to 'primitive' when omitted
    assert.deepEqual(
      hanzi.getDecompositionTree('哀'),
      hanzi.getDecompositionTree('哀', 'primitive')
    );
  });
});

describe('decomposeMany', () => {
  it('returns three characters', () => {
    assert.deepEqual(hanzi.decomposeMany('和挂爱'), {
      和: {
        character: '和',
        components1: ['禾', '口'],
        components2: ['禾', '口'],
        components3: ['㇒', '一', '丨', '㇒', '㇒', '口'],
        components4: ['禾', '口']
      },
      挂: {
        character: '挂',
        components1: ['扌', '圭'],
        components2: ['扌', '土', '土'],
        components3: ['亅', '一', '一', '一', '丨', '一', '一', '丨', '一'],
        components4: ['扌', '土', '土']
      },
      爱: {
        character: '爱',
        components1: ['No glyph available', '友'],
        components2: ['爫', '冖', '𠂇', '又'],
        components3: ['爫', '冖', '𠂇', '㇇', '㇏'],
        components4: ['爫', '冖', '𠂇', '又']
      }
    });
  });
});
