const Fuse = require('fuse.js'),
  path = require('path'),
  {BattleItems} = require(path.join(__dirname, '../data/items')),
  {capitalizeFirstLetter} = require(path.join(__dirname, '../util')),
  {oneLine} = require('common-tags');

const item = function (req, res) {
  try {
    const itemInput = req.slot('ITEM');

    const fsoptions = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias', 'item', 'id', 'name']
      },
      itemFuse = new Fuse(BattleItems, fsoptions),
      itemSearch = itemFuse.search(itemInput);

    const itemData = {
      name: capitalizeFirstLetter(itemSearch[0].name),
      description: itemSearch[0].desc,
      gen: itemSearch[0].gen
    };

    const final = oneLine`${itemData.name}, ${itemData.description} It was introduced in generation ${itemData.gen}.`;

    return res.say(final);

  } catch (err) {
    console.error(err);
    throw new Error('Pokemon not found');
  }
};

module.exports = {item};