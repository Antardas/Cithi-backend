export class Helpers {
  static firstLatterUpperCase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let results = '';
    const characterLength = characters.length;

    for (let i = 0; i < integerLength; i++) {
      results += characters.charAt(Math.floor(Math.random() * characterLength));
    }

    return parseInt(results, 10);
  }
}
