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

    const poke = pokeSearch[0],
      pokeData = {
        abilities: [],
        evos: [],
        prevos: [],
        flavors: '*PokéDex data not found for this Pokémon*',
        genders: '',
        height: poke.heightm,
        number: poke.num,
        species: poke.species,
        types: poke.types,
        weight: poke.weightkg
      };

    if (poke.prevo) {
      pokeData.prevos.push(`${capitalizeFirstLetter(poke.prevo)}, (${isNaN(poke.evoLevel) ? `Special Condition; ${poke.evoLevel}` : `Level ${poke.evoLevel}`})`);

      if (pokeFuse.search(poke.prevo).length && pokeFuse.search(poke.prevo)[0].prevo) {
        const stagedPrevo = pokeFuse.search(poke.prevo)[0];

        pokeData.prevos.push(`${capitalizeFirstLetter(stagedPrevo.prevo)}, (${isNaN(stagedPrevo.evoLevel) ? `Special Condition; ${stagedPrevo.evoLevel}` : `Level ${stagedPrevo.evoLevel}`})`);
      }
    }

    if (poke.evos) {
      pokeData.evos.push(poke.evos.map(entry => `${capitalizeFirstLetter(entry)}, (${isNaN(pokeFuse.search(entry)[0].evoLevel) ? `Special Condition; ${pokeFuse.search(entry)[0].evoLevel}` : `Level ${pokeFuse.search(entry)[0].evoLevel}`})`).join(', '));

      if (poke.evos.length === 1) {
        if (pokeFuse.search(poke.evos[0]).length && pokeFuse.search(poke.evos[0])[0].evos) {
          const stagedEvo = pokeFuse.search(poke.evos[0])[0];

          pokeData.evos.push(stagedEvo.evos.map(entry => `${capitalizeFirstLetter(entry)}, (${isNaN(pokeFuse.search(entry)[0].evoLevel) ? `Special Condition; ${pokeFuse.search(entry)[0].evoLevel}` : `Level ${pokeFuse.search(entry)[0].evoLevel}`})`).join(', '));
        }
      }
    }

    for (const ability in poke.abilities) {
      pokeData.abilities.push(poke.abilities[ability]);
    }

    switch (poke.gender) {
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

    if (poke.genderRatio) {
      pokeData.genders = `${poke.genderRatio.M * 100}% Male and ${poke.genderRatio.F * 100}% Female`;
    }

    if (poke.num >= 0) {
      if (poke.forme && dexEntries[`${poke.num}${poke.forme.toLowerCase()}`]) {
        pokeData.flavors = dexEntries[`${poke.num}${poke.forme.toLowerCase()}`][dexEntries[`${poke.num}${poke.forme.toLowerCase()}`].length - 1].flavor_text;
      } else {
        pokeData.flavors = dexEntries[poke.num][dexEntries[poke.num].length - 1].flavor_text;
      }
    }

    const final = oneLine`${pokeData.species}, number ${pokeData.number}, ${pokeData.flavors}
    It is ${pokeData.types.join(' ')} type.
    ${pokeData.prevos.length ? `It's pre-evolutions are ${pokeData.prevos.join(' and ')}.` : ''}
    ${pokeData.evos.length ? `It evolves into ${pokeData.evos.join(' and ')}.` : ''}
    ${pokeData.species} gets the abilities ${pokeData.abilities.join(' and ')}
    and it is typically ${pokeData.height} meters tall and weighs about ${pokeData.weight} kilograms.
    ${pokeData.genders !== 'None' ? `${pokeData.species} appears as roughly ${pokeData.genders}` : `${pokeData.species} has no gender`}.
    `;

    return res
      .say(final)
      .card({
        type: 'Standard',
        title: `Dexa Pokemon Data for ${pokeData.species}`,
        text: final,
        image: {largeImageUrl: `https://storage.googleapis.com/data-sunlight-146313.appspot.com/ribbon/pokesprites/large/${pokeData.species.replace(/ /g, '').toLowerCase()}.png`}
      });
  } catch (err) {
    console.error(err);
    const prompt = `Sorry, I did not quite catch that. ${req.slot('POKEMON') ? `I think you said ${removeDiacritics(req.slot('POKEMON'))}? ` : ''}Please repeat the pokemon command with a better input, or respond with "Alexa Cancel" if you want to stop`;

    return res.say(prompt).reprompt(prompt).shouldEndSession(false);
  }
};

module.exports = {dexIntent};