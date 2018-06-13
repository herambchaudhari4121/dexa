/**
 * @file ItemIntent - Gets information about an item
 * @module
 * @name item
 * @example ask Dexa item life orb
 * @example ask Dexa item assault vest
 * @param {SpeechValue} ItemName The name of the item you want to find
 * @returns {Speech} Alexa will give the data on the requested item
 */

const Fuse = require('fuse.js'),
  path = require('path'),
  {ItemAliases} = require(path.join(__dirname, '../data/aliases')),
  {BattleItems} = require(path.join(__dirname, '../data/items')),
  {capitalizeFirstLetter, removeDiacritics} = require(path.join(__dirname, '../util')),
  {oneLine} = require('common-tags');

const itemIntent = function (req, res) {
  try {
    const item = removeDiacritics(req.slot('ITEM'));

    const fsoptions = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias', 'item', 'id', 'name']
      },
      aliasFuse = new Fuse(ItemAliases, fsoptions),
      itemFuse = new Fuse(BattleItems, fsoptions),
      aliasSearch = aliasFuse.search(item),
      itemSearch = aliasSearch.length ? itemFuse.search(aliasSearch[0].item) : itemFuse.search(item);

    const itemData = {
      name: capitalizeFirstLetter(itemSearch[0].name),
      description: itemSearch[0].desc,
      gen: itemSearch[0].gen
    };

    const final = oneLine`${itemData.name}, ${itemData.description} It was introduced in generation ${itemData.gen}.`.replace(/([0-9]{1}(\.[0-9]){0,1})x/gm, '$1 times');

    return res
      .say(final)
      .card({
        type: 'Simple',
        title: `Dexa Item Data for ${itemData.name}`,
        content: final
      });
  } catch (err) {
    const prompt = `Sorry, I did not quite catch that. ${req.slot('ITEM') ? `I think you said ${removeDiacritics(req.slot('ITEM'))}? ` : ''}Please repeat the item command with a better input, or respond with "Alexa Cancel" if you want to stop`;

    return res.say(prompt).reprompt(prompt).shouldEndSession(false);
  }
};

module.exports = {itemIntent};