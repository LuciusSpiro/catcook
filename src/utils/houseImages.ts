import house1 from "../assets/house1.png";
import house2 from "../assets/house2.png";
import house3 from "../assets/house3.png";
import house4 from "../assets/house4.png";

const HOUSE_IMAGES = [house1, house2, house3, house4] as const;

/** Get the house image for a household by its index (0-3). */
export function getHouseImage(index: number): string {
  return HOUSE_IMAGES[index % HOUSE_IMAGES.length];
}
