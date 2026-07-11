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
      components3: ['a']
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
    assert.deepEqual(hanzi.decompose('爱').components2, ['爫', '冖', '𠂇', '又']);
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
    assert.deepEqual(hanzi.decompose('愛').components2, ['爫', '冖', '心', '夂']);
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
});

describe('decomposeMany', () => {
  it('returns three characters', () => {
    assert.deepEqual(hanzi.decomposeMany('和挂爱'), {
      和: {
        character: '和',
        components1: ['禾', '口'],
        components2: ['禾', '口'],
        components3: ['㇒', '一', '丨', '㇒', '㇒', '口']
      },
      挂: {
        character: '挂',
        components1: ['扌', '圭'],
        components2: ['扌', '土', '土'],
        components3: ['亅', '一', '一', '一', '丨', '一', '一', '丨', '一']
      },
      爱: {
        character: '爱',
        components1: ['No glyph available', '友'],
        components2: ['爫', '冖', '𠂇', '又'],
        components3: ['爫', '冖', '𠂇', '㇇', '㇏']
      }
    });
  });
});
