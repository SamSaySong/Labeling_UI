
export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

export interface Label {
  id: string;
  timestamp: number;
  box: BoundingBox;
}
