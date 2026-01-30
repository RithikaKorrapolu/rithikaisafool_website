// Shared poster data - add new posters to this array each week!
export const POSTERS = [
  { id: 3, label: "Poster 3", link: null, shop: true, clientWork: false },
  { id: 8, label: "Client Work", link: null, shop: false, clientWork: true },
  { id: 9, label: "Specific Things We Like", link: "https://specificthingswelike.substack.com/", shop: true, clientWork: false },
  { id: 4, label: "Poster 4", link: "/shop/the-creative-care-package", shop: true, clientWork: false },
  { id: 6, label: "Voicemail Show", link: "/voicemail-show", shop: false, clientWork: false },
  { id: 5, label: "Poster 5", link: "/shop/condition-of-the-month-hat-1", shop: true, clientWork: true },
  { id: 10, label: "Poster 9", link: "/shop/a-stranger-designed-my-sweatshirt", shop: true, clientWork: false },
];

export type Poster = typeof POSTERS[number];
