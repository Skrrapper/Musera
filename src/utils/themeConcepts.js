const createArtwork = (id, title, image) => ({
  id,
  title,
  image
})

const themePeriods = [
  {
    vol: 3,
    title: '自然与寂静',
    img: 'https://picsum.photos/seed/muse-theme-3/1200/1600',
    previewVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    guideLabel: '季度导览',
    guideTitle: '从感知进入表达',
    summary: '这一季以自然肌理、留白和安静色温为线索，让观看先慢下来，再进入作品的材料、比例与情绪。',
    guideSections: [
      {
        title: '导览一',
        text: '从雾白、浅土与低饱和绿开始，本季先建立柔和的视觉气候，让视线停在表面与呼吸感上。'
      },
      {
        title: '导览二',
        text: '器物与图像都被放在更克制的陈列关系里，重点不是“陈设完成”，而是感受作品如何与空间发生共振。'
      },
      {
        title: '导览三',
        text: '进入季度概念页后，不再先看售卖信息，而是先进入每位艺术家对本季命题的理解。'
      }
    ],
    concepts: [
      {
        id: 'v3-linshen',
        title: '雾白的留驻',
        summary: '通过纤维、纸浆和浅土色的反复覆盖，讨论自然里最慢的显影方式。',
        image: 'https://picsum.photos/seed/muse-concept-v3-linshen/960/1280',
        stats: { views: 1320, likes: 284, collections: 96 },
        detail: [
          '我想把“自然”从风景里拿出来，转成材质表面上的缓慢变化。看起来轻，但内部其实有很多停顿与压缩。',
          '这一季的概念不是直接描绘植物或山石，而是借由纸浆、灰白与柔和边界，让观看先停住，再进入作品内部。'
        ],
        artist: {
          id: 301,
          name: '林深',
          avatar: 'https://picsum.photos/seed/muse-artist-linshen/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-linshen/1200/800',
          bio: '林深长期关注纸质材料、矿物色层与低饱和空间中的情绪停留，创作方向介于装置与平面之间。',
          intro: '林深的创作总在处理“慢”的问题：颜色如何沉下来，边界如何不被立刻说清，观看如何不急于得出结论。',
          verified: true,
          followers: '2.6k',
          worksCount: 3
        },
        artworks: [
          createArtwork('v3-linshen-1', '雾林边界', 'https://picsum.photos/seed/muse-art-v3-linshen-1/720/960'),
          createArtwork('v3-linshen-2', '石灰呼吸', 'https://picsum.photos/seed/muse-art-v3-linshen-2/720/960'),
          createArtwork('v3-linshen-3', '留白层', 'https://picsum.photos/seed/muse-art-v3-linshen-3/720/960')
        ]
      },
      {
        id: 'v3-zhounan',
        title: '湿润表面的秩序',
        summary: '在朦胧与反光之间建立秩序，让材料表面成为情绪真正发生的地方。',
        image: 'https://picsum.photos/seed/muse-concept-v3-zhounan/960/1280',
        stats: { views: 980, likes: 201, collections: 74 },
        detail: [
          '我更关心作品表面留下来的湿润感，它像记忆里没有完全蒸发的那一层空气。',
          '本季里我试着把瓷、釉和光的关系放到更安静的结构里，让作品像一小段被保留下来的气候。'
        ],
        artist: {
          id: 302,
          name: '周南',
          avatar: 'https://picsum.photos/seed/muse-artist-zhounan/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-zhounan/1200/800',
          bio: '周南以陶瓷与玻璃为主要媒介，关注反光、湿度与容器内部的空间感。',
          intro: '周南的作品不强调形体的戏剧感，而是在细小反光和湿润表面中建立一种克制的秩序。',
          verified: true,
          followers: '1.9k',
          worksCount: 3
        },
        artworks: [
          createArtwork('v3-zhounan-1', '未干的器皿', 'https://picsum.photos/seed/muse-art-v3-zhounan-1/720/960'),
          createArtwork('v3-zhounan-2', '白釉回声', 'https://picsum.photos/seed/muse-art-v3-zhounan-2/720/960'),
          createArtwork('v3-zhounan-3', '潮汐边缘', 'https://picsum.photos/seed/muse-art-v3-zhounan-3/720/960')
        ]
      },
      {
        id: 'v3-yanmu',
        title: '静物里的温差',
        summary: '借由木、布与低光，把“静”处理成一种仍在轻微波动的状态。',
        image: 'https://picsum.photos/seed/muse-concept-v3-yanmu/960/1280',
        stats: { views: 1165, likes: 233, collections: 88 },
        detail: [
          '我在这一季里更关注温差：木料表面的温，布料吸走光线之后的冷，它们之间会形成一种很轻的张力。',
          '所以作品看起来很安静，但并不是停住，而是一种一直在缓慢变化里的静。'
        ],
        artist: {
          id: 303,
          name: '言木',
          avatar: 'https://picsum.photos/seed/muse-artist-yanmu/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-yanmu/1200/800',
          bio: '言木以木作、布面与日常器物改造为核心，擅长在低色温环境里建立稳定的视觉秩序。',
          intro: '言木的创作总是从最日常的材料开始，再把它们推向更微妙的气氛变化。',
          verified: false,
          followers: '1.4k',
          worksCount: 3
        },
        artworks: [
          createArtwork('v3-yanmu-1', '布面低光', 'https://picsum.photos/seed/muse-art-v3-yanmu-1/720/960'),
          createArtwork('v3-yanmu-2', '静物温差', 'https://picsum.photos/seed/muse-art-v3-yanmu-2/720/960'),
          createArtwork('v3-yanmu-3', '缓慢桌面', 'https://picsum.photos/seed/muse-art-v3-yanmu-3/720/960')
        ]
      }
    ]
  },
  {
    vol: 2,
    title: '现代主义',
    img: 'https://picsum.photos/seed/muse-theme-2/1200/1600',
    previewVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    guideLabel: '季度导览',
    guideTitle: '形式与秩序的再整理',
    summary: '第二季回到现代主义语境，关注结构、比例和图像秩序如何在当代被重新理解。',
    guideSections: [
      { title: '导览一', text: '从格线、块面和比例开始，重新感受结构如何决定观看节奏。' },
      { title: '导览二', text: '本季更强调方法与秩序，每位艺术家都在各自媒材里重建一种形式语言。' }
    ],
    concepts: [
      {
        id: 'v2-xuyi',
        title: '构图作为方法',
        summary: '讨论线、块与留白如何建立秩序，而不是仅仅成为画面的结果。',
        image: 'https://picsum.photos/seed/muse-concept-v2-xuyi/960/1280',
        stats: { views: 840, likes: 162, collections: 53 },
        detail: [
          '我关心的是构图如何成为一种工作方法，而不只是视觉结果。',
          '在现代主义语境里，秩序并不冷，它只是把情绪放到更可靠的结构里。'
        ],
        artist: {
          id: 201,
          name: '徐奕',
          avatar: 'https://picsum.photos/seed/muse-artist-xuyi/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-xuyi/1200/800',
          bio: '徐奕的创作围绕几何、网格与版面秩序展开，作品介于平面设计和绘画之间。',
          intro: '徐奕擅长把严格结构转化为缓慢可读的视觉语言。',
          verified: true,
          followers: '1.8k',
          worksCount: 2
        },
        artworks: [
          createArtwork('v2-xuyi-1', '网格 08', 'https://picsum.photos/seed/muse-art-v2-xuyi-1/720/960'),
          createArtwork('v2-xuyi-2', '块面习作', 'https://picsum.photos/seed/muse-art-v2-xuyi-2/720/960')
        ]
      },
      {
        id: 'v2-liangmu',
        title: '比例的静默张力',
        summary: '通过比例失衡制造轻微张力，让形式本身带出观看的情绪波动。',
        image: 'https://picsum.photos/seed/muse-concept-v2-liangmu/960/1280',
        stats: { views: 902, likes: 188, collections: 66 },
        detail: [
          '我在这一季更关注比例失衡造成的轻微不适，它会迫使视线停留。',
          '所谓现代，不只是功能与清晰，也包括结构内部那种不可见的张力。'
        ],
        artist: {
          id: 202,
          name: '梁沐',
          avatar: 'https://picsum.photos/seed/muse-artist-liangmu/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-liangmu/1200/800',
          bio: '梁沐长期处理比例、模块与材料节律，关注作品中“微小偏差”的力量。',
          intro: '梁沐的作品通常很克制，但内部总会保留一处轻微偏移。',
          verified: false,
          followers: '1.2k',
          worksCount: 2
        },
        artworks: [
          createArtwork('v2-liangmu-1', '偏移比例', 'https://picsum.photos/seed/muse-art-v2-liangmu-1/720/960'),
          createArtwork('v2-liangmu-2', '静默模块', 'https://picsum.photos/seed/muse-art-v2-liangmu-2/720/960')
        ]
      }
    ]
  },
  {
    vol: 1,
    title: '抽象意识',
    img: 'https://picsum.photos/seed/muse-theme-1/1200/1600',
    previewVideo: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    guideLabel: '季度导览',
    guideTitle: '感知的第一层抽离',
    summary: '第一季回到抽象的起点，观察颜色、笔触和结构如何离开具象叙事而独立成立。',
    guideSections: [
      { title: '导览一', text: '从颜色与笔触开始，把观看从故事中抽离出来。' },
      { title: '导览二', text: '本季关注抽象如何成为一种更直接的感知经验。' }
    ],
    concepts: [
      {
        id: 'v1-suran',
        title: '颜色先于命名',
        summary: '在命名和理解发生之前，先让颜色直接作用于感知。',
        image: 'https://picsum.photos/seed/muse-concept-v1-suran/960/1280',
        stats: { views: 760, likes: 147, collections: 44 },
        detail: [
          '我希望颜色先于叙事出现，让观看先发生在感知层，而不是意义层。',
          '抽象并不是远离现实，而是把感知重新放回最直接的位置。'
        ],
        artist: {
          id: 101,
          name: '苏然',
          avatar: 'https://picsum.photos/seed/muse-artist-suran/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-suran/1200/800',
          bio: '苏然的作品以色层与笔触为主，关注抽象绘画中的即时感与停顿感。',
          intro: '苏然试图让颜色回到最直接的感知作用，而不急于被说明。',
          verified: true,
          followers: '1.5k',
          worksCount: 2
        },
        artworks: [
          createArtwork('v1-suran-1', '颜色体温', 'https://picsum.photos/seed/muse-art-v1-suran-1/720/960'),
          createArtwork('v1-suran-2', '无题 07', 'https://picsum.photos/seed/muse-art-v1-suran-2/720/960')
        ]
      },
      {
        id: 'v1-heyu',
        title: '笔触的方向感',
        summary: '抽象画面里的方向与速度，会在没有叙事的情况下决定观看路径。',
        image: 'https://picsum.photos/seed/muse-concept-v1-heyu/960/1280',
        stats: { views: 688, likes: 132, collections: 39 },
        detail: [
          '我关注笔触里的方向感，它像在画面里留下了看不见的风。',
          '抽象里的秩序常常不是来自形，而是来自运动痕迹本身。'
        ],
        artist: {
          id: 102,
          name: '何域',
          avatar: 'https://picsum.photos/seed/muse-artist-heyu/320/320',
          cover: 'https://picsum.photos/seed/muse-artist-cover-heyu/1200/800',
          bio: '何域通过重复笔触、刮擦和叠层建立画面张力，作品强调运动方向与停顿。',
          intro: '何域把抽象看作一种运动记录，而不只是形式结果。',
          verified: false,
          followers: '980',
          worksCount: 2
        },
        artworks: [
          createArtwork('v1-heyu-1', '方向练习', 'https://picsum.photos/seed/muse-art-v1-heyu-1/720/960'),
          createArtwork('v1-heyu-2', '刮擦之后', 'https://picsum.photos/seed/muse-art-v1-heyu-2/720/960')
        ]
      }
    ]
  }
]

export const getThemePeriods = () => themePeriods

export const getCurrentThemePeriod = () => themePeriods[0]

export const getThemeArchiveItems = (currentVol = getCurrentThemePeriod().vol) => {
  return themePeriods
    .filter(item => item.vol !== currentVol)
    .map(item => ({
      vol: item.vol,
      title: item.title,
      img: item.img
    }))
}

export const getThemePeriodByVol = (vol) => {
  return themePeriods.find(item => Number(item.vol) === Number(vol)) || getCurrentThemePeriod()
}

export const getThemeConceptById = (vol, conceptId) => {
  const period = getThemePeriodByVol(vol)
  return period.concepts.find(item => item.id === conceptId) || period.concepts[0]
}
