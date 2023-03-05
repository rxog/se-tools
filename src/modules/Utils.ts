export default class Utils {
  static isset = (field: string, noEmptyString = true): boolean => {
    if (noEmptyString) {
      return field !== null && field !== undefined && field !== "";
    } else {
      return field !== null && field !== undefined;
    }
  };

  static allset = (...fields: any[]): boolean => {
    for (let field of fields) {
      if (!Utils.isset(field)) {
        return false;
      }
    }
    return true;
  };

  static resolves = (path: string, item: any): boolean => {
    let props = path.split(".");
    for (let prop of props) {
      if (item[prop] === undefined) {
        return false;
      }
      item = item[prop];
    }
    return true;
  };

  static funcExists = (funcName: string): boolean => {
    return typeof (window as any)[funcName] !== "undefined";
  };

  static callFunc = (funcName: string, ...params: any[]): void => {
    if (Utils.funcExists(funcName)) {
      (window as any)[funcName](...params);
    }
  };

  static isString = (value: unknown): boolean => {
    return typeof value === "string";
  };

  static trimSpaces = (text: string): string => {
    if (!Utils.isset(text)) return "";
    if (!Utils.isString(text)) return String(text);
    return text.replace(/\s+/g, " ").trim();
  };

  static createList = (
    baseText: string,
    splitter: string = ",",
    deleteEmptyStrings: boolean = false
  ): string[] => {
    if (!Utils.isString(baseText)) return [];
    const list = baseText.split(splitter).map((item) => Utils.trimSpaces(item));
    if (deleteEmptyStrings) {
      return list.filter((item) => item !== "");
    }
    return list;
  };

  static containsText = (
    text: string,
    snippet: string,
    caseSensitive: boolean = false
  ): boolean | null => {
    if (!Utils.isString(text) || !Utils.isString(snippet)) return null;
    return Utils.allset(text, snippet)
      ? (caseSensitive && text.includes(snippet)) ||
          text.toLocaleLowerCase().includes(snippet?.toLocaleLowerCase())
      : false;
  };

  static formatCurrency = (
    amount: number,
    currency: string,
    locale: string | undefined
  ): string => {
    const minimumFractionDigits = Utils.isWholeNumber(amount) ? 0 : 2;
    return amount.toLocaleString(locale, {
      style: "currency",
      minimumFractionDigits,
      currency,
    });
  };

  static matchesRegex = (text: string, regex: RegExp): boolean => {
    return Utils.allset(text, regex) ? regex.test(text) : false;
  };

  static matchRegexGroups = (text: string, regex: RegExp): object | null => {
    const match = regex.exec(text);
    return match?.groups ?? null;
  };

  static divisibleBy = (dividend: number, divisor: number): boolean => {
    return divisor === 0 ? false : dividend % divisor === 0;
  };

  static isWholeNumber = (number: number): boolean => {
    return Utils.divisibleBy(number, 1);
  };

  static nextIterator = (i: number, max: number, step: number = 1): number => {
    return Math.abs(i) >= Math.abs(max) ? 0 : i + step;
  };

  static formatTimerValue = (number: number): string => {
    return String(number).padStart(2, "0");
  };

  static getRandomNumber = (min: number, max: number): number => {
    const realMin = Math.min(min, max);
    const realMax = Math.max(min, max);
    return Math.floor(Math.random() * (realMax - realMin + 1)) + realMin;
  };

  static getRandomDecimal = (
    min: number,
    max: number,
    decimalPlaces: number = 2
  ): number => {
    const randomNumber = Utils.getRandomNumber(
      min * Math.pow(10, decimalPlaces),
      max * Math.pow(10, decimalPlaces)
    );
    return randomNumber / Math.pow(10, decimalPlaces);
  };

  static getPercentageOf = (value: number, percentageOf: number): number => {
    return value > 0 && percentageOf > 0 ? (value / percentageOf) * 100 : 0;
  };

  static getRandomRGBObject = (): { r: number; g: number; b: number } => {
    const r = Utils.getRandomNumber(0, 255);
    const g = Utils.getRandomNumber(0, 255);
    const b = Utils.getRandomNumber(0, 255);
    return { r, g, b };
  };

  static getRandomHexColor = (): string => {
    const { r, g, b } = Utils.getRandomRGBObject();
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  };

  static getRandomRGBColor = (): string => {
    const { r, g, b } = Utils.getRandomRGBObject();
    return `rgb(${r}, ${g}, ${b})`;
  };

  static getRandomRGBAColor = (alpha: number): string => {
    const a = alpha >= 0 && alpha <= 1 ? alpha : 1;
    const { r, g, b } = Utils.getRandomRGBObject();
    return `rgb(${r}, ${g}, ${b}, ${a})`;
  };

  static isChrome = (): boolean => {
    return Utils.matchesRegex(window.navigator.userAgent, /chrom(e|ium)/i);
  };

  static getChromeVersion = (fullVersion: boolean = false): number | string => {
    const match: any = Utils.matchRegexGroups(
      window.navigator.userAgent,
      /chrom(e|ium)\/(?<version>[0-9]+(?:\.[0-9]+){0,3})/i
    );
    const value = match?.version ?? 0;
    return fullVersion ? value : parseInt(value);
  };

  static isOBSBrowserSource = (): boolean => {
    return Utils.isset((window as any).obsstudio);
  };

  static camelCaseToKebabCase = (str: string): string => {
    return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  };

  static kebabCaseToCamelCase = (str: string): string => {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  static parseTier = (
    value: string | number,
    primeAsTier1: boolean = false
  ): string | number => {
    if (value === "prime") return primeAsTier1 ? 1 : value;
    if (typeof value === "string") value = Number(value);
    switch (value) {
      case 1000:
      case 1:
        return 1;
      case 2000:
      case 2:
        return 2;
      case 3000:
      case 3:
        return 3;
      default:
        return 0;
    }
  };
}
