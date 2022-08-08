import { Category } from "./category";

export class Odd {
  public id: number;
  public name: string;
  public number: string;
  public count_osc: number;
  public logo_odd: string;
  public color: string;
  //public categories: Category[] = [];

  public constructor(
    id: number,
    name: string,
    number: string,
    count_osc: number,
    logo_odd: string,
    color: string
  ) {
    this.id = id;
    this.name = name;
    this.number = number;
    this.count_osc = count_osc;
    this.logo_odd = logo_odd;
    this.color = color;
  }
}
