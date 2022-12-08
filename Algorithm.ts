import { Roll } from "./Roll";
import { Strip } from "./Strip";

export class Algorithm {
  private static MIN_WASTE: number;
  private static MAX_WASTE: number;
  private static MAX_PERCENT_ABOVE_LIMIT: number;
  private static ROLLS_USED_FOR_MERGE: Roll[];
  private static STOP_REQUIRED: boolean = false;
  private static MAX_RUN_TIME_MILIS: number = 15000;
  private static START_TIME: number;
  private static TIME_OUT: boolean = false;

  public static run(
    rolls: Roll[],
    strips: Strip[],
    minWaste: number,
    maxWaste: number,
    percentAbove: number
  ) {
    this.MIN_WASTE = minWaste;
    this.MAX_WASTE = maxWaste;
    this.MAX_PERCENT_ABOVE_LIMIT = percentAbove;

    this.START_TIME = new Date().getTime();

    const output = this.createConnections(rolls, strips);

    if (this.TIME_OUT) {
      this.TIME_OUT = false;
      this.STOP_REQUIRED = false;
      return false;
    }

    return {
      output,
      rollsUsedForMerge: this.ROLLS_USED_FOR_MERGE,
    };
  }

  /**
   * @param rolls pole svitků
   * @param strips pole pásek
   * @returns pole svitků, kde první svitek je spojenina, a za ním jsou ty, co vypadli
   */
  private static createConnections(rolls: Roll[], strips: Strip[]): Roll[] {
    const thrownAwayRolls: Roll[] = [];

    const times = rolls.length;
    for (let i = 0; i < times; i++) {
      const occurences = this.countMaxOccurences(rolls, strips);

      const mergedRollWeight = rolls
        .map((roll) => roll.weight)
        .reduce((a, b) => a + b, 0);

      const mergedRoll = new Roll(
        mergedRollWeight,
        "1",
        rolls[0].thickness,
        rolls[0].width
      );

      this.ROLLS_USED_FOR_MERGE = rolls;

      const stripLenghts = this.runStripFinder(occurences, strips, mergedRoll);
      // console.log(stripLenghts);

      const areLenghtsFound = stripLenghts.reduce((a, b) => a + b, 0) > 0;
      if (!areLenghtsFound) {
        console.log("No match found, removing roll");
        thrownAwayRolls.push(rolls.pop());
        continue;
      }

      const mapped = this.mapStripsWithLength(strips, stripLenghts);
      mergedRoll.strips = mapped;
      this.addWeightToStrips(mergedRoll);

      // console.log(mergedRoll);

      thrownAwayRolls.unshift(mergedRoll);

      this.STOP_REQUIRED = false;
      break;
    }

    return thrownAwayRolls;
  }

  /**
   * @param rolls pole svitků
   * @param  strips pole pásek
   * @returns pole s maximálním počtem pásek co se vejde do sloučení všech svitků
   */
  private static countMaxOccurences(rolls: Roll[], strips: Strip[]): number[] {
    const maxOccurences: number[] = [];
    const rollsWidth = rolls[0].width;
    const rollsWeight = rolls
      .map((roll) => roll.weight)
      .reduce((a, b) => a + b, 0);

    for (let i = 0; i < strips.length; i++) {
      const strip = strips[i];

      const weightOfOneStrip = (rollsWeight / rollsWidth) * strip.width;
      const stillNeededWeight = strip.neededWeight - strip.currentWeight;

      let stillNecessaryStrips = Math.ceil(
        stillNeededWeight / weightOfOneStrip
      );

      while (
        stillNecessaryStrips * weightOfOneStrip >
        stillNeededWeight * this.MAX_PERCENT_ABOVE_LIMIT
      ) {
        if (stillNecessaryStrips === 0) break;

        stillNecessaryStrips--;
      }

      let numberOfMaxOccurences = Math.ceil(rollsWidth / strip.width);

      while (
        numberOfMaxOccurences * weightOfOneStrip >
        stillNeededWeight * this.MAX_PERCENT_ABOVE_LIMIT
      ) {
        if (numberOfMaxOccurences === 0) break;

        numberOfMaxOccurences--;
      }

      maxOccurences[i] = Math.min(stillNecessaryStrips, numberOfMaxOccurences);
    }

    return maxOccurences;
  }

  /**
   * @param  occurences pole počtů pásek
   * @param  strips pole pásek
   * @param  roll svitek
   * @returns  pole s šířkama pásek jak se vejdou do svitku
   */
  private static runStripFinder(
    occurences: number[],
    strips: Strip[],
    roll: Roll
  ): number[] {
    if (occurences.length !== strips.length || occurences.length === 0) {
      console.error("CRITICAL ERROR, runStripFinder");
    }

    const stripLenghts = strips.map((strip) => strip.width);

    // hledání funguje tak, že se zkouší od posledního prvku, je nutné otočit pole od indexu 1 do konce
    const modifiedOccurences: number[] =
      this.reverseElementsExceptOfFirst(occurences);
    const modifiedStripLenghts: number[] =
      this.reverseElementsExceptOfFirst(stripLenghts);

    console.log("Occurences: INITIAL->SORTED", occurences, modifiedOccurences);
    console.log("Strips: INITIAL->SORTED", stripLenghts, modifiedStripLenghts);

    const saveHere: number[] = [];

    for (let first = modifiedOccurences[0]; first >= 0; first--) {
      if (this.STOP_REQUIRED) break;
      const currentIndexes = [first];
      this.tryCombination(
        modifiedOccurences,
        modifiedStripLenghts,
        roll,
        1,
        currentIndexes,
        saveHere
      );
    }

    const finalVersion: number[] = this.reverseElementsExceptOfFirst(saveHere);

    return finalVersion;
  }

