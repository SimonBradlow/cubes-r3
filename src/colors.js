// colors.js
export const palettes = [
    ['#ffffff', '#0000ff', '#a1004b', '#14004a', '#00a2ff', '#a2a1ff', '#ad73ff'], // 0: OG palette
    ['#3f3f45', '#6e6b6b', '#85cc27', '#ffffff', '#baff29', '#89A7A7', '#848FA5'], // #1 KEEPER
    ['#3f3f45', '#6e6b6b', '#3a0ca3', '#b5179e', '#e16be6', '#7209b7', '#480ca8'], // #2 KEEPER
    ['#ffffff', '#95d600', '#3a0ca3', '#b5179e', '#e16be6', '#7209b7', '#480ca8'], // #3 
    ['#3f3f45', '#6e6b6b', '#6a2dcc', '#ffffff', '#bf0040', '#b595c4', '#d158d1'], // #4 
    ['#5887FF', '#715AFF', '#A682FF', '#ffffff', '#bf4569', '#4F4D72', '#918F8C'], // #5 Keeper
    ['#CC095D', '#9C1057', '#FD0363', '#ffffff', '#0A2344', '#6B1650', '#3B1D4A'], // #6
    ['#9c8fb3', '#ffffff', '#6d5691', '#3C1A70', '#6467bd', '#F8C8B4', '#EA628F'], // #7
]

export const accents = palettes[Math.floor(Math.random() * palettes.length)]

// DEBUG:
//const accents = ['#3f3f45', '#6e6b6b', '#6a2dcc', '#ffffff', '#bf0040', '#b595c4', '#d158d1'] // #2 KEEPER