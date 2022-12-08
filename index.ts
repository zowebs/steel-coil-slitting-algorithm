import { Algorithm } from "./Algorithm";
import { Roll } from "./Roll";
import { Strip } from "./Strip";

const rolls = [
  new Roll(11110, "XVH1053555", 1.9, 1250),
  new Roll(11190, "XVH1053556", 1.9, 1250),
  new Roll(11190, "XVH1053557", 1.9, 1250),
  new Roll(11200, "XVH1053558", 1.9, 1250),
  new Roll(11230, "XVH1053559", 1.9, 1250),
  new Roll(11310, "XVH1053560", 1.9, 1250),
  new Roll(11320, "XVH1053561", 1.9, 1250),
  new Roll(11350, "XVH1053562", 1.9, 1250),
  new Roll(11350, "XVH1053563", 1.9, 1250),
  new Roll(11350, "XVH1053564", 1.9, 1250),
  new Roll(11350, "XVH1053565", 1.9, 1250),
];

const strips = [
  // new Strip(85, 46872),
  // new Strip(95, 62400),
  // new Strip(79, 34800),
  new Strip(94, 25000),
  new Strip(120, 8000),
  new Strip(145, 10000),
  new Strip(169, 12000),
  new Strip(143, 25000),
];

const res = Algorithm.run(rolls, strips, 1, 6, 1.1);
if (res) {
  console.log({
    strips: res.output[0].strips,
  });
}
