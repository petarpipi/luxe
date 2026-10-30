export const categories = [
  'All pieces',
  'Seating',
  'Sofas',
  'Tables',
  'Lighting',
  'Storage',
  'Objects',
] as const
export type Category = (typeof categories)[number]

export type ImageName = keyof typeof images

/** Intrinsic size of the largest prepared variant of each photograph. */
export const images = {
  hero: { width: 2000, height: 3000 },
  chair: { width: 1400, height: 2100 },
  sofa: { width: 1400, height: 2100 },
  table: { width: 1400, height: 2100 },
  lamp: { width: 1400, height: 2100 },
  sideboard: { width: 1400, height: 2100 },
  vase: { width: 1400, height: 1922 },
  orbit: { width: 1600, height: 1999 },
  dune: { width: 1600, height: 2400 },
  colonna: { width: 1600, height: 2400 },
  philosophy: { width: 1600, height: 2400 },
  detail: { width: 960, height: 1280 },
  wood: { width: 1600, height: 1067 },
  stone: { width: 1400, height: 1050 },
  linen: { width: 1400, height: 2100 },
  alcove: { width: 1600, height: 2400 },
  dining: { width: 1600, height: 2326 },
  morning: { width: 2000, height: 1333 },
  cafe: { width: 1600, height: 2400 },
  rest: { width: 1600, height: 2400 },
  plaster: { width: 1600, height: 2133 },
} as const

export interface Product {
  id: string
  name: string
  category: Exclude<Category, 'All pieces'>
  price: number
  image: ImageName
  alt: string
  material: string
  dimensions: string
  description: string
}

export const products: Product[] = [
  {
    id: 'arca',
    name: 'Arca Lounge Chair',
    category: 'Seating',
    price: 2180,
    image: 'chair',
    alt: 'Ivory bouclé lounge chair with tapered oak legs beside a round bouclé ottoman',
    material: 'Bouclé wool · Oiled oak legs',
    dimensions: 'W 74 × D 80 × H 82 cm',
    description:
      'A compact wing chair with a softly rounded back. The seat sits a little lower than usual, made for reading rather than perching.',
  },
  {
    id: 'soma',
    name: 'Soma Modular Sofa',
    category: 'Sofas',
    price: 4950,
    image: 'sofa',
    alt: 'Close view of a modular sofa in pale woven fabric with a stoneware vessel on the floor',
    material: 'Woven linen blend · Removable covers',
    dimensions: 'W 248 × D 98 × H 72 cm (three modules)',
    description:
      'Square modules with a generous seat and a low, even back. Rearrange them as a straight sofa, a corner or a long bench.',
  },
  {
    id: 'linea',
    name: 'Linea Dining Table',
    category: 'Tables',
    price: 3400,
    image: 'table',
    alt: 'Solid oak dining table set with stoneware bowls, a linen cloth and pears in soft daylight',
    material: 'Solid European oak · Natural oil',
    dimensions: 'W 220 × D 95 × H 75 cm',
    description:
      'A long, thin-edged top on recessed legs, so the table reads as one calm plane. Seats eight without anyone sitting on a corner.',
  },
  {
    id: 'lume',
    name: 'Lume Table Lamp',
    category: 'Lighting',
    price: 390,
    image: 'lamp',
    alt: 'Cream stoneware table lamp with an open loop base and linen shade on an oak sideboard',
    material: 'Glazed stoneware · Linen shade',
    dimensions: 'Ø 26 × H 44 cm',
    description:
      'A looped stoneware base under a straight linen drum. The light is warm and low, meant for a sideboard or a reading table.',
  },
  {
    id: 'alto',
    name: 'Alto Sideboard',
    category: 'Storage',
    price: 3150,
    image: 'sideboard',
    alt: 'Low walnut sideboard with a pale top in a dining room, styled with candles and a small sculpture',
    material: 'Solid walnut · Pale lacquered top',
    dimensions: 'W 200 × D 45 × H 72 cm',
    description:
      'Four push-to-open doors behind a continuous walnut front. Inside, adjustable shelves and room for long serving plates.',
  },
  {
    id: 'terra',
    name: 'Terra Vessel',
    category: 'Objects',
    price: 160,
    image: 'vase',
    alt: 'Round sand-coloured stoneware vessel with an open centre against a plain warm backdrop',
    material: 'Matte stoneware · Unglazed finish',
    dimensions: 'W 30 × D 10 × H 32 cm',
    description:
      'A ring of raw stoneware with a narrow neck. It holds a single dry stem, or nothing at all.',
  },
]

export interface SignaturePiece extends Product {
  note: string
}

export const signaturePieces: SignaturePiece[] = [
  {
    id: 'orbit',
    name: 'Orbit Swivel Chair',
    category: 'Seating',
    price: 2640,
    image: 'orbit',
    alt: 'Rounded ivory bouclé swivel chair on a seamless cream background',
    material: 'Bouclé wool · Concealed steel swivel',
    dimensions: 'W 86 × D 80 × H 70 cm',
    description:
      'A low, rounded seat on a hidden swivel base. It turns toward the window, the fire or the conversation without being moved.',
    note: 'Swivel',
  },
  {
    id: 'dune',
    name: 'Dune Sofa',
    category: 'Sofas',
    price: 6200,
    image: 'dune',
    alt: 'Curved tobacco-brown bouclé sofa in a dark room, lit by a single shaft of sunlight',
    material: 'Tobacco bouclé · Beech frame',
    dimensions: 'W 260 × D 105 × H 70 cm',
    description:
      'Deep, curved and close to the floor. The seat depth leaves room to tuck your feet up, and the back is soft enough to lean into.',
    note: 'Curved',
  },
  {
    id: 'colonna',
    name: 'Colonna Dining Table',
    category: 'Tables',
    price: 4800,
    image: 'colonna',
    alt: 'Round dining table on a fluted pedestal beside open oak shelving and sheer curtains',
    material: 'Honed travertine top · Fluted pedestal',
    dimensions: 'Ø 120 × H 75 cm',
    description:
      'A round stone top on a single fluted column, so every chair finds room and no leg gets in the way.',
    note: 'Pedestal',
  },
]

export const journal = [
  {
    image: 'alcove',
    title: 'The reading alcove',
    label: 'Reading corner',
    alt: 'Rust armchair in a deep arched alcove beneath a window that opens onto a garden',
  },
  {
    image: 'dining',
    title: 'A long table, late light',
    label: 'Dining',
    alt: 'Dining room with an oak table, cane chairs, tall linen curtains and branches in a vase',
  },
  {
    image: 'morning',
    title: 'First light on oak',
    label: 'Light study',
    alt: 'Long morning shadows from tall windows across pale oak floorboards',
  },
  {
    image: 'cafe',
    title: 'Marble and bentwood',
    label: 'Kitchen corner',
    alt: 'Round marble table with bentwood chairs beside a timber bench and a potted snake plant',
  },
  {
    image: 'rest',
    title: 'Linen, before noon',
    label: 'Bedroom',
    alt: 'Unmade linen bed beside an oak shelf holding a dark vase with a dried stem',
  },
  {
    image: 'plaster',
    title: 'Raw plaster, soft sheets',
    label: 'Bedroom',
    alt: 'Bedroom with a raw plaster wall, rumpled linen bedding and plants in the morning sun',
  },
] satisfies { image: ImageName; title: string; label: string; alt: string }[]

export const allPieces: Product[] = [...products, ...signaturePieces]

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)

export const pad = (value: number) => String(value).padStart(2, '0')
