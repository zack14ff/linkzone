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

  {
    demo: false,
    slug: 'nmrvisuals_pack',
    type: 'resourcepack',
    title: 'NO MORE RETURN MUSIC | RAIN MUSIC',
    icon: 'files/nmrvisual/light.png',
    author: 'Zakap',
    summary: 'special RP for current mod WITHOUT MOD NOT WORK',
    categories: ['vanilla-like', 'Audio', 'DLC'],
    status: 'none',
    license: 'All Right Reversed',
    published: '2026-09-26',
    links: {
      modrinth: '#NO'  // демо-ссылка — у своего проекта поставь адрес его страницы
    },
    dependencies: [
      { title: 'No More Visuals', url: '#111', required: true, loaders: ['fabric'] }
    ],
    description: `
*im lazy to make english desc just retranslate that*
![preview](https://cdn.modrinth.com/data/cached_images/779906fa68bc898092b3629518f3a96d143c0e33.jpeg)

Замена стандартного звука дождя на музыку, привязанную к цвету дождя на сервере

![Text](https://cdn.modrinth.com/data/cached_images/7465e07481ef209e3d24d674848a59870d3e07f0_0.webp)

1. Красный дождь — своя музыкальная тема
2. Синий дождь — своя музыкальная тема
3. Зелёный дождь — своя музыкальная тема

### Что будет если я не скачаю текстурпак?

* услышишь обычный ванильный звук дождя вместо музыки под конкретный эвент

## Работал над этим

* zakap (вайб кодил и контролировал)
* Presh_us (концепт чувак)

### Взятые Исполнения

* Stardew Valley - Summer
* Grace soundtrack - Sorrow Domain, beyond the surface
`,
    versions: [
      {
        name: 'NMRain 1.0',
        number: '1.0',
        channel: 'release',
        date: '2026-09-26',
        gameVersions: ['26.2'],
        changelog: '- Музыка под дождь',
        files: [{ name: 'NMV-RainMusic.zip', url: 'files/nmrvisual/rp/NMV-RainMusic.zip', size: 5067363 }]
      }
    ]
  }





];
