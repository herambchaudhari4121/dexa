/**
 * @file DexIntent - Gets information on a pokemon
 * @module
 * @name dex
 * @example ask Dexa pokemon dragonite
 * @example ask Dexa data on pikachu
 * @param {SpeechValue} PokemonName The name of the pokemon you want to find
 * @returns {Speech} Alexa will give the data on the requested pokemon
 */

const Fuse = require('fuse.js'),
  path = require('path'),
  dexEntries = require(path.join(__dirname, '../data/flavorText.json')),
  {PokeAliases} = require(path.join(__dirname, '../data/aliases')),
  {BattlePokedex} = require(path.join(__dirname, '../data/pokedex')),
  {capitalizeFirstLetter, removeDiacritics} = require(path.join(__dirname, '../util')),
  {oneLine} = require('common-tags');

const dexIntent = function (req, res) {
  try {
    let pokemon = removeDiacritics(req.slot('POKEMON'));

    if (pokemon.split(' ')[0] === 'mega') {
      pokemon = `${pokemon.substring(pokemon.split(' ')[0].length + 1)}mega`;
    }

    /* eslint-disable sort-vars */
    const aliasoptions = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['alias']
      },
      pokeoptions = {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['num', 'species']
      },
      aliasFuse = new Fuse(PokeAliases, aliasoptions),
      pokeFuse = new Fuse(BattlePokedex, pokeoptions),
      firstSearch = pokeFuse.search(pokemon),
      aliasSearch = !firstSearch.length ? aliasFuse.search(pokemon) : null,
      pokeSearch = !firstSearch.length && aliasSearch.length ? pokeFuse.search(aliasSearch[0].name) : firstSearch;
    /* eslint-enable sort-vars */

    const pokeData = {
      abilities: [],
      evos: [],
      prevos: [],
      flavors: '*PokéDex data not found for this Pokémon*',
      genders: '',
      height: pokeSearch[0].heightm,
      number: pokeSearch[0].num,
      species: pokeSearch[0].species,
      types: pokeSearch[0].types,
      weight: pokeSearch[0].weightkg
    };

    if (pokeSearch[0].prevo) {
      pokeData.prevos.push(capitalizeFirstLetter(pokeSearch[0].prevo));

      if (pokeFuse.search(pokeSearch[0].prevo).length && pokeFuse.search(pokeSearch[0].prevo)[0].prevo) {
        pokeData.prevos.push(capitalizeFirstLetter(pokeFuse.search(pokeSearch[0].prevo)[0].prevo));
      }
    }

    if (pokeSearch[0].evos) {
      pokeData.evos.push(pokeSearch[0].evos.map(entry => capitalizeFirstLetter(entry)).join(', '));

      if (pokeSearch[0].evos.length === 1) {
        if (pokeFuse.search(pokeSearch[0].evos[0]).length && pokeFuse.search(pokeSearch[0].evos[0])[0].evos) {
          pokeData.evos.push(pokeFuse.search(pokeSearch[0].evos[0])[0].evos.map(entry => capitalizeFirstLetter(entry)).join(', '));
        }
      }
    }

    for (const ability in pokeSearch[0].abilities) {
      pokeData.abilities.push(pokeSearch[0].abilities[ability]);
    }

    switch (pokeSearch[0].gender) {
    case 'N':
      pokeData.genders = 'None';
      break;
    case 'M':
      pokeData.genders = '100% Male';
      break;
    case 'F':
      pokeData.genders = '100% Female';
      break;
    default:
      pokeData.genders = '50% Male and 50% Female';
      break;
    }

    if (pokeSearch[0].genderRatio) {
      pokeData.genders = `${pokeSearch[0].genderRatio.M * 100}% Male and ${pokeSearch[0].genderRatio.F * 100}% Female`;
    }

    if (pokeSearch[0].num >= 0) {
      if (pokeSearch[0].forme && dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`]) {
        pokeData.flavors = dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`][dexEntries[`${pokeSearch[0].num}${pokeSearch[0].forme.toLowerCase()}`].length - 1].flavor_text;
      } else {
        pokeData.flavors = dexEntries[pokeSearch[0].num][dexEntries[pokeSearch[0].num].length - 1].flavor_text;
      }
    }

    const final = oneLine`${pokeData.species}, number ${pokeData.number}, ${pokeData.flavors}
    It is ${pokeData.types.join(' ')} type.
    ${pokeData.prevos.length ? `It's pre-evolutions are ${pokeData.prevos.join(' and ')}.` : ''}
    ${pokeData.evos.length ? `It evolves into ${pokeData.evos.join(' and ')}.` : ''}
    ${pokeData.species} gets the abilities ${pokeData.abilities.join(' and ')}
    and it is typically ${pokeData.height} meters tall and weighs about ${pokeData.weight} kilograms.
    ${pokeData.species} appears as roughly ${pokeData.genders}.
    `;

    return res
      .say(final)
      .card({
        type: 'Standard',
        title: `Dexa Pokemon Data for ${pokeData.species}`,
        text: final,
        image: {largeImageUrl: `https://favna.xyz/images/ribbonhost/pokesprites/large/${pokeData.species.replace(/ /g, '').toLowerCase()}.png`}
      });
  } catch (err) {
    const prompt = `Sorry, I did not quite catch that. ${req.slot('POKEMON') ? `I think you said ${removeDiacritics(req.slot('POKEMON'))}? ` : ''}Please repeat the pokemon command with a better input, or respond with \`Alexa Cancel\` if you want to stop`;

    return res.say(prompt).reprompt(prompt).shouldEndSession(false);
  }
};

module.exports = {dexIntent};