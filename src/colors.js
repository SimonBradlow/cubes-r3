// colors.js
export const palettes = [
    ['#ffffff', '#0000ff','#00a2ff', '#ffffff', '#a0dafa', '#a2a1ff', '#ad73ff', '#a1004b', '#14004a', ], // 0
    ['#525257', '#807d7d','#89A7A7', '#848FA5', '#a9c7c7'], // 1
    ['#525257', '#807d7d', '#85cc27', '#ffffff', '#c8ff54', '#baff29', '#89A7A7', '#848FA5'], // 2 
    ['#525257', '#807d7d', '#3a0ca3', '#b5179e', '#fc9dee', '#e16be6', '#7209b7', '#480ca8'], // 3 
    ['#ffffff', '#85cc27','#ffffff', '#baff29', '#c8ff54'], // 4
    ['#6a2dcc', '#ffffff',  '#b595c4', '#d158d1', '#c0a9f5', '#fc9dee'], // 5
    ['#5887FF', '#715AFF', '#A682FF', '#ffffff', '#c0a9f5', '#bf4569', '#4F4D72', '#918F8C'], // 6
    ['#CC095D', '#9C1057', '#FD0363', '#ffffff','#fc9dee', '#0A2344', '#6B1650', '#3B1D4A'], // 7 
    ['#9c8fb3', '#ffffff', '#6d5691', '#3C1A70', '#c0a9f5', '#6467bd', '#F8C8B4', '#EA628F'], // 8
]

export const accents = palettes[Math.floor(Math.random() * palettes.length)]

// DEBUG:
//const accents = ['#3f3f45', '#6e6b6b', '#6a2dcc', '#ffffff', '#bf0040', '#b595c4', '#d158d1'] // #2 KEEPER