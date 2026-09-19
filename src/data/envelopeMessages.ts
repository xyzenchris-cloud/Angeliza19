export interface EnvelopeMessage {
  id: string
  accentColor: 'blush' | 'lavender' | 'mint' | 'gold'
  text: string
  voiceNote?: string
  voiceTooltip?: string
}

export const envelopeMessages: EnvelopeMessage[] = [
  {
    id: 'env-1',
    accentColor: 'blush',
    text: "Babi, pasensya na pala kung minsan, or madalas, kitang naaaway or madalas tayong nag-aaway. Sorry kung minsan napaka-immature at insensitive ko. Gusto kong malaman mo na kahit minsan ay may mga hindi tayo pagkakaintindihan, my love and care for you will never change. Promise ko sa'yo na ginagawa ko ang lahat para maging mabuting boyfriend sa'yo dahil deserve mo. Salamat din sa walang sawang pag-unawa sa mga pagkukulang ko at mga kamaliang nagawa ko sa'yo, bebe chochoc. Tandaan mo lang lagi na kapag may problema at pinagdadaanan ka, either sa pamilya or sa school, nandito lang ako palagi. Hinding-hindi ako magsasawang intindihin at pasayahin ka. 💕",
    voiceNote: '/voiceover/VO1.mp3',
    voiceTooltip: 'Sorry minadali ko lang pag record😅',
  },
  {
    id: 'env-2',
    accentColor: 'mint',
    text: "19 ka na. Medyo nakakatuwa isipin na nasa edad ka na kung saan unti-unti ka nang nagma-mature, pero kahit 19 ka na, minsan mukha ka pa rin talagang 13 years old (Kasi baby ka pa din in my POV). Gustong-gusto ko ang cute at innocent na attitude mo, at sana kahit gaano kapa magmature, manatili kapa ding cute, masayahin, at madaling maasar. Marami ka pang pagdadaanan at matututunan — huwag mong masyadong stressin ang sarili mo sa pag-aaral, gawin mo ang best mo pero huwag mong kalimutang mabuhay at maging happy. Deserve mo ring mag-enjoy sa buhay, kaya okay lang lumabas paminsan-minsan (magmcdo) at mag-blow off ng steam. 🥰\n\nGustong-gusto talaga kitang puntahan ngayon pa lang, kaso malayo pa at wala pang sapat na way e. Pero once na makagraduate ako, gugulatin na kita — makikilala ko na mismo ang mga magulang mo at makikita ko na ang mga litrato mo noong literal na baby ka pa. Susuportahan at mamahalin nalang kita sa abot ng makakaya ko kahit malayo. 🤗",
    voiceNote: '/voiceover/VO2.mp3',
    voiceTooltip: 'Hehe parang may sipon pa',
  },
  {
    id: 'env-3',
    accentColor: 'gold',
    text: "Habang pareho tayong may kanya-kanyang pinagdadaanan sa buhay, sana sabay pa rin tayong maggrow at mag strive despite these challenges. Ang importante, nandito tayo para mag lean on sa isa't isa lalo na pag sobrang bigat na — sana hindi tayo magsawang umintindi, makinig, magpatawad, at magmahal sa bawat panahong lilipas. 💖\n\nKasi honestly, gusto kong nandiyan ako hindi lang sa magaganda o masasayang araw mo, kundi pati na rin kapag nahihirapan ka, pagod ka, o stressed ka. Sana dumating din ang araw na hindi ko na kailangang isipin kung paano kita puntahan — kasi magkasama na tayo. 🫶\n\nSa birthday mo, ang wish ko ay simple lang: sana maging masaya ka, maging proud ka sa sarili mo, at huwag kalimutang mahalin ang sarili mo. Happy 19th birthday, Babi. I love you so much, at sana narito pa rin ako sa bawat kaarawan mong darating. Enjoy your day, my baby. 🎂\n\n— Chris Xyzen Reyes",
    voiceNote: '/voiceover/VO3.mp3',
  },
]
