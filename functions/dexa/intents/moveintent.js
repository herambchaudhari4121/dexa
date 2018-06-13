/**
 * @file MoveIntent - Gets information on a move
 * @module
 * @name move
 * @example ask Dexa move dragon dance
 * @example ask Dexa move extreme speed
 * @example ask Dexa move swords dance
 * @param {SpeechValue} MoveName The name of the move you want to find
 * @returns {Speech} Alexa will give the data on the requested move
 */

const Fuse = require('fuse.js'),
  path = require('path'),
  {MoveAliases} = require(path.join(__dirname, '../data/aliases')),
  {BattleMovedex} = require(path.join(__dirname, '../data/moves')),
  {capitalizeFirstLetter, removeDiacritics} = require(path.join(__dirname, '../util')),
  {oneLine} = require('common-tags');

const moveIntent = function (req, res) {
  try {
    const move = removeDiacritics(req.slot('MOVE'));

    const aliasOptions = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias', 'move']
      },
      moveOptions = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name']
      },
      aliasFuse = new Fuse(MoveAliases, aliasOptions),
      moveFuse = new Fuse(BattleMovedex, moveOptions),
      aliasSearch = aliasFuse.search(move),
      moveSearch = aliasSearch.length ? moveFuse.search(aliasSearch[0].move) : moveFuse.search(move);

    const moveData = {
      name: moveSearch[0].name,
      description: moveSearch[0].desc ? moveSearch[0].desc : moveSearch[0].shortDesc,
      type: moveSearch[0].type,
      basePower: moveSearch[0].basePower,
      pp: moveSearch[0].pp,
      category: moveSearch[0].category,
      accuracy: typeof moveSearch[0].accuracy === 'boolean' ? '100%' : `${moveSearch[0].accuracy}%`,
      priority: moveSearch[0].priority,
      target: moveSearch[0].target === 'normal' || moveSearch[0].target === 'any' ? 'One Enemy' : capitalizeFirstLetter(moveSearch[0].target.replace(/([A-Z])/g, ' $1')),
      contestType: moveSearch[0].contestType,
      zpower: moveSearch[0].isZ ? `${capitalizeFirstLetter(moveSearch[0].isZ.substring(0, moveSearch[0].isZ.length - 1))}Z` : null
    };

    /* eslint-disable no-nested-ternary*/
    const final = oneLine`${moveData.name}, ${moveData.description}
    ${moveData.name} is a${(/(electric|ice)/i).test(moveData.type) ? 'n' : ''} ${moveData.type} type move with ${moveData.basePower ? `a base power of ${moveData.basePower} and it has` : ''} ${moveData.pp} pp.
    Under normal conditions it will have a priority factor of ${moveData.priority} and an accuracy of ${moveData.accuracy}.
    In battles with multiple pokemon on each side it will have an effect on ${moveData.target === 'Self' ? 'the user' : moveData.target === 'Adjacent ally or self' ? 'the user or an adjacent battle partner' : moveData.target}.
    ${moveData.zpower ? `This move require the use of the ${moveData.zpower}.` : ''}
    It is categorized as a ${moveData.category} type move in battles and as a ${moveData.contestType} type move in contests.
    `;
    /* eslint-enable */

    return res
      .say(final)
      .card({
        type: 'Simple',
        title: `Dexa Move Data for ${moveData.name}`,
        content: final
      });
  } catch (err) {
    const prompt = `Sorry, I did not quite catch that. ${req.slot('MOVE') ? `I think you said ${removeDiacritics(req.slot('MOVE'))}? ` : ''}Please repeat the move command with a better input, or respond with "Alexa Cancel" if you want to stop`;

    return res.say(prompt).reprompt(prompt).shouldEndSession(false);
  }
};

module.exports = {moveIntent};