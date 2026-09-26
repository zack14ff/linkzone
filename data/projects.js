/*
 * КАТАЛОГ ПРОЕКТОВ
 * Каждый объект в массиве — один мод, ресурспак или плагин.
 * Описание всех полей — в README.md, раздел «Как добавить проект».
 *
 * Три проекта ниже — демо (demo: true). Когда добавишь свои — удали их
 * вместе с папкой files/demo.
 *
 * Важно: description и changelog пишутся в обратных кавычках `...`.
 * Если внутри текста нужна обратная кавычка — пиши \` , а вместо ${ пиши \${
 */
window.PROJECTS = [

  {
    demo: false,
    slug: 'nmrvisual',
    type: 'mod',
    title: 'NO MORE VISUALS | No More Return',
    author: 'zakap',
    summary: 'Add visual for current server named NMR to make events better',
    icon: 'files/nmrvisual/logo.png',
    categories: ['visual'],
    status: 'review',
    license: 'Has license',
    environment: { client: 'required', server: 'required' },
    published: '2026-09-27',
    links: {},
    dependencies: [
      { title: 'Fabric API', url: 'https://modrinth.com/mod/fabric-api', required: true, loaders: ['fabric'] }
    ],
    gallery: [
      { url: 'files/nmrvisual/testlol.png', title: 'картинка не прилагается мода', description: 'Ого' },
      { url: 'files/nmrvisual/test.png', title: 'Тест', description: 'Проверка превью' }
    ],
    description: `
- _im lazy to make english desc just retranslate that_
  ![preview](https://cdn.modrinth.com/data/cached_images/779906fa68bc898092b3629518f3a96d143c0e33.jpeg)
# Висуалы под игру на Сервере "No more return"
для удобной игры без долгих переходов и упращения игры под свой контроль

![Text](https://cdn.modrinth.com/data/cached_images/7465e07481ef209e3d24d674848a59870d3e07f0_0.webp)
1. Редактирование Освещения
2. Остальное всё Спрятано под лором
3. Кастомный дождь
## 


### Что будет Если я не скачаю мод?
-  не увидешь висуалов под конкретный эвент на сервере|:

## Работал над этим
- zakap(кто вайб кодил и контролировал)
- Presh_us(концепт чувак)
### Взятые Исполнения
- Stardew Valley - Summer
- Grace soundtrack - Sorrow Domain , beyond the surface



`,
    versions: [
      {
        name: 'nmrvisuals_public',
        number: '2.6.1',
        channel: 'release',
        date: '2026-09-26',
        gameVersions: ['26.2'],
        loaders: ['fabric'],
        changelog: `
- Публичный он теперь на сайте
`,
        files: [{ name: 'no-more-visuals-2.6.1.jar', url: 'files/nmrvisual/no-more-visuals-2.6.1.jar', size: 176156 }]
      },
    ]
  },


];
