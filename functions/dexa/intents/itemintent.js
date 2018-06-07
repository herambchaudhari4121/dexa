const Fuse = require('fuse.js'),
  path = require('path'),
  {ItemAliases} = require(path.join(__dirname, '../data/aliases')),
  {BattleItems} = require(path.join(__dirname, '../data/items')),
  {capitalizeFirstLetter, removeDiacritics} = require(path.join(__dirname, '../util')),
  {oneLine} = require('common-tags');

const itemIntent = function (req, res) {
  try {
    const itemInput = removeDiacritics(req.slot('ITEM'));

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
      aliasSearch = aliasFuse.search(itemInput),
      itemSearch = aliasSearch.length ? itemFuse.search(aliasSearch[0].item) : itemFuse.search(itemInput);

    const itemData = {
      name: capitalizeFirstLetter(itemSearch[0].name),
      description: itemSearch[0].desc,
      gen: itemSearch[0].gen
    };

    const final = oneLine`${itemData.name}, ${itemData.description} It was introduced in generation ${itemData.gen}.`;

    return res.say(final);

  } catch (err) {
    console.error(err);
    throw new Error('Item not found');
  }
};

module.exports = {itemIntent};