  /**
   * rekurzivně hledá výsledek pro naskládání pásek do svitku, který pak uloží do pole "saveHere"
   * @param  occurences pole s maximálními výskyty
   * @param  stripLenghts délky pásek
   * @param  roll svitek
   * @param  index momentální index
   * @param  currentIndexes momentální počty pásek na pozicích
   * @param  saveHere pole, kam se uloží výsledek
   */
  private static tryCombination(
    occurences: number[],
    stripLenghts: number[],
    roll: Roll,
    index: number,
    currentIndexes: number[],
    saveHere: number[]
  ) {
    if (new Date().getTime() - this.START_TIME > this.MAX_RUN_TIME_MILIS) {
      this.STOP_REQUIRED = true;
      this.TIME_OUT = true;
    }

    if (occurences.length === 1) {
      const one_noRefCurrentIndexes = [...currentIndexes];

      const one_sum = one_noRefCurrentIndexes[0] * stripLenghts[0];

      console.log(one_noRefCurrentIndexes, `sum_ofOne: ${one_sum}`);

      const one_isOk = this.isCorrect(
        roll,
        one_sum,
        saveHere,
        one_noRefCurrentIndexes,
        stripLenghts
      );
      if (one_isOk) return;
    }

    if (occurences.length <= index || this.STOP_REQUIRED) return;

    for (let cycle = 0; cycle <= occurences[index]; cycle++) {
      if (this.STOP_REQUIRED) break;

      const noRefCurrentIndexes = [...currentIndexes, cycle];

      let sum = 0;
      for (let i = 0; i <= index; i++) {
        sum += noRefCurrentIndexes[i] * stripLenghts[i];
      }

      console.log(noRefCurrentIndexes, `sum: ${sum}`);

      const isOk = this.isCorrect(
        roll,
        sum,
        saveHere,
        noRefCurrentIndexes,
        stripLenghts
      );
      if (isOk) return;

      this.tryCombination(
        occurences,
        stripLenghts,
        roll,
        index + 1,
        noRefCurrentIndexes,
        saveHere
      );
    }
  }

  /**
   * @param array pole prvků
   * @returns pole, kde 0. index je na svém místě, ale ostatní jsou v opačném pořadí
   */
  private static reverseElementsExceptOfFirst(array: any): any[] {
    const [first, ...others] = array;
    others.reverse();

    return [first, ...others];
  }

  /**
   * vytvoří mapu, kde se k páskám přiřadí jejich počty
   * @param  strips pásky
   * @param  lenghts počty pásek
   * @returns  mapa pásek-jejich počtů
   */
  private static mapStripsWithLength(
    strips: Strip[],
    lenghts: number[]
  ): Map<Strip, number> {
    if (strips.length !== lenghts.length) {
      console.error("CRITICAL ERROR, mapStripsWithLengtg");
      // console.log(strips, lenghts);

      return null;
    }

    const result = new Map();
    for (let i = 0; i < strips.length; i++) {
      result.set(strips[i], lenghts[i]);
    }

    return result;
  }

  /**
   * přidá vyrobené váhy do pásek v daném svitku
   * @param roll svitek
   */
  private static addWeightToStrips(roll: Roll) {
    const strips = roll.strips;

    if (!strips) return;

    strips.forEach((value, key) => {
      const weightOfOneStrip = (roll.weight / roll.width) * key.width;
      const weightOfAllStrips = weightOfOneStrip * value;

      key.addWeight(weightOfAllStrips);
    });
  }

  /**
   * určí, zda je požadovaná kombinace vhodná do svitku, pokud ano, vrátí true
   * pokud ne, tak false
   * pole příp. uloží do parametru saveHere
   * @param  roll svitek
   * @param  sum součet délek
   * @param  saveHere pole, kam se uloží výsledek
   * @param  currentIndexes momentální počty pásek na pozicích
   * @param  stripLenghts délky pásek
   * @returns true/false podle toho zda se povedlo či nikoliv
   */
  private static isCorrect(
    roll: Roll,
    sum: number,
    saveHere: number[],
    currentIndexes: number[],
    stripLenghts: number[]
  ): boolean {
    if (
      roll.width - this.MAX_WASTE * 2 <= sum &&
      sum <= roll.width - this.MIN_WASTE * 2
    ) {
      console.log("MATCH FOUND", currentIndexes);
      saveHere.push(...currentIndexes);

      const saveHereLength = saveHere.length;
      const mustHave = stripLenghts.length;
      const missing = mustHave - saveHereLength;

      for (let x = 0; x < missing; x++) saveHere.push(0); //doplní nuly, aby bylo pole stejné velikosti a nedělalo to pak bordel, pokud se najde kombinace zrovna když je tam nějaký svitek 0x

      this.STOP_REQUIRED = true;
      return true;
    }

    return false;
  }
}
