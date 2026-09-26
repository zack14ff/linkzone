/*
 * СПРАВОЧНИК: типы проектов, категории, платформы.
 * Эти же ID используются в data/projects.js и в промте для ИИ из README.md.
 * Категории только показываются на карточках — фильтра по ним на сайте нет.
 */
window.CATALOG = {
  types: {
    mod: {
      label: 'Мод',
      plural: 'Моды',
      route: 'mods',          // адрес списка:   #/mods
      single: 'mod',          // адрес страницы: #/mod/<slug>
      icon: 'box',
      searchHint: 'модов',
      blurb: 'Моды для Fabric, Forge, NeoForge и Quilt, которые сейчас ждут проверки.',
      install: 'Положи файл <code>.jar</code> в папку <code>.minecraft/mods</code> и запусти игру с нужным загрузчиком.'
    },
    resourcepack: {
      label: 'Ресурспак',
      plural: 'Ресурспаки',
      route: 'resourcepacks',
      single: 'resourcepack',
      icon: 'image',
      searchHint: 'ресурспаков',
      blurb: 'Текстуры, звуки, шрифты и интерфейс — всё, что меняет вид игры без модов.',
      install: 'Положи архив <code>.zip</code> в папку <code>.minecraft/resourcepacks</code>, затем включи его в «Настройки → Пакеты ресурсов».'
    },
    plugin: {
      label: 'Плагин',
      plural: 'Плагины',
      route: 'plugins',
      single: 'plugin',
      icon: 'plug',
      searchHint: 'плагинов',
      blurb: 'Плагины для серверов на Paper, Spigot, Purpur и прокси Velocity.',
      install: 'Положи файл <code>.jar</code> в папку <code>plugins</code> на сервере и перезапусти сервер.'
    }
  },

  categories: {
    mod: {
      'adventure': 'Приключения',
      'cursed': 'Проклятое',
      'decoration': 'Декор',
      'economy': 'Экономика',
      'equipment': 'Снаряжение',
      'food': 'Еда',
      'game-mechanics': 'Игровые механики',
      'library': 'Библиотека',
      'magic': 'Магия',
      'management': 'Управление',
      'minigame': 'Мини-игры',
      'mobs': 'Мобы',
      'optimization': 'Оптимизация',
      'social': 'Общение',
      'storage': 'Хранение',
      'technology': 'Технологии',
      'transportation': 'Транспорт',
      'utility': 'Утилиты',
      'worldgen': 'Генерация мира'
    },

    resourcepack: {
      // Стиль
      'combat': 'PvP',
      'cursed': 'Проклятое',
      'decoration': 'Декор',
      'modded': 'Для модов',
      'realistic': 'Реализм',
      'simplistic': 'Минимализм',
      'themed': 'Тематический',
      'tweaks': 'Твики',
      'utility': 'Утилиты',
      'vanilla-like': 'Ванильный стиль',
      // Что меняет
      'audio': 'Звуки',
      'blocks': 'Блоки',
      'core-shaders': 'Core-шейдеры',
      'entities': 'Существа',
      'environment': 'Окружение',
      'equipment': 'Снаряжение',
      'fonts': 'Шрифты',
      'gui': 'Интерфейс',
      'items': 'Предметы',
      'locale': 'Локализация',
      'models': 'Модели',
      // Разрешение (ровно одно)
      '8x-': '8x и меньше',
      '16x': '16x',
      '32x': '32x',
      '48x': '48x',
      '64x': '64x',
      '128x': '128x',
      '256x': '256x',
      '512x+': '512x и выше'
    },

    plugin: {
      'adventure': 'Приключения',
      'cursed': 'Проклятое',
      'decoration': 'Декор',
      'economy': 'Экономика',
      'equipment': 'Снаряжение',
      'food': 'Еда',
      'game-mechanics': 'Игровые механики',
      'library': 'Библиотека',
      'magic': 'Магия',
      'management': 'Управление',
      'minigame': 'Мини-игры',
      'mobs': 'Мобы',
      'optimization': 'Оптимизация',
      'social': 'Общение',
      'storage': 'Хранение',
      'technology': 'Технологии',
      'transportation': 'Транспорт',
      'utility': 'Утилиты',
      'worldgen': 'Генерация мира'
    }
  },

  // Платформы (загрузчики / серверные ядра). Порядок = порядок показа.
  loaders: {
    fabric:     { label: 'Fabric',     color: '#d9b185' },
    forge:      { label: 'Forge',      color: '#8e9cf0' },
    neoforge:   { label: 'NeoForge',   color: '#f28b4c' },
    quilt:      { label: 'Quilt',      color: '#c894f7' },
    paper:      { label: 'Paper',      color: '#e9e2d6' },
    purpur:     { label: 'Purpur',     color: '#b77ce0' },
    spigot:     { label: 'Spigot',     color: '#eba43f' },
    bukkit:     { label: 'Bukkit',     color: '#e3695a' },
    folia:      { label: 'Folia',      color: '#6ccf96' },
    sponge:     { label: 'Sponge',     color: '#f3cd3c' },
    velocity:   { label: 'Velocity',   color: '#4dabf7' },
    bungeecord: { label: 'BungeeCord', color: '#f0b445' },
    waterfall:  { label: 'Waterfall',  color: '#5ea3de' }
  },

  environment: {
    required: 'обязателен',
    optional: 'по желанию',
    unsupported: 'не нужен'
  }
};
