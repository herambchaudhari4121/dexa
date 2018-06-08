/**
 * @file TypeIntent - Get the type matchup of any one or two types
 * @module
 * @name type
 * @example ask Dexa type dragon
 * @example ask Dexa type fire water
 * @param {SpeechValue} Type The name of the type you want to know the matchups for
 * @param {SpeechValue} [SecondType] An optional secondary type to go along with the first one
 * @returns {Speech} Alexa will give the type matchups of the request
 */

const path = require('path'),
  {BattleTypeChart} = require(path.join(__dirname, '../data/typechart')),
  {capitalizeFirstLetter, removeDiacritics} = require(path.join(__dirname, '../util')),
  {oneLine} = require('common-tags');

const typeIntent = function (req, res) {
  try {
    const types = removeDiacritics(req.slot('TYPE'));

    const atkMulti = {
        Bug: 1,
        Dark: 1,
        Dragon: 1,
        Electric: 1,
        Fairy: 1,
        Fighting: 1,
        Fire: 1,
        Flying: 1,
        Ghost: 1,
        Grass: 1,
        Ground: 1,
        Ice: 1,
        Normal: 1,
        Poison: 1,
        Psychic: 1,
        Rock: 1,
        Steel: 1,
        Water: 1
      },
      atkNoRaw = [],
      atkNoTypes = [],
      atkNormalRaw = [],
      atkNormalTypes = [],
      atkResistRaw = [],
      atkResistTypes = [],
      atkVulnDisplay = [],
      atkVulnRaw = [],
      atkVulnTypes = [],
      defMulti = {
        Bug: 1,
        Dark: 1,
        Dragon: 1,
        Electric: 1,
        Fairy: 1,
        Fighting: 1,
        Fire: 1,
        Flying: 1,
        Ghost: 1,
        Grass: 1,
        Ground: 1,
        Ice: 1,
        Normal: 1,
        Poison: 1,
        Psychic: 1,
        Rock: 1,
        Steel: 1,
        Water: 1
      },
      displayTypes = [],
      noRaw = [],
      noTypes = [],
      normalRaw = [],
      normalTypes = [],
      resistRaw = [],
      resistTypes = [],
      vulnDisplay = [],
      vulnRaw = [],
      vulnTypes = [];

    let atkNoCheck = false,
      atkNormalCheck = false,
      atkResistCheck = false,
      atkVulnCheck = false,
      noCheck = false,
      normalCheck = false,
      resistCheck = false,
      vulnCheck = false;

    for (let z = 0; z < types.split(' ').length; z += 1) {
      const argsSplit = types.split(' ')[z];

      if (Object.keys(BattleTypeChart).map(c => c.toLowerCase())
        .indexOf(argsSplit.toLowerCase()) !== -1) {

        const toType = capitalizeFirstLetter(argsSplit),
          dTaken = BattleTypeChart[toType].damageTaken; // eslint-disable-line sort-vars

        displayTypes.push(toType);

        for (const toMatch in dTaken) {
          if (defMulti[toMatch] && dTaken[toMatch] === 1) {
            defMulti[toMatch] *= 2;
          } else if (defMulti[toMatch] && dTaken[toMatch] === 2) {
            defMulti[toMatch] *= 0.5;
          } else if (defMulti[toMatch] && dTaken[toMatch] === 3) {
            defMulti[toMatch] = 0;
          }
        }

        for (const toMatch in BattleTypeChart) {
          if (atkMulti[toMatch]) {
            if (BattleTypeChart[toMatch].damageTaken[toType] === 1) {
              atkMulti[toMatch] *= 2;
            } else if (BattleTypeChart[toMatch].damageTaken[toType] === 2) {
              atkMulti[toMatch] *= 0.5;
            } else if (BattleTypeChart[toMatch].damageTaken[toType] === 3) {
              atkMulti[toMatch] *= 0;
            }
          }
        }
      }

      for (const def in defMulti) {
        if (defMulti[def] > 1) {
          vulnCheck = true;
        }
        if (defMulti[def] === 1) {
          normalCheck = true;
        }
        if (defMulti[def] > 0 && defMulti[def] < 1) {
          resistCheck = true;
        }
        if (defMulti[def] === 0) {
          noCheck = true;
        }
      }

      for (const atk in atkMulti) {
        if (atkMulti[atk] > 1) {
          atkVulnCheck = true;
        }
        if (atkMulti[atk] === 1) {
          atkNormalCheck = true;
        }
        if (atkMulti[atk] > 0 && atkMulti[atk] < 1) {
          atkResistCheck = true;
        }
        if (atkMulti[atk] === 0) {
          atkNoCheck = true;
        }
      }
    }

    for (const defense in defMulti) {
      if (vulnCheck && defMulti[defense] > 1 && vulnRaw.indexOf(defMulti[defense]) === -1) {
        vulnTypes.push(`${defense} (x${defMulti[defense]})`);
        vulnRaw.push(defMulti[defense]);
        vulnDisplay[0] = `Vulnerable to: ${vulnTypes.join(', ')}`;
      }

      if (normalCheck && defMulti[defense] === 1 && normalRaw.indexOf(defMulti[defense]) === -1) {
        normalTypes.push(defense);
        normalRaw.push(defense);

        vulnDisplay[1] = `Takes normal damage from: ${normalTypes.join(', ')}`;
      }

      if (resistCheck && defMulti[defense] > 0 && defMulti[defense] < 1 && resistRaw.indexOf(defMulti[defense]) === -1) {
        resistTypes.push(`${defense} (x${defMulti[defense]})`);
        resistRaw.push(defMulti[defense]);

        vulnDisplay[2] = `Resists: ${resistTypes.join(', ')}`;
      }

      if (noCheck && defMulti[defense] === 0 && noRaw.indexOf(defMulti[defense]) === -1) {
        noTypes.push(defense);
        noRaw.push(defense);
        vulnDisplay[3] = `Not affected by: ${noTypes.join(', ')}`;
      }
    }

    for (const attack in atkMulti) {
      if (atkVulnCheck && atkMulti[attack] > 1 && atkVulnRaw.indexOf(atkMulti[attack]) === -1) {
        atkVulnTypes.push(`${attack} (x${atkMulti[attack]})`);
        atkVulnRaw.push(atkMulti[attack]);
        atkVulnDisplay[0] = `Supereffective against: ${atkVulnTypes.join(', ')}`;
      }

      if (atkNormalCheck && atkMulti[attack] === 1 && atkNormalRaw.indexOf(atkMulti[attack]) === -1) {
        atkNormalTypes.push(attack);
        atkNormalRaw.push(attack);

        atkVulnDisplay[1] = `Deals normal damage to: ${atkNormalTypes.join(', ')}`;
      }

      if (atkResistCheck && atkMulti[attack] > 0 && atkMulti[attack] < 1 && atkResistRaw.indexOf(atkMulti[attack]) === -1) {
        atkResistTypes.push(`${attack} (x${atkMulti[attack]})`);
        atkResistRaw.push(atkMulti[attack]);

        atkVulnDisplay[2] = `Not very effective against: ${atkResistTypes.join(', ')}`;
      }

      if (atkNoCheck && atkMulti[attack] === 0 && atkNoRaw.indexOf(atkMulti[attack]) === -1) {
        atkNoTypes.push(attack);
        atkNoRaw.push(attack);
        atkVulnDisplay[3] = `Doesn't affect: ${atkNoTypes.join(', ')}`;
      }
    }

    const final = oneLine`${displayTypes.join(' ')} is ${atkVulnDisplay[0]}, ${atkVulnDisplay[1]},
    ${atkVulnDisplay[3] ? '' : 'and'} is ${atkVulnDisplay[2]} ${atkVulnDisplay[3] ? `and ${atkVulnDisplay[3]}` : ''}.
    Furthermore, ${displayTypes.join(' ')} is ${vulnDisplay[0]},${vulnDisplay[1]},
    ${vulnDisplay[3] ? '' : 'and '}${vulnDisplay[2]} ${vulnDisplay[3] ? `and is ${vulnDisplay[3]}` : ''}`.replace(/x([0-9]{1}(\.[0-9]){0,1})/gm, 'times $1');

    return res.say(final);
  } catch (err) {
    console.error(err);
    throw new Error('Type not found');
  }
};

module.exports = {typeIntent};