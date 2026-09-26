/*
 * ZoneLinks Builder — локальный плагин Figma.
 * Достраивает Figma-файл сайта (макет, UI-кит, логотип) через обычный Plugin API,
 * поэтому не тратит вызовы MCP и не упирается в лимиты тарифа.
 * Работает только в файле проекта (изначально назывался «Amberite»), где уже есть
 * переменные «Тема», стили и компоненты.
 */

figma.showUI(__html__, { width: 360, height: 500, themeColors: true });

const ORDER = ['brand', 'flat', 'mockup', 'kit', 'logo'];
const BRAND = 'ZoneLinks';
const DOC_KIT = 'UI-кит · документация';
const DOC_LOGO = 'Логотип и иконки · документация';
const SCREENS = ['Главная — Desktop', 'Каталог модов — Desktop', 'Страница мода — Desktop', 'Окно скачивания — Desktop'];
const KIT_COMPONENTS = ['Button', 'Icon Button', 'Chip', 'Badge', 'Count', 'Soon', 'Channel', 'Nav Link', 'Tab', 'Type Tab',
  'Search Field', 'Select', 'Project Icon', 'Project Card', 'Banner', 'File Row', 'Dependency', 'Version Row', 'Site Header', 'Site Footer'];
const LOGO_NODES = ['Logo/Mark', 'Logo/Wordmark', 'Project Icon/Ember Lanterns', 'Иконки · 24px'];

const LANTERN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 128 128">' +
  '<rect width="128" height="128" rx="28" fill="#211a31"/>' +
  '<circle cx="64" cy="66" r="40" fill="#ffc45a" fill-opacity=".16"/>' +
  '<rect x="57" y="12" width="14" height="12" rx="4" fill="none" stroke="#7a6a98" stroke-width="4"/>' +
  '<path d="M42 28h44l-7 11H49z" fill="#4c3d66"/>' +
  '<rect x="46" y="39" width="36" height="46" rx="3" fill="#ffc15c"/>' +
  '<path d="M46 39h36v46H46z" fill="none" stroke="#4c3d66" stroke-width="5" stroke-linejoin="round"/>' +
  '<path d="M64 53c6 7 8 11 8 15a8 8 0 0 1-16 0c0-4 2-8 8-15z" fill="#fff7dc"/>' +
  '<path d="M40 85h48v7a5 5 0 0 1-5 5H45a5 5 0 0 1-5-5z" fill="#4c3d66"/></svg>';

const PROJECTS = [
  { title: 'Ember Lanterns', author: 'DemoAuthor', type: 'Мод', icon: 'lantern', updated: 'позавчера', status: 'На проверке',
    summary: 'Янтарные фонари шестнадцати цветов с мягким мерцанием и подвесными цепями.',
    cats: ['Декор'], loaders: ['fabric', 'forge', 'neoforge'] },
  { title: 'Pocket Sorter', author: 'DemoAuthor', type: 'Мод', letters: 'PS', color: '#9c4fc0', updated: '4 дня назад', status: 'На проверке',
    summary: 'Сортировка инвентаря и сундуков одной кнопкой — работает только на клиенте.',
    cats: ['Хранение', 'Утилиты'], loaders: ['fabric', 'quilt'] },
  { title: 'Soft Stone 16x', author: 'DemoAuthor', type: 'Ресурспак', letters: 'SS', color: '#b9822f', updated: 'на прошлой неделе', status: 'Опубликован',
    summary: 'Мягкие, чуть сглаженные текстуры камня и руд в ванильном стиле.',
    cats: ['Ванильный стиль', 'Минимализм', 'Блоки', '16x'], loaders: [] }
];
const LOADER_LABEL = { fabric: 'Fabric', forge: 'Forge', neoforge: 'NeoForge', quilt: 'Quilt' };

// Морская палитра — те же значения, что в assets/css/style.css
const DARK_PALETTE = [
  ['bg/base', '--bg', '#0a1016', 1], ['bg/surface', '--bg-2', '#101922', 1], ['bg/raised', '--bg-3', '#16222d', 1],
  ['bg/strong', '--bg-4', '#1e2d3a', 1], ['border/default', '--line', '#1b2733', 1], ['border/strong', '--line-2', '#2a3a49', 1],
  ['text/primary', '--text', '#e9f2f7', 1], ['text/secondary', '--text-2', '#adc0cc', 1], ['text/muted', '--muted', '#7890a0', 1],
  ['accent/default', '--accent', '#2fa8d8', 1], ['accent/deep', '--accent-2', '#1d86b8', 1], ['accent/ink', '--accent-ink', '#03141d', 1],
  ['accent/text', '--accent-text', '#5cc8e8', 1], ['accent/soft', '--accent-soft', '#2fa8d8', .13], ['accent/line', '--accent-line', '#2fa8d8', .45],
  ['status/violet', '--violet', '#b7a3ff', 1], ['status/violet-soft', '--violet-soft', '#b7a3ff', .14], ['status/green', '--green', '#5fd39c', 1],
  ['status/green-soft', '--green-soft', '#5fd39c', .13], ['status/rose', '--rose', '#ff7d98', 1], ['status/rose-soft', '--rose-soft', '#ff7d98', .13]
];
const LIGHT_PALETTE = [
  ['bg/base', '--bg', '#f1f6f8', 1], ['bg/surface', '--bg-2', '#ffffff', 1], ['bg/raised', '--bg-3', '#e7eff3', 1],
  ['bg/strong', '--bg-4', '#d9e5eb', 1], ['border/default', '--line', '#dce7ec', 1], ['border/strong', '--line-2', '#c5d5dd', 1],
  ['text/primary', '--text', '#0e1b23', 1], ['text/secondary', '--text-2', '#3a4c57', 1], ['text/muted', '--muted', '#62798a', 1],
  ['accent/default', '--accent', '#29a3d3', 1], ['accent/deep', '--accent-2', '#1a82b3', 1], ['accent/ink', '--accent-ink', '#02131b', 1],
  ['accent/text', '--accent-text', '#0b6a92', 1], ['accent/soft', '--accent-soft', '#1a82b3', .1], ['accent/line', '--accent-line', '#1a82b3', .45],
  ['status/violet', '--violet', '#6746d4', 1], ['status/violet-soft', '--violet-soft', '#6746d4', .1], ['status/green', '--green', '#1a7f55', 1],
  ['status/green-soft', '--green-soft', '#1a7f55', .1], ['status/rose', '--rose', '#c62d52', 1], ['status/rose-soft', '--rose-soft', '#c62d52', .1]
];
const LOGO_COLORS = { sphere: '#1a7fb3', badge: '#46c3dd' };
// Детали знака без масок (сфера, 8 каналов, вырез под значок, значок, плюс) — собираются вычитанием фигур
const LOGO_PARTS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 128 128"><circle cx="58" cy="58" r="50" fill="#1a7fb3"/><path d="M48.7 6.1C49.2 6.4 52.7 7.3 54.6 8C56.5 8.7 58.3 9.5 60 10.3C61.7 11.2 63.3 12.1 64.9 13.1C66.5 14.1 67.9 15.1 69.3 16.3C70.7 17.4 72 18.6 73.2 19.9C74.4 21.1 75.6 22.4 76.6 23.8C77.6 25.2 78.5 26.6 79.3 28C80.1 29.4 80.8 30.9 81.4 32.4C82 33.9 82.5 35.4 82.8 36.9C83.2 38.4 83.4 39.9 83.6 41.4C83.7 42.9 83.7 44.4 83.7 45.8C83.6 47.2 83.4 48.6 83.1 50C82.8 51.3 82.4 52.6 82 53.8C81.5 55 80.9 56.2 80.3 57.3C79.6 58.3 78.9 59.3 78.1 60.2C77.4 61.1 76.6 61.9 75.7 62.5C74.9 63.2 74 63.8 73.1 64.2C72.2 64.7 71.3 65 70.4 65.3C69.6 65.5 68.7 65.6 67.9 65.7C67 65.7 65.4 63.7 65.4 65.5C65.3 67.3 66.5 74.7 67.6 76.3C68.7 77.8 70.6 75.6 72 75.1C73.4 74.5 74.8 73.8 76.1 73C77.4 72.2 78.7 71.2 79.8 70.2C81 69.1 82 67.9 83 66.7C83.9 65.4 84.8 64 85.5 62.6C86.3 61.1 86.9 59.6 87.4 58.1C87.9 56.5 88.3 54.9 88.6 53.3C88.8 51.6 89 49.9 89 48.3C89 46.6 88.9 44.9 88.6 43.2C88.4 41.5 88 39.8 87.6 38.2C87.1 36.5 86.5 34.9 85.8 33.3C85.1 31.7 84.3 30.1 83.4 28.6C82.5 27.1 81.5 25.6 80.4 24.2C79.3 22.8 78 21.4 76.8 20.2C75.5 18.9 74.1 17.7 72.6 16.5C71.2 15.4 69.7 14.3 68.1 13.3C66.5 12.3 64.8 11.4 63.1 10.5C61.3 9.7 59.5 9 57.7 8.3C55.8 7.6 53.4 6.8 51.9 6.4C50.4 6.1 48.3 5.8 48.7 6.1ZM60 71a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0Z" fill="#000000"/><path d="M88.1 14.7C88.2 15 89.3 16.8 89.8 17.8C90.4 18.8 90.9 19.8 91.4 20.8C91.9 21.8 92.4 22.8 92.8 23.8C93.3 24.8 93.7 25.9 94.1 26.9C94.4 28 94.8 29.1 95.1 30.1C95.4 31.2 95.7 32.3 95.9 33.4C96.2 34.5 96.4 35.7 96.6 36.8C96.8 37.9 96.9 39.1 97 40.2C97.1 41.4 97.1 42.6 97.1 43.7C97.2 44.9 97.1 46.1 97 47.3C97 48.4 96.8 49.6 96.7 50.8C96.5 52 96.3 53.2 96 54.4C95.7 55.5 95.4 56.7 95 57.9C94.6 59 94.2 60.2 93.7 61.3C93.2 62.4 92.6 63.5 92 64.6C91.4 65.7 90.8 66.7 90.1 67.8C89.3 68.8 88.6 69.8 87.7 70.7C86.9 71.6 86 72.5 85.1 73.4C84.2 74.2 83.2 75 82.2 75.8C81.2 76.5 78.4 76.6 78.9 77.8C79.5 79.1 83.9 83 85.5 83.4C87.2 83.8 87.9 81.4 89 80.2C90 79.1 91 78 92 76.7C92.9 75.5 93.7 74.3 94.5 73C95.2 71.8 95.9 70.5 96.5 69.1C97.2 67.8 97.7 66.5 98.2 65.2C98.7 63.8 99.1 62.5 99.4 61.1C99.7 59.8 100 58.5 100.2 57.1C100.4 55.8 100.6 54.5 100.7 53.1C100.8 51.8 100.8 50.5 100.8 49.2C100.8 47.9 100.7 46.6 100.6 45.4C100.5 44.1 100.4 42.9 100.2 41.7C100 40.4 99.7 39.2 99.5 38C99.2 36.9 98.9 35.7 98.6 34.6C98.2 33.4 97.8 32.3 97.4 31.2C97 30.1 96.6 29 96.1 27.9C95.7 26.9 95.2 25.8 94.7 24.8C94.2 23.8 93.7 22.8 93.1 21.8C92.6 20.8 92 19.8 91.4 18.9C90.8 17.9 90.1 16.6 89.6 15.9C89 15.3 88.1 14.4 88.1 14.7ZM77.1 81.3a4.3 4.3 0 1 0 8.5 0a4.3 4.3 0 1 0 -8.5 0Z" fill="#000000"/><path d="M109.9 48.7C109.6 49.2 108.7 52.7 108 54.6C107.3 56.5 106.5 58.3 105.7 60C104.8 61.7 103.9 63.3 102.9 64.9C101.9 66.5 100.9 67.9 99.7 69.3C98.6 70.7 97.4 72 96.1 73.2C94.9 74.4 93.6 75.6 92.2 76.6C90.8 77.6 89.4 78.5 88 79.3C86.6 80.1 85.1 80.8 83.6 81.4C82.1 82 80.6 82.5 79.1 82.8C77.6 83.2 76.1 83.4 74.6 83.6C73.1 83.7 71.6 83.7 70.2 83.7C68.8 83.6 67.4 83.4 66 83.1C64.7 82.8 63.4 82.4 62.2 82C61 81.5 59.8 80.9 58.7 80.3C57.7 79.6 56.7 78.9 55.8 78.1C54.9 77.4 54.1 76.6 53.5 75.7C52.8 74.9 52.2 74 51.8 73.1C51.3 72.2 51 71.3 50.7 70.4C50.5 69.6 50.4 68.7 50.3 67.9C50.3 67 52.3 65.4 50.5 65.4C48.7 65.3 41.3 66.5 39.7 67.6C38.2 68.7 40.4 70.6 40.9 72C41.5 73.4 42.2 74.8 43 76.1C43.8 77.4 44.8 78.7 45.8 79.8C46.9 81 48.1 82 49.3 83C50.6 83.9 52 84.8 53.4 85.5C54.9 86.3 56.4 86.9 57.9 87.4C59.5 87.9 61.1 88.3 62.7 88.6C64.4 88.8 66.1 89 67.7 89C69.4 89 71.1 88.9 72.8 88.6C74.5 88.4 76.2 88 77.8 87.6C79.5 87.1 81.1 86.5 82.7 85.8C84.3 85.1 85.9 84.3 87.4 83.4C88.9 82.5 90.4 81.5 91.8 80.4C93.2 79.3 94.6 78 95.8 76.8C97.1 75.5 98.3 74.1 99.5 72.6C100.6 71.2 101.7 69.7 102.7 68.1C103.7 66.5 104.6 64.8 105.5 63.1C106.3 61.3 107 59.5 107.7 57.7C108.4 55.8 109.2 53.4 109.6 51.9C109.9 50.4 110.2 48.3 109.9 48.7ZM39.5 65.5a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0Z" fill="#000000"/><path d="M101.3 88.1C101 88.2 99.2 89.3 98.2 89.8C97.2 90.4 96.2 90.9 95.2 91.4C94.2 91.9 93.2 92.4 92.2 92.8C91.2 93.3 90.1 93.7 89.1 94.1C88 94.4 86.9 94.8 85.9 95.1C84.8 95.4 83.7 95.7 82.6 95.9C81.5 96.2 80.3 96.4 79.2 96.6C78.1 96.8 76.9 96.9 75.8 97C74.6 97.1 73.4 97.1 72.3 97.1C71.1 97.2 69.9 97.1 68.7 97C67.6 97 66.4 96.8 65.2 96.7C64 96.5 62.8 96.3 61.6 96C60.5 95.7 59.3 95.4 58.1 95C57 94.6 55.8 94.2 54.7 93.7C53.6 93.2 52.5 92.6 51.4 92C50.3 91.4 49.3 90.8 48.2 90.1C47.2 89.3 46.2 88.6 45.3 87.7C44.4 86.9 43.5 86 42.6 85.1C41.8 84.2 41 83.2 40.2 82.2C39.5 81.2 39.4 78.4 38.2 78.9C36.9 79.5 33 83.9 32.6 85.5C32.2 87.2 34.6 87.9 35.8 89C36.9 90 38 91 39.3 92C40.5 92.9 41.7 93.7 43 94.5C44.2 95.2 45.5 95.9 46.9 96.5C48.2 97.2 49.5 97.7 50.8 98.2C52.2 98.7 53.5 99.1 54.9 99.4C56.2 99.7 57.5 100 58.9 100.2C60.2 100.4 61.5 100.6 62.9 100.7C64.2 100.8 65.5 100.8 66.8 100.8C68.1 100.8 69.4 100.7 70.6 100.6C71.9 100.5 73.1 100.4 74.3 100.2C75.6 100 76.8 99.7 78 99.5C79.1 99.2 80.3 98.9 81.4 98.6C82.6 98.2 83.7 97.8 84.8 97.4C85.9 97 87 96.6 88.1 96.1C89.1 95.7 90.2 95.2 91.2 94.7C92.2 94.2 93.2 93.7 94.2 93.1C95.2 92.6 96.2 92 97.1 91.4C98.1 90.8 99.4 90.1 100.1 89.6C100.7 89 101.6 88.1 101.3 88.1ZM30.4 81.3a4.3 4.3 0 1 0 8.5 0a4.3 4.3 0 1 0 -8.5 0Z" fill="#000000"/><path d="M67.3 109.9C66.8 109.6 63.3 108.7 61.4 108C59.5 107.3 57.7 106.5 56 105.7C54.3 104.8 52.7 103.9 51.1 102.9C49.5 101.9 48.1 100.9 46.7 99.7C45.3 98.6 44 97.4 42.8 96.1C41.6 94.9 40.4 93.6 39.4 92.2C38.4 90.8 37.5 89.4 36.7 88C35.9 86.6 35.2 85.1 34.6 83.6C34 82.1 33.5 80.6 33.2 79.1C32.8 77.6 32.6 76.1 32.4 74.6C32.3 73.1 32.3 71.6 32.3 70.2C32.4 68.8 32.6 67.4 32.9 66C33.2 64.7 33.6 63.4 34 62.2C34.5 61 35.1 59.8 35.7 58.7C36.4 57.7 37.1 56.7 37.9 55.8C38.6 54.9 39.4 54.1 40.3 53.5C41.1 52.8 42 52.2 42.9 51.8C43.8 51.3 44.7 51 45.6 50.7C46.4 50.5 47.3 50.4 48.1 50.3C49 50.3 50.6 52.3 50.6 50.5C50.7 48.7 49.5 41.3 48.4 39.7C47.3 38.2 45.4 40.4 44 40.9C42.6 41.5 41.2 42.2 39.9 43C38.6 43.8 37.3 44.8 36.2 45.8C35 46.9 34 48.1 33 49.3C32.1 50.6 31.2 52 30.5 53.4C29.7 54.9 29.1 56.4 28.6 57.9C28.1 59.5 27.7 61.1 27.4 62.7C27.2 64.4 27 66.1 27 67.7C27 69.4 27.1 71.1 27.4 72.8C27.6 74.5 28 76.2 28.4 77.8C28.9 79.5 29.5 81.1 30.2 82.7C30.9 84.3 31.7 85.9 32.6 87.4C33.5 88.9 34.5 90.4 35.6 91.8C36.7 93.2 38 94.6 39.2 95.8C40.5 97.1 41.9 98.3 43.4 99.5C44.8 100.6 46.3 101.7 47.9 102.7C49.5 103.7 51.2 104.6 52.9 105.5C54.7 106.3 56.5 107 58.3 107.7C60.2 108.4 62.6 109.2 64.1 109.6C65.6 109.9 67.7 110.2 67.3 109.9ZM45 45a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0Z" fill="#000000"/><path d="M27.9 101.3C27.8 101 26.7 99.2 26.2 98.2C25.6 97.2 25.1 96.2 24.6 95.2C24.1 94.2 23.6 93.2 23.2 92.2C22.7 91.2 22.3 90.1 21.9 89.1C21.6 88 21.2 86.9 20.9 85.9C20.6 84.8 20.3 83.7 20.1 82.6C19.8 81.5 19.6 80.3 19.4 79.2C19.2 78.1 19.1 76.9 19 75.8C18.9 74.6 18.9 73.4 18.9 72.3C18.8 71.1 18.9 69.9 19 68.7C19 67.6 19.2 66.4 19.3 65.2C19.5 64 19.7 62.8 20 61.6C20.3 60.5 20.6 59.3 21 58.1C21.4 57 21.8 55.8 22.3 54.7C22.8 53.6 23.4 52.5 24 51.4C24.6 50.3 25.2 49.3 25.9 48.2C26.7 47.2 27.4 46.2 28.3 45.3C29.1 44.4 30 43.5 30.9 42.6C31.8 41.8 32.8 41 33.8 40.2C34.8 39.5 37.6 39.4 37.1 38.2C36.5 36.9 32.1 33 30.5 32.6C28.8 32.2 28.1 34.6 27 35.8C26 36.9 25 38 24 39.3C23.1 40.5 22.3 41.7 21.5 43C20.8 44.2 20.1 45.5 19.5 46.9C18.8 48.2 18.3 49.5 17.8 50.8C17.3 52.2 16.9 53.5 16.6 54.9C16.3 56.2 16 57.5 15.8 58.9C15.6 60.2 15.4 61.5 15.3 62.9C15.2 64.2 15.2 65.5 15.2 66.8C15.2 68.1 15.3 69.4 15.4 70.6C15.5 71.9 15.6 73.1 15.8 74.3C16 75.6 16.3 76.8 16.5 78C16.8 79.1 17.1 80.3 17.4 81.4C17.8 82.6 18.2 83.7 18.6 84.8C19 85.9 19.4 87 19.9 88.1C20.3 89.1 20.8 90.2 21.3 91.2C21.8 92.2 22.3 93.2 22.9 94.2C23.4 95.2 24 96.2 24.6 97.1C25.2 98.1 25.9 99.4 26.4 100.1C27 100.7 27.9 101.6 27.9 101.3ZM30.4 34.7a4.3 4.3 0 1 0 8.5 0a4.3 4.3 0 1 0 -8.5 0Z" fill="#000000"/><path d="M6.1 67.3C6.4 66.8 7.3 63.3 8 61.4C8.7 59.5 9.5 57.7 10.3 56C11.2 54.3 12.1 52.7 13.1 51.1C14.1 49.5 15.1 48.1 16.3 46.7C17.4 45.3 18.6 44 19.9 42.8C21.1 41.6 22.4 40.4 23.8 39.4C25.2 38.4 26.6 37.5 28 36.7C29.4 35.9 30.9 35.2 32.4 34.6C33.9 34 35.4 33.5 36.9 33.2C38.4 32.8 39.9 32.6 41.4 32.4C42.9 32.3 44.4 32.3 45.8 32.3C47.2 32.4 48.6 32.6 50 32.9C51.3 33.2 52.6 33.6 53.8 34C55 34.5 56.2 35.1 57.3 35.7C58.3 36.4 59.3 37.1 60.2 37.9C61.1 38.6 61.9 39.4 62.5 40.3C63.2 41.1 63.8 42 64.2 42.9C64.7 43.8 65 44.7 65.3 45.6C65.5 46.4 65.6 47.3 65.7 48.1C65.7 49 63.7 50.6 65.5 50.6C67.3 50.7 74.7 49.5 76.3 48.4C77.8 47.3 75.6 45.4 75.1 44C74.5 42.6 73.8 41.2 73 39.9C72.2 38.6 71.2 37.3 70.2 36.2C69.1 35 67.9 34 66.7 33C65.4 32.1 64 31.2 62.6 30.5C61.1 29.7 59.6 29.1 58.1 28.6C56.5 28.1 54.9 27.7 53.3 27.4C51.6 27.2 49.9 27 48.3 27C46.6 27 44.9 27.1 43.2 27.4C41.5 27.6 39.8 28 38.2 28.4C36.5 28.9 34.9 29.5 33.3 30.2C31.7 30.9 30.1 31.7 28.6 32.6C27.1 33.5 25.6 34.5 24.2 35.6C22.8 36.7 21.4 38 20.2 39.2C18.9 40.5 17.7 41.9 16.5 43.4C15.4 44.8 14.3 46.3 13.3 47.9C12.3 49.5 11.4 51.2 10.5 52.9C9.7 54.7 9 56.5 8.3 58.3C7.6 60.2 6.8 62.6 6.4 64.1C6.1 65.6 5.8 67.7 6.1 67.3ZM65.5 50.5a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0Z" fill="#000000"/><path d="M14.7 27.9C15 27.8 16.8 26.7 17.8 26.2C18.8 25.6 19.8 25.1 20.8 24.6C21.8 24.1 22.8 23.6 23.8 23.2C24.8 22.7 25.9 22.3 26.9 21.9C28 21.6 29.1 21.2 30.1 20.9C31.2 20.6 32.3 20.3 33.4 20.1C34.5 19.8 35.7 19.6 36.8 19.4C37.9 19.2 39.1 19.1 40.2 19C41.4 18.9 42.6 18.9 43.7 18.9C44.9 18.8 46.1 18.9 47.3 19C48.4 19 49.6 19.2 50.8 19.3C52 19.5 53.2 19.7 54.4 20C55.5 20.3 56.7 20.6 57.9 21C59 21.4 60.2 21.8 61.3 22.3C62.4 22.8 63.5 23.4 64.6 24C65.7 24.6 66.7 25.2 67.8 25.9C68.8 26.7 69.8 27.4 70.7 28.3C71.6 29.1 72.5 30 73.4 30.9C74.2 31.8 75 32.8 75.8 33.8C76.5 34.8 76.6 37.6 77.8 37.1C79.1 36.5 83 32.1 83.4 30.5C83.8 28.8 81.4 28.1 80.2 27C79.1 26 78 25 76.7 24C75.5 23.1 74.3 22.3 73 21.5C71.8 20.8 70.5 20.1 69.1 19.5C67.8 18.8 66.5 18.3 65.2 17.8C63.8 17.3 62.5 16.9 61.1 16.6C59.8 16.3 58.5 16 57.1 15.8C55.8 15.6 54.5 15.4 53.1 15.3C51.8 15.2 50.5 15.2 49.2 15.2C47.9 15.2 46.6 15.3 45.4 15.4C44.1 15.5 42.9 15.6 41.7 15.8C40.4 16 39.2 16.3 38 16.5C36.9 16.8 35.7 17.1 34.6 17.4C33.4 17.8 32.3 18.2 31.2 18.6C30.1 19 29 19.4 27.9 19.9C26.9 20.3 25.8 20.8 24.8 21.3C23.8 21.8 22.8 22.3 21.8 22.9C20.8 23.4 19.8 24 18.9 24.6C17.9 25.2 16.6 25.9 15.9 26.4C15.3 27 14.4 27.9 14.7 27.9ZM77.1 34.7a4.3 4.3 0 1 0 8.5 0a4.3 4.3 0 1 0 -8.5 0Z" fill="#000000"/><circle cx="98" cy="100" r="25" fill="#000000"/><circle cx="98" cy="100" r="19" fill="#46c3dd"/><path d="M94.5 92.5a3.5 3.5 0 0 1 7 0V96.5H105.5a3.5 3.5 0 0 1 0 7H101.5V107.5a3.5 3.5 0 0 1 -7 0V103.5H90.5a3.5 3.5 0 0 1 0 -7H94.5Z" fill="#000000"/></svg>';
const TEXT_STYLE_ORDER = ['Display/Hero', 'Heading/H1', 'Heading/H2', 'Heading/H3', 'Heading/H4', 'Body/Large', 'Body/Default',
  'Body/Small', 'Label/Default', 'Label/Small', 'Label/Overline', 'Code/Default'];

let VARS = {}, VARS_BY_ID = {}, STY = {}, FX = {}, C = {}, PAGES = {}, LANTERN = null;

/* ======================== Запуск ======================== */

function log(msg, kind) { figma.ui.postMessage({ type: 'log', msg, kind: kind || '' }); }
function errText(e) { return e && e.message ? e.message : String(e); }

figma.ui.onmessage = async (m) => {
  if (!m || m.type !== 'run') return;
  figma.ui.postMessage({ type: 'busy', value: true });
  let failed = 0;
  try {
    await setup();
    const steps = ORDER.filter(s => m.steps.includes(s));
    const runners = { brand: stepBrand, flat: stepFlat, mockup: stepMockup, kit: stepKit, logo: stepLogo };
    for (const s of steps) {
      try { await runners[s](); }
      catch (e) { failed++; log('Шаг «' + s + '» упал: ' + errText(e), 'err'); }
    }
  } catch (e) {
    failed++;
    log('Подготовка не удалась: ' + errText(e), 'err');
  }
  log(failed ? 'Завершено с ошибками: ' + failed : 'Готово ✔', failed ? 'warn' : 'ok');
  figma.notify(failed ? 'ZoneLinks Builder: есть ошибки, смотри журнал' : 'ZoneLinks Builder: готово');
  figma.ui.postMessage({ type: 'busy', value: false });
};

async function setup() {
  log('Загружаю шрифты, переменные и компоненты…');
  await Promise.all(['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']
    .map(s => figma.loadFontAsync({ family: 'Manrope', style: s }))
    .concat([figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Regular' })]));

  VARS = {}; VARS_BY_ID = {};
  await loadVars();
  for (const need of ['bg/base', 'text/primary', 'accent/default']) {
    if (!VARS[need]) throw new Error('нет переменной «' + need + '» — запусти плагин в Figma-файле проекта (Amberite / ZoneLinks)');
  }
  STY = {}; for (const s of await figma.getLocalTextStylesAsync()) STY[s.name] = s;
  FX = {}; for (const s of await figma.getLocalEffectStylesAsync()) FX[s.name] = s;

  const pages = figma.root.children;
  PAGES.mock = pages.find(p => p.name.indexOf('1') === 0) || pages[0];
  PAGES.kit = pages.find(p => p.name.indexOf('2') === 0) || pages[1];
  PAGES.logo = pages.find(p => p.name.indexOf('3') === 0) || pages[2];
  if (!PAGES.kit || !PAGES.logo) throw new Error('нужны три страницы: «1 · Макет сайта», «2 · UI-кит», «3 · Логотип и иконки»');
  await Promise.all([PAGES.mock.loadAsync(), PAGES.kit.loadAsync(), PAGES.logo.loadAsync()]);
  indexComponents();
  LANTERN = ensureLantern();
  log('Найдено компонентов: ' + Object.keys(C).length, 'ok');
}

async function loadVars() {
  VARS = {}; VARS_BY_ID = {};
  for (const v of await figma.variables.getLocalVariablesAsync()) { VARS[v.name] = v; VARS_BY_ID[v.id] = v; }
}

function indexComponents() {
  C = {};
  for (const p of [PAGES.kit, PAGES.logo, PAGES.mock]) {
    for (const n of p.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
      if (n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET') continue;
      if (!C[n.name]) C[n.name] = n;
    }
  }
}

function ensureLantern() {
  if (C['Project Icon/Ember Lanterns']) return C['Project Icon/Ember Lanterns'];
  const f = figma.createNodeFromSvg(LANTERN_SVG);
  f.fills = [];
  const comp = figma.createComponentFromNode(f);
  comp.name = 'Project Icon/Ember Lanterns';
  comp.description = 'Иконка демо-мода Ember Lanterns (files/demo/ember-lanterns-icon.svg) — пример своей иконки вместо сгенерированной.';
  PAGES.logo.appendChild(comp);
  comp.x = 400; comp.y = 260;
  C[comp.name] = comp;
  return comp;
}

/* ======================== Помощники ======================== */

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
}
function solid(hex, opacity) { return { type: 'SOLID', color: hexRgb(hex), opacity: opacity == null ? 1 : opacity }; }
function toHex(c) {
  const h = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}
function varValue(v) { return Object.values(v.valuesByMode)[0]; }

// Заливка, привязанная к переменной. Реальный цвет пишем сразу — иначе в экземплярах остаётся чёрный.
function vp(name) {
  const v = VARS[name];
  if (!v) throw new Error('нет переменной «' + name + '»');
  const c = varValue(v);
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }, 'color', v);
}
function paintOf(color) { return typeof color === 'string' && color[0] === '#' ? solid(color) : vp(color); }
function fill(n, color) { n.fills = color ? [paintOf(color)] : []; }
function stroke(n, color, sides) {
  n.strokes = [paintOf(color)];
  n.strokeAlign = 'INSIDE';
  if (sides) {
    n.strokeTopWeight = sides.indexOf('t') >= 0 ? 1 : 0;
    n.strokeBottomWeight = sides.indexOf('b') >= 0 ? 1 : 0;
    n.strokeLeftWeight = sides.indexOf('l') >= 0 ? 1 : 0;
    n.strokeRightWeight = sides.indexOf('r') >= 0 ? 1 : 0;
  } else n.strokeWeight = 1;
}
function tint(node, color) {
  const p = paintOf(color);
  for (const v of node.findAllWithCriteria({ types: ['VECTOR', 'ELLIPSE', 'RECTANGLE', 'LINE', 'POLYGON', 'STAR', 'BOOLEAN_OPERATION'] })) {
    if (v.strokes && v.strokes.length) v.strokes = [p];
  }
}
function tintIcon(inst, color) {
  for (const i of inst.findAllWithCriteria({ types: ['INSTANCE'] })) if (i.name.indexOf('icon/') === 0) tint(i, color);
}

function pad(f, p) {
  const a = Array.isArray(p) ? p : [p];
  const t = a[0], r = a[1] != null ? a[1] : t, b = a[2] != null ? a[2] : t, l = a[3] != null ? a[3] : r;
  f.paddingTop = t; f.paddingRight = r; f.paddingBottom = b; f.paddingLeft = l;
}
function setW(f, w) {
  f.resize(w, f.height > 1 ? f.height : 10);
  if (f.layoutMode === 'VERTICAL') { f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; }
  else if (f.layoutMode === 'HORIZONTAL') { f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; }
}
function frame(name, dir, o) {
  o = o || {};
  const f = figma.createFrame();
  f.name = name;
  f.fills = [];
  f.clipsContent = false;
  if (dir) {
    f.layoutMode = dir;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.itemSpacing = o.gap || 0;
    if (o.pad != null) pad(f, o.pad);
    if (o.align) f.counterAxisAlignItems = o.align;
    if (o.justify) f.primaryAxisAlignItems = o.justify;
    if (o.wrap) { f.layoutWrap = 'WRAP'; f.counterAxisSpacing = o.wrapGap != null ? o.wrapGap : (o.gap || 0); }
  }
  if (o.w) setW(f, o.w);
  if (o.fill) fill(f, o.fill);
  if (o.stroke) stroke(f, o.stroke, o.sides);
  if (o.r != null) f.cornerRadius = o.r;
  return f;
}
function add(parent, node, grow) {
  parent.appendChild(node);
  if (grow) node.layoutSizingHorizontal = 'FILL';
  return node;
}
function spacer(parent, h) {
  const s = figma.createFrame();
  s.name = 'Отступ';
  s.fills = [];
  s.resize(1, h);
  parent.appendChild(s);
  return s;
}
async function text(str, style, color, o) {
  o = o || {};
  const t = figma.createText();
  const st = STY[style];
  if (st) await t.setTextStyleIdAsync(st.id);
  else t.fontName = { family: 'Manrope', style: 'Regular' };
  if (o.font) t.fontName = { family: 'Manrope', style: o.font };
  if (o.mono) t.fontName = { family: 'JetBrains Mono', style: 'Regular' };
  if (o.size) t.fontSize = o.size;
  t.characters = str;
  if (color) t.fills = [paintOf(color)];
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.w) { t.textAutoResize = 'HEIGHT'; t.resize(o.w, Math.max(t.height, 1)); }
  if (o.opacity != null) t.opacity = o.opacity;
  return t;
}
function monoRange(t, part) {
  const i = t.characters.indexOf(part);
  if (i >= 0) t.setRangeFontName(i, i + part.length, { family: 'JetBrains Mono', style: 'Regular' });
}
function boldRange(t, part) {
  const i = t.characters.indexOf(part);
  if (i >= 0) t.setRangeFontName(i, i + part.length, { family: 'Manrope', style: 'Bold' });
}

function comp(name, variant) {
  const n = C[name];
  if (!n) throw new Error('нет компонента «' + name + '»');
  if (n.type !== 'COMPONENT_SET') return n;
  if (!variant) return n.defaultVariant;
  const want = Object.keys(variant).map(k => k + '=' + variant[k]);
  const found = n.children.find(ch => want.every(w => ch.name.split(', ').indexOf(w) >= 0));
  if (!found) throw new Error('нет варианта ' + want.join(', ') + ' у «' + name + '»');
  return found;
}
function inst(name, variant, parent, map) {
  const i = comp(name, variant).createInstance();
  if (parent) parent.appendChild(i);
  if (map) props(i, map);
  return i;
}
function props(i, map) {
  const keys = Object.keys(i.componentProperties);
  const res = {};
  for (const k of Object.keys(map)) {
    const key = keys.find(x => x === k || x.split('#')[0] === k);
    if (key) res[key] = map[k];
    else log('Нет свойства «' + k + '» у ' + i.name, 'warn');
  }
  if (Object.keys(res).length) i.setProperties(res);
}
function nested(i, name) { return i.findAllWithCriteria({ types: ['INSTANCE'] }).find(n => n.name === name); }
function setCount(i, value) { const c = nested(i, 'Count'); if (c) props(c, { 'Число': value }); }
function iconId(name) { return comp('icon/' + name).id; }
function icon(name, size, color, parent) {
  const i = comp('icon/' + name).createInstance();
  if (size && size !== 24) i.rescale(size / 24);
  tint(i, color || 'text/secondary');
  if (parent) parent.appendChild(i);
  return i;
}
function fitSize(node, size) {
  if (Math.abs(node.width - size) < 0.5) return;
  try { node.rescale(size / node.width); }
  catch (e) { try { node.resize(size, size); } catch (e2) { /* размер внутри экземпляра не меняется — оставляем */ } }
}
async function linkMore(label) {
  const f = frame('Ссылка', 'HORIZONTAL', { gap: 6, align: 'CENTER' });
  f.appendChild(await text(label, 'Label/Default', 'accent/text'));
  icon('arrow-right', 16, 'accent/text', f);
  return f;
}

/* ======================== Шаг 0: ребрендинг ZoneLinks ======================== */

function rgba(hex, a) { const c = hexRgb(hex); return { r: c.r, g: c.g, b: c.b, a: a == null ? 1 : a }; }

// Перезаписывает привязанные к переменным цвета актуальными значениями (иначе в экземплярах остаются старые)
function resyncPaints(page) {
  let n = 0;
  const fix = arr => {
    let changed = false;
    const out = arr.map(p => {
      const b = p && p.type === 'SOLID' && p.boundVariables && p.boundVariables.color;
      const v = b && VARS_BY_ID[b.id];
      if (!v) return p;
      changed = true;
      const np = vp(v.name);
      return p.opacity != null && p.opacity !== 1 ? Object.assign({}, np, { opacity: p.opacity }) : np;
    });
    return changed ? out : null;
  };
  for (const node of page.findAll(x => 'fills' in x || 'strokes' in x)) {
    try {
      if (Array.isArray(node.fills)) { const r = fix(node.fills); if (r) { node.fills = r; n++; } }
      if (Array.isArray(node.strokes)) { const r = fix(node.strokes); if (r) { node.strokes = r; n++; } }
    } catch (e) { /* узел нельзя менять — пропускаем */ }
  }
  return n;
}

function rebuildMark(mark) {
  for (const ch of mark.children.slice()) ch.remove();
  const f = figma.createNodeFromSvg(LOGO_PARTS_SVG);
  const kids = f.children.slice();
  if (kids.length < 12) { f.remove(); throw new Error('логотип: ожидалось 12 фигур, получено ' + kids.length); }
  const sphere = figma.subtract(kids.slice(0, 10), f);
  sphere.name = 'Сфера';
  sphere.fills = [solid(LOGO_COLORS.sphere)];
  const badge = figma.subtract([kids[10], kids[11]], f);
  badge.name = 'Плюс';
  badge.fills = [solid(LOGO_COLORS.badge)];
  mark.appendChild(sphere);
  mark.appendChild(badge);
  f.remove();
  mark.fills = [];
  mark.description = 'Знак ZoneLinks: сфера из закрученных волн и значок «плюс» снизу. Исходник — assets/img/logo.svg. Минимальный размер — 16px.';
}

async function stepBrand() {
  log('Ребрендинг: ' + BRAND + ', морская палитра…');
  // 1. Переменные «Тема»: переименовать teal → green и поставить морские значения
  for (const [from, to] of [['status/teal', 'status/green'], ['status/teal-soft', 'status/green-soft']]) {
    if (VARS[from] && !VARS[to]) VARS[from].name = to;
  }
  await loadVars();
  const lightByName = {};
  for (const d of LIGHT_PALETTE) lightByName[d[0]] = d;
  let vars = 0;
  for (const d of DARK_PALETTE) {
    const v = VARS[d[0]];
    if (!v) { log('Нет переменной «' + d[0] + '» — пропускаю', 'warn'); continue; }
    v.setValueForMode(Object.keys(v.valuesByMode)[0], rgba(d[2], d[3]));
    v.setVariableCodeSyntax('WEB', 'var(' + d[1] + ')');
    const l = lightByName[d[0]];
    if (l) v.description = 'Светлая тема: ' + l[2] + (l[3] < 1 ? ' · ' + Math.round(l[3] * 100) + '%' : '');
    vars++;
  }
  log('  переменных обновлено: ' + vars, 'ok');

  // 2. Название в логотипе
  const word = C['Logo/Wordmark'];
  if (word) {
    const key = Object.keys(word.componentPropertyDefinitions).find(k => k.split('#')[0] === 'Название');
    if (key) word.editComponentProperty(key, { defaultValue: BRAND });
    log('  название: ' + BRAND, 'ok');
  }

  // 3. Новый знак
  const mark = C['Logo/Mark'];
  if (mark) { rebuildMark(mark); log('  знак пересобран', 'ok'); }
  else log('Нет компонента Logo/Mark', 'warn');

  // 4. Тень кнопки — в морской цвет
  if (FX['Тень/Кнопка']) {
    FX['Тень/Кнопка'].effects = [{ type: 'DROP_SHADOW', color: { r: .114, g: .525, b: .722, a: .45 }, offset: { x: 0, y: 8 }, radius: 22, spread: -10, visible: true, blendMode: 'NORMAL' }];
  }

  // 5. Обновить уже привязанные цвета во всём файле
  let painted = 0;
  for (const page of [PAGES.kit, PAGES.logo, PAGES.mock]) painted += resyncPaints(page);
  log('  цветов перепривязано: ' + painted, 'ok');
}

/* ======================== Шаг 1: меньше градиентов ======================== */

function flatten(g) {
  const st = g.gradientStops || [];
  if (!st.length) return { type: 'SOLID', color: { r: .5, g: .5, b: .5 } };
  let r = 0, gg = 0, b = 0, a = 0;
  for (const s of st) { r += s.color.r; gg += s.color.g; b += s.color.b; a += s.color.a; }
  const n = st.length, alpha = a / n;
  const base = g.opacity == null ? 1 : g.opacity;
  return { type: 'SOLID', color: { r: r / n, g: gg / n, b: b / n }, opacity: (alpha < 1 ? alpha * 0.5 : 1) * base, visible: g.visible !== false };
}

async function stepFlat() {
  log('Убираю градиенты…');
  let count = 0;
  const btn = C['Button'];
  if (btn) {
    for (const v of btn.children) {
      if (v.name.indexOf('Style=Primary') >= 0) { v.fills = [vp('accent/default')]; v.effects = []; count++; }
    }
  }
  const vr = C['Version Row'];
  if (vr) {
    const dl = vr.findAllWithCriteria({ types: ['FRAME'] }).find(f => f.name === 'Скачать');
    if (dl) { dl.fills = [vp('accent/default')]; count++; }
  }
  if (C['Project Icon']) { C['Project Icon'].fills = [solid('#9c4fc0')]; count++; }

  // Всё остальное с градиентом — в средний цвет градиента
  for (const page of [PAGES.kit, PAGES.logo, PAGES.mock]) {
    const nodes = page.findAll(x => {
      if (!('fills' in x)) return false;
      const f = x.fills;
      return Array.isArray(f) && f.some(p => p.type && p.type.indexOf('GRADIENT') === 0);
    });
    for (const n of nodes) {
      try { n.fills = n.fills.map(p => (p.type.indexOf('GRADIENT') === 0 ? flatten(p) : p)); count++; }
      catch (e) { /* узел нельзя менять (например, внутри экземпляра) — пропускаем */ }
    }
  }
  log('Градиентов убрано: ' + count, 'ok');
}

/* ======================== Шаг 2: макет сайта ======================== */

async function stepMockup() {
  log('Строю макет сайта…');
  await figma.setCurrentPageAsync(PAGES.mock);
  for (const n of PAGES.mock.children.slice()) if (SCREENS.indexOf(n.name) >= 0) n.remove();
  let project = null;
  const builders = [
    ['Главная', () => buildHome(0)],
    ['Каталог', () => buildCatalog(1560)],
    ['Страница мода', async () => { project = await buildProject(3120); }],
    ['Окно скачивания', () => buildModal(4680, project)]
  ];
  for (const [name, fn] of builders) {
    try { await fn(); log('  ✓ ' + name, 'ok'); }
    catch (e) { log('  ✗ ' + name + ': ' + errText(e), 'err'); }
  }
  figma.viewport.scrollAndZoomIntoView(PAGES.mock.children.filter(n => SCREENS.indexOf(n.name) >= 0));
}

function screen(name, x) {
  const s = frame(name, 'VERTICAL', { align: 'CENTER', fill: 'bg/base' });
  setW(s, 1440);
  s.clipsContent = true;
  PAGES.mock.appendChild(s);
  s.x = x; s.y = 0;
  return s;
}

function header(parent, active) {
  const h = inst('Site Header', null, parent);
  if (active) {
    const n = nested(h, 'Nav / ' + active);
    if (n) {
      n.setProperties({ State: 'Active' });
      tintIcon(n, 'accent/text');
    }
  }
  return h;
}

function typeTabs(parent, active) {
  const defs = [['Моды', 'box', '2', false], ['Ресурспаки', 'image', '1', false], ['Плагины', 'plug', null, true]];
  for (const d of defs) {
    const on = d[0] === active;
    const t = inst('Type Tab', { State: on ? 'Active' : 'Default' }, parent,
      { 'Текст': d[0], 'Иконка': iconId(d[1]), 'Счётчик': !!d[2], 'Скоро': d[3] });
    tintIcon(t, on ? 'accent/text' : 'text/secondary');
    if (d[2]) setCount(t, d[2]);
  }
}

function setCardTags(card, p) {
  const row = card.findAllWithCriteria({ types: ['FRAME'] }).find(f => f.name === 'Метки');
  if (!row) return;
  const kids = row.children;
  if (kids[0]) kids[0].setProperties({ Status: p.status });
  const items = p.cats.map(c => ({ type: 'Default', text: c }))
    .concat(p.loaders.map(l => ({ type: 'Loader', text: LOADER_LABEL[l], loader: l })));
  kids.slice(1).forEach((slot, idx) => {
    const it = items[idx];
    if (!it) { slot.visible = false; return; }
    slot.visible = true;
    slot.setProperties({ Type: it.type });
    props(slot, { 'Текст': it.text });
    if (it.loader) {
      const dot = slot.findAllWithCriteria({ types: ['ELLIPSE'] })[0];
      if (dot) dot.fills = [vp('loader/' + it.loader)];
    }
  });
}

function applyProjectIcon(ic, p, size) {
  if (!ic) return;
  if (p.icon === 'lantern') ic.swapComponent(LANTERN);
  else { props(ic, { 'Буквы': p.letters }); ic.fills = [solid(p.color)]; }
  fitSize(ic, size);
}

function projectCard(p, layout) {
  const c = inst('Project Card', { Layout: layout });
  props(c, { 'Название': p.title, 'Автор': 'от ' + p.author, 'Описание': p.summary, 'Обновлён': p.updated });
  setCardTags(c, p);
  const ic = c.findAllWithCriteria({ types: ['INSTANCE'] }).find(n => n.name.indexOf('Project Icon') === 0);
  applyProjectIcon(ic, p, layout === 'Grid' ? 64 : 96);
  return c;
}

async function buildHome(x) {
  const s = screen('Главная — Desktop', x);
  header(s, null);

  const hero = frame('Hero', 'VERTICAL', { align: 'CENTER', pad: [76, 0, 60, 0], fill: 'bg/base', stroke: 'border/default', sides: 'b' });
  add(s, hero, true);
  const logo = inst('Logo/Mark', null, hero);
  fitSize(logo, 88);
  spacer(hero, 22);
  const t1 = 'Моды, которые ещё ', t2 = 'на проверке', t3 = ', — уже можно скачать';
  const title = await text(t1 + t2 + t3, 'Display/Hero', 'text/primary', { align: 'CENTER', w: 1000 });
  title.setRangeFills(t1.length, t1.length + t2.length, [vp('accent/text')]);
  hero.appendChild(title);
  spacer(hero, 16);
  hero.appendChild(await text('Временная площадка для модов и ресурспаков, пока их проверяют на больших сайтах. Без регистрации и рекламы — выбери версию игры и скачай.',
    'Body/Large', 'text/secondary', { align: 'CENTER', w: 620 }));
  spacer(hero, 30);

  const sb = frame('Поиск', 'HORIZONTAL', { gap: 10, align: 'CENTER', pad: [6, 6, 6, 18], fill: 'bg/surface', stroke: 'border/strong', r: 18 });
  setW(sb, 640);
  hero.appendChild(sb);
  if (FX['Тень/Карточка']) await sb.setEffectStyleIdAsync(FX['Тень/Карточка'].id);
  icon('search', 19, 'text/muted', sb);
  const ph = await text('Найти мод или ресурспак…', 'Body/Default', 'text/muted', { size: 16 });
  sb.appendChild(ph); ph.layoutGrow = 1;
  const fb = inst('Button', { Style: 'Primary', Size: 'MD' }, sb, { 'Текст': 'Найти', 'Показать иконку': false });
  fb.resize(fb.width, 44);
  spacer(hero, 22);
  const pills = frame('Разделы', 'HORIZONTAL', { gap: 10 });
  hero.appendChild(pills);
  typeTabs(pills, null);

  const sec = frame('Недавно обновлённые', 'VERTICAL', { gap: 16, pad: [44, 0, 0, 0], w: 1192 });
  s.appendChild(sec);
  const head = frame('Заголовок', 'HORIZONTAL', { justify: 'SPACE_BETWEEN', align: 'CENTER' });
  add(sec, head, true);
  head.appendChild(await text('Недавно обновлённые', 'Heading/H2', 'text/primary'));
  head.appendChild(await linkMore('Все моды'));
  const grid = frame('Карточки', 'HORIZONTAL', { gap: 14 });
  add(sec, grid, true);
  for (const p of PROJECTS) add(grid, projectCard(p, 'Grid'), true);

  const steps = frame('Как это работает', 'HORIZONTAL', { gap: 14, pad: [44, 0, 72, 0], w: 1192 });
  s.appendChild(steps);
  const defs = [
    ['1', 'Найди проект', 'Ищи по названию, автору или описанию — среди модов, ресурспаков, а скоро и плагинов.'],
    ['2', 'Выбери версию', 'Укажи версию Minecraft и платформу — сайт сам подберёт подходящий файл.'],
    ['3', 'Скачай и играй', 'Файл качается напрямую. Когда проект пройдёт проверку, здесь появится ссылка на его официальную страницу.']
  ];
  for (const d of defs) {
    const card = frame('Шаг ' + d[0], 'VERTICAL', { pad: 22, fill: 'bg/surface', stroke: 'border/default', r: 18 });
    add(steps, card, true);
    const num = frame('Номер', 'HORIZONTAL', { align: 'CENTER', justify: 'CENTER', fill: 'accent/soft', r: 11 });
    num.resize(36, 36);
    num.appendChild(await text(d[0], 'Label/Default', 'accent/text', { font: 'ExtraBold' }));
    card.appendChild(num);
    spacer(card, 12);
    card.appendChild(await text(d[1], 'Heading/H4', 'text/primary', { size: 18 }));
    spacer(card, 6);
    card.appendChild(await text(d[2], 'Body/Default', 'text/secondary', { w: 344 }));
  }
  inst('Site Footer', null, s);
  return s;
}

function segControl(parent) {
  const seg = frame('Вид', 'HORIZONTAL', { gap: 4, pad: 4, fill: 'bg/surface', stroke: 'border/default', r: 14 });
  for (const [name, on] of [['list', true], ['grid', false]]) {
    const b = frame(name === 'list' ? 'Списком' : 'Сеткой', 'HORIZONTAL', { align: 'CENTER', justify: 'CENTER', r: 10, fill: on ? 'bg/strong' : null });
    b.resize(36, 36);
    icon(name, 18, on ? 'text/primary' : 'text/muted', b);
    seg.appendChild(b);
  }
  parent.appendChild(seg);
  return seg;
}

async function buildCatalog(x) {
  const s = screen('Каталог модов — Desktop', x);
  header(s, 'Моды');
  const main = frame('Каталог', 'VERTICAL', { pad: [30, 0, 72, 0], w: 1192 });
  s.appendChild(main);
  main.appendChild(await text('Моды', 'Heading/H1', 'text/primary'));
  spacer(main, 4);
  main.appendChild(await text('Моды для Fabric, Forge, NeoForge и Quilt, которые сейчас ждут проверки.', 'Body/Default', 'text/muted'));
  spacer(main, 18);
  const tabs = frame('Разделы', 'HORIZONTAL', { gap: 8 });
  main.appendChild(tabs);
  typeTabs(tabs, 'Моды');
  spacer(main, 14);
  const tb = frame('Панель', 'HORIZONTAL', { gap: 10, align: 'CENTER' });
  add(main, tb, true);
  add(tb, inst('Search Field', { State: 'Default' }), true);
  inst('Select', null, tb);
  segControl(tb);
  spacer(main, 10);
  main.appendChild(await text('2 проекта', 'Body/Small', 'text/muted', { font: 'SemiBold' }));
  spacer(main, 12);
  const list = frame('Результаты', 'VERTICAL', { gap: 12 });
  add(main, list, true);
  for (const p of PROJECTS.filter(q => q.type === 'Мод')) add(list, projectCard(p, 'List'), true);
  inst('Site Footer', null, s);
  return s;
}

async function mdHeading(parent, str, w) {
  const h = frame(str, 'VERTICAL', { pad: [12, 0, 6, 0], stroke: 'border/default', sides: 'b' });
  add(parent, h, true);
  h.appendChild(await text(str, 'Heading/H2', 'text/primary', { size: 23, w }));
}
async function mdList(parent, items, w, ordered) {
  const list = frame('Список', 'VERTICAL', { gap: 6 });
  add(parent, list, true);
  for (let i = 0; i < items.length; i++) {
    const row = frame('Пункт', 'HORIZONTAL', { gap: 10 });
    list.appendChild(row);
    row.appendChild(await text(ordered ? (i + 1) + '.' : '•', 'Body/Default', 'accent/text', { font: 'Bold' }));
    const t = await text(items[i], 'Body/Default', 'text/primary', { w: w - 30 });
    row.appendChild(t);
    const link = t.characters.indexOf('Fabric API');
    if (link >= 0) {
      t.setRangeFills(link, link + 10, [vp('accent/text')]);
      t.setRangeTextDecoration(link, link + 10, 'UNDERLINE');
    }
    monoRange(t, '.jar'); monoRange(t, ' mods');
  }
}
async function sideCard(parent, title) {
  const c = frame(title, 'VERTICAL', { gap: 12, pad: 18, fill: 'bg/surface', stroke: 'border/default', r: 18 });
  add(parent, c, true);
  c.appendChild(await text(title, 'Heading/H4', 'text/primary'));
  return c;
}
async function sideLabel(parent, str) {
  parent.appendChild(await text(str, 'Label/Small', 'text/muted', { font: 'Bold' }));
}

async function buildProject(x) {
  const s = screen('Страница мода — Desktop', x);
  header(s, 'Моды');
  const main = frame('Проект', 'VERTICAL', { pad: [30, 0, 72, 0], w: 1192 });
  s.appendChild(main);

  const head = frame('Шапка проекта', 'HORIZONTAL', { gap: 22, pad: 24, fill: 'bg/surface', stroke: 'border/default', r: 18 });
  add(main, head, true);
  const pic = LANTERN.createInstance();
  head.appendChild(pic);
  fitSize(pic, 120);
  const col = frame('Описание', 'VERTICAL', { w: 770 });
  head.appendChild(col);
  const kicker = frame('Тип', 'HORIZONTAL', { gap: 6, align: 'CENTER' });
  col.appendChild(kicker);
  icon('box', 14, 'text/muted', kicker);
  kicker.appendChild(await text('Мод', 'Label/Overline', 'text/muted'));
  spacer(col, 2);
  col.appendChild(await text('Ember Lanterns', 'Heading/H1', 'text/primary'));
  spacer(col, 6);
  col.appendChild(await text(PROJECTS[0].summary, 'Body/Default', 'text/secondary', { size: 16, w: 770 }));
  spacer(col, 12);
  const tags = frame('Метки', 'HORIZONTAL', { gap: 6 });
  col.appendChild(tags);
  inst('Badge', { Status: 'На проверке' }, tags);
  inst('Chip', { Type: 'Default' }, tags, { 'Текст': 'Декор' });
  spacer(col, 14);
  const stats = frame('Статистика', 'HORIZONTAL', { gap: 18, align: 'CENTER' });
  col.appendChild(stats);
  for (const d of [['clock', 'Обновлён позавчера'], ['layers', '4 версии'], ['user', 'DemoAuthor']]) {
    const st = frame(d[1], 'HORIZONTAL', { gap: 6, align: 'CENTER' });
    stats.appendChild(st);
    icon(d[0], 16, 'text/muted', st);
    st.appendChild(await text(d[1], 'Body/Small', 'text/muted'));
  }
  const act = frame('Действия', 'VERTICAL', { gap: 10, w: 210 });
  head.appendChild(act);
  add(act, inst('Button', { Style: 'Primary', Size: 'LG' }), true);
  const copy = inst('Button', { Style: 'Secondary', Size: 'MD' }, null, null);
  add(act, copy, true);
  props(copy, { 'Текст': 'Скопировать ссылку', 'Иконка': iconId('link') });
  tintIcon(copy, 'text/primary');

  spacer(main, 14);
  add(main, inst('Banner', { Status: 'На проверке' }), true);
  spacer(main, 20);

  const cols = frame('Колонки', 'HORIZONTAL', { gap: 20 });
  add(main, cols, true);
  const content = frame('Контент', 'VERTICAL', { gap: 14, w: 842 });
  cols.appendChild(content);
  const side = frame('Сайдбар', 'VERTICAL', { gap: 14, w: 330 });
  cols.appendChild(side);

  const tabs = frame('Вкладки', 'HORIZONTAL', { gap: 4, pad: 5, fill: 'bg/surface', stroke: 'border/default', r: 15 });
  add(content, tabs, true);
  for (const d of [['Описание', true, null], ['Галерея', false, '2'], ['Изменения', false, null], ['Версии', false, '4']]) {
    const t = inst('Tab', { State: d[1] ? 'Active' : 'Default' }, tabs, { 'Текст': d[0], 'Счётчик': !!d[2] });
    if (d[2]) setCount(t, d[2]);
  }

  const W = 842 - 56;
  const md = frame('Текст описания', 'VERTICAL', { gap: 12, pad: [26, 28, 26, 28], fill: 'bg/surface', stroke: 'border/default', r: 18 });
  add(content, md, true);
  const p1 = await text('Тёплые янтарные фонари для уютных построек: улиц, таверн и замков.', 'Body/Default', 'text/primary', { w: W });
  boldRange(p1, 'янтарные фонари');
  md.appendChild(p1);
  await mdHeading(md, 'Возможности', W);
  await mdList(md, ['16 цветов — фонарь красится обычными красителями', 'Мягкое мерцание света (можно выключить в конфиге)',
    'Подвесные цепи любой длины', 'Светят так же ярко, как обычный фонарь'], W, false);
  await mdHeading(md, 'Установка', W);
  await mdList(md, ['Установи Fabric Loader или NeoForge', 'Для Fabric нужен ещё Fabric API', 'Положи файл .jar в папку mods'], W, true);
  const quote = frame('Цитата', 'HORIZONTAL', { pad: [10, 16, 10, 16], fill: 'accent/soft' });
  add(md, quote, true);
  quote.strokes = [vp('accent/default')];
  quote.strokeAlign = 'INSIDE';
  quote.strokeTopWeight = 0; quote.strokeRightWeight = 0; quote.strokeBottomWeight = 0; quote.strokeLeftWeight = 3;
  quote.topRightRadius = 12; quote.bottomRightRadius = 12;
  quote.appendChild(await text('Мод сейчас на проверке. Как только его одобрят, здесь появится ссылка на официальную страницу.',
    'Body/Default', 'text/secondary', { w: W - 35 }));

  const compat = await sideCard(side, 'Совместимость');
  const g1 = frame('Версии игры', 'VERTICAL', { gap: 7 });
  add(compat, g1, true);
  await sideLabel(g1, 'Minecraft: Java Edition');
  const vrow = frame('Версии', 'HORIZONTAL', { gap: 6 });
  g1.appendChild(vrow);
  for (const v of ['1.21.1', '1.21', '1.20.1']) inst('Chip', { Type: 'Default' }, vrow, { 'Текст': v });
  const g2 = frame('Платформы', 'VERTICAL', { gap: 7 });
  add(compat, g2, true);
  await sideLabel(g2, 'Платформы');
  const lrow = frame('Платформы', 'HORIZONTAL', { gap: 6 });
  g2.appendChild(lrow);
  for (const l of ['fabric', 'forge', 'neoforge']) {
    const chip = inst('Chip', { Type: 'Loader' }, lrow, { 'Текст': LOADER_LABEL[l] });
    const dot = chip.findAllWithCriteria({ types: ['ELLIPSE'] })[0];
    if (dot) dot.fills = [vp('loader/' + l)];
  }
  const g3 = frame('Где нужен', 'VERTICAL', { gap: 7 });
  add(compat, g3, true);
  await sideLabel(g3, 'Где нужен');
  const env = frame('Окружение', 'HORIZONTAL', { gap: 10 });
  g3.appendChild(env);
  icon('globe', 18, 'accent/text', env);
  const envText = frame('Текст', 'VERTICAL');
  env.appendChild(envText);
  envText.appendChild(await text('Клиент и сервер', 'Body/Default', 'text/primary', { font: 'Bold' }));
  envText.appendChild(await text('Клиент: обязателен · Сервер: обязателен', 'Body/Small', 'text/muted', { size: 13 }));

  const deps = await sideCard(side, 'Зависимости');
  add(deps, inst('Dependency'), true);

  const author = await sideCard(side, 'Автор');
  const arow = frame('Автор', 'HORIZONTAL', { gap: 12, align: 'CENTER' });
  author.appendChild(arow);
  const ava = frame('Аватар', 'HORIZONTAL', { align: 'CENTER', justify: 'CENTER', fill: 'accent/default', r: 13 });
  ava.resize(42, 42);
  ava.appendChild(await text('D', 'Label/Default', 'accent/ink', { font: 'ExtraBold' }));
  arow.appendChild(ava);
  const an = frame('Имя', 'VERTICAL');
  arow.appendChild(an);
  an.appendChild(await text('DemoAuthor', 'Body/Default', 'text/primary', { font: 'Bold' }));
  an.appendChild(await text('Автор', 'Body/Small', 'text/muted'));

  const det = await sideCard(side, 'Детали');
  for (const d of [['tag', 'Тип', 'Мод'], ['scale', 'Лицензия', 'MIT'], ['calendar', 'Опубликован', '30 августа 2026 г.'], ['clock', 'Обновлён', '24 сентября 2026 г.']]) {
    const r = frame(d[1], 'HORIZONTAL', { gap: 10, align: 'CENTER' });
    add(det, r, true);
    icon(d[0], 16, 'text/muted', r);
    r.appendChild(await text(d[1], 'Body/Small', 'text/muted'));
    const grow = figma.createFrame(); grow.name = 'Растяжка'; grow.fills = []; grow.resize(1, 1);
    r.appendChild(grow); grow.layoutGrow = 1;
    r.appendChild(await text(d[2], 'Body/Small', 'text/primary', { font: 'SemiBold' }));
  }

  inst('Site Footer', null, s);
  return s;
}

async function buildModal(x, projectScreen) {
  const s = figma.createFrame();
  s.name = 'Окно скачивания — Desktop';
  s.resize(1440, 1024);
  s.clipsContent = true;
  fill(s, 'bg/base');
  PAGES.mock.appendChild(s);
  s.x = x; s.y = 0;
  if (projectScreen) { const bg = projectScreen.clone(); s.appendChild(bg); bg.x = 0; bg.y = 0; }
  const shade = figma.createRectangle();
  shade.name = 'Затемнение';
  shade.resize(1440, 1024);
  shade.fills = [solid('#06040a', 0.68)];
  s.appendChild(shade);

  const m = frame('Окно', 'VERTICAL', { fill: 'bg/surface', stroke: 'border/strong', r: 22, w: 540 });
  s.appendChild(m);
  if (FX['Тень/Окно']) await m.setEffectStyleIdAsync(FX['Тень/Окно'].id);

  const hd = frame('Заголовок', 'HORIZONTAL', { gap: 14, align: 'CENTER', pad: [20, 20, 0, 20] });
  add(m, hd, true);
  const li = LANTERN.createInstance();
  hd.appendChild(li);
  fitSize(li, 54);
  const tc = frame('Текст', 'VERTICAL', { gap: 2 });
  hd.appendChild(tc); tc.layoutGrow = 1;
  tc.appendChild(await text('Скачать Ember Lanterns', 'Heading/H4', 'text/primary', { size: 20 }));
  tc.appendChild(await text('Мод от DemoAuthor', 'Body/Small', 'text/muted'));
  const close = inst('Icon Button', null, hd, { 'Иконка': iconId('close') });
  tintIcon(close, 'text/secondary');

  const bd = frame('Содержимое', 'VERTICAL', { gap: 16, pad: 20 });
  add(m, bd, true);
  const fields = frame('Поля', 'HORIZONTAL', { gap: 12 });
  add(bd, fields, true);
  for (const d of [['Версия игры', '1.21.1'], ['Платформа', 'Fabric']]) {
    const f = frame(d[0], 'VERTICAL', { gap: 6 });
    add(fields, f, true);
    f.appendChild(await text(d[0], 'Label/Small', 'text/muted', { font: 'Bold' }));
    const sel = inst('Select', null, null, null);
    add(f, sel, true);
    props(sel, { 'Значение': d[1] });
    sel.fills = [vp('bg/raised')];
  }
  const vl = frame('Версия', 'HORIZONTAL', { gap: 10, align: 'CENTER' });
  add(bd, vl, true);
  inst('Channel', { Type: 'Релиз' }, vl);
  const vc = frame('Номер', 'VERTICAL');
  vl.appendChild(vc); vc.layoutGrow = 1;
  vc.appendChild(await text('Ember Lanterns 1.2.0', 'Body/Default', 'text/primary', { font: 'Bold' }));
  vc.appendChild(await text('1.2.0', 'Body/Small', 'text/muted', { size: 13 }));
  vl.appendChild(await text('Релиз · 24 сентября 2026 г.', 'Body/Small', 'text/muted', { size: 13 }));
  add(bd, inst('File Row'), true);
  const depBox = frame('Зависимости', 'VERTICAL', { gap: 7 });
  add(bd, depBox, true);
  depBox.appendChild(await text('Также понадобится', 'Label/Small', 'text/muted', { font: 'Bold' }));
  add(depBox, inst('Dependency'), true);
  const hint = frame('Подсказка', 'HORIZONTAL', { gap: 10, pad: [12, 14, 12, 14], fill: 'bg/raised', r: 14 });
  add(bd, hint, true);
  icon('info', 18, 'accent/text', hint);
  const ht = await text('Положи файл .jar в папку .minecraft/mods и запусти игру с нужным загрузчиком.', 'Body/Small', 'text/secondary', { w: 432 });
  monoRange(ht, '.jar'); monoRange(ht, '.minecraft/mods');
  hint.appendChild(ht);

  const ft = frame('Низ', 'HORIZONTAL', { justify: 'MAX', pad: [14, 20, 14, 20], stroke: 'border/default', sides: 't' });
  add(m, ft, true);
  ft.appendChild(await linkMore('Все версии'));

  m.x = Math.round((1440 - m.width) / 2);
  m.y = Math.max(40, Math.round((1024 - m.height) / 2));
  return s;
}

/* ======================== Шаг 3: UI-кит ======================== */

function restoreFromDoc(page, docName, names) {
  const old = page.children.find(n => n.name === docName);
  if (!old) return;
  for (const name of names) {
    const n = old.findOne(x => x.name === name && (x.type === 'COMPONENT' || x.type === 'COMPONENT_SET' || x.type === 'FRAME') &&
      (!x.parent || x.parent.type !== 'COMPONENT_SET'));
    if (n) page.appendChild(n);
  }
  old.remove();
}

async function docSection(doc, title, sub) {
  const s = frame(title, 'VERTICAL', { gap: 18 });
  add(doc, s, true);
  const h = frame('Заголовок', 'VERTICAL', { gap: 4 });
  s.appendChild(h);
  h.appendChild(await text(title, 'Heading/H2', 'text/primary', { size: 28 }));
  if (sub) h.appendChild(await text(sub, 'Body/Default', 'text/muted', { w: 900 }));
  return s;
}
function docRow(parent, name, gap) {
  const r = frame(name, 'HORIZONTAL', { gap: gap || 32, wrap: true, wrapGap: gap || 32 });
  add(parent, r, true);
  r.counterAxisAlignItems = 'MIN';
  return r;
}
function put(row, name) {
  const n = C[name];
  if (!n) { log('Не найден компонент «' + name + '»', 'warn'); return; }
  row.appendChild(n);
}

async function swatch(parent, name, css, paint, hexLabel, light) {
  const s = frame(name, 'VERTICAL', { gap: 6, w: 164 });
  parent.appendChild(s);
  const block = figma.createRectangle();
  block.name = 'Цвет';
  block.resize(164, 72);
  block.cornerRadius = 12;
  block.fills = [paint];
  block.strokes = [light ? solid('#c5d5dd') : vp('border/strong')];
  block.strokeAlign = 'INSIDE';
  s.appendChild(block);
  const c1 = light ? '#0e1b23' : 'text/primary';
  const c2 = light ? '#62798a' : 'text/muted';
  s.appendChild(await text(name, 'Label/Small', c1, { font: 'Bold' }));
  s.appendChild(await text(css + ' · ' + hexLabel, 'Code/Default', c2, { size: 11 }));
  return s;
}

async function stepKit() {
  log('Оформляю UI-кит…');
  await figma.setCurrentPageAsync(PAGES.kit);
  restoreFromDoc(PAGES.kit, DOC_KIT, KIT_COMPONENTS);
  indexComponents();

  const doc = frame(DOC_KIT, 'VERTICAL', { gap: 64, pad: 64, fill: 'bg/base', w: 1568 });
  PAGES.kit.appendChild(doc);
  doc.x = 0; doc.y = 0;

  const top = frame('Обложка', 'VERTICAL', { gap: 12 });
  doc.appendChild(top);
  const wm = inst('Logo/Wordmark', null, top);
  fitSize(wm, wm.width * 1.4);
  top.appendChild(await text('UI-кит', 'Display/Hero', 'text/primary'));
  top.appendChild(await text('Компоненты сайта ZoneLinks. Цвета — переменные коллекции «Тема», размеры — «Размеры», цвета платформ — «Платформы». ' +
    'Светлая тема показана отдельной палитрой: на бесплатном тарифе Figma у коллекции может быть только один режим.', 'Body/Large', 'text/secondary', { w: 960 }));

  // Цвета — тёмная тема (живые переменные)
  const dark = await docSection(doc, 'Цвета · тёмная тема', 'Все цвета привязаны к переменным: поменяй значение переменной — поменяется весь макет.');
  const dRow = docRow(dark, 'Палитра', 16);
  const theme = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Тема');
  const themeVars = theme ? theme.variableIds.map(id => VARS_BY_ID[id]).filter(Boolean) : [];
  for (const v of themeVars) {
    const c = varValue(v);
    const css = (v.codeSyntax && v.codeSyntax.WEB ? v.codeSyntax.WEB : '').replace('var(', '').replace(')', '');
    await swatch(dRow, v.name, css, vp(v.name), toHex(c) + (c.a < 1 ? ' · ' + Math.round(c.a * 100) + '%' : ''), false);
  }

  // Цвета — светлая тема (значения из style.css)
  const light = await docSection(doc, 'Цвета · светлая тема', 'Значения для светлой темы сайта (переключатель в шапке). Совпадают с блоком :root[data-theme="light"] в style.css.');
  const panel = frame('Светлая палитра', 'HORIZONTAL', { gap: 16, wrap: true, pad: 24, r: 18 });
  panel.fills = [solid('#f1f6f8')];
  add(light, panel, true);
  for (const d of LIGHT_PALETTE) {
    await swatch(panel, d[0], d[1], solid(d[2], d[3]), d[2] + (d[3] < 1 ? ' · ' + Math.round(d[3] * 100) + '%' : ''), true);
  }

  // Типографика
  const typo = await docSection(doc, 'Типографика', 'Шрифт Manrope (как на сайте), код — JetBrains Mono.');
  const tList = frame('Стили', 'VERTICAL', { gap: 0 });
  add(typo, tList, true);
  for (const name of TEXT_STYLE_ORDER) {
    const st = STY[name];
    if (!st) continue;
    const row = frame(name, 'HORIZONTAL', { gap: 24, align: 'CENTER', pad: [16, 0, 16, 0], stroke: 'border/default', sides: 'b' });
    add(tList, row, true);
    const meta = frame('Параметры', 'VERTICAL', { gap: 2, w: 280 });
    row.appendChild(meta);
    meta.appendChild(await text(name, 'Label/Small', 'text/primary', { font: 'Bold' }));
    const lh = st.lineHeight && st.lineHeight.unit === 'PERCENT' ? Math.round(st.lineHeight.value) + '%' : 'auto';
    meta.appendChild(await text(st.fontName.family + ' ' + st.fontName.style + ' · ' + st.fontSize + ' / ' + lh, 'Code/Default', 'text/muted', { size: 12 }));
    const sample = await text(name.indexOf('Code') === 0 ? 'files/ember-lanterns/ember-lanterns-1.2.0.jar' : 'Моды, которые ещё на проверке',
      name, 'text/primary', { w: 1100 });
    row.appendChild(sample);
  }

  // Тени
  const shadows = await docSection(doc, 'Тени', null);
  const sRow = docRow(shadows, 'Тени', 24);
  for (const name of ['Тень/Карточка', 'Тень/Кнопка', 'Тень/Окно']) {
    if (!FX[name]) continue;
    const card = frame(name, 'VERTICAL', { align: 'CENTER', justify: 'CENTER', fill: 'bg/surface', r: 18 });
    card.resize(260, 120);
    await card.setEffectStyleIdAsync(FX[name].id);
    card.appendChild(await text(name, 'Label/Default', 'text/primary'));
    sRow.appendChild(card);
  }

  // Компоненты
  const groups = [
    ['Кнопки', 'Primary — сплошной морской синий, Secondary — поверхность с рамкой.', ['Button', 'Icon Button']],
    ['Метки и статусы', 'Категории, платформы, статус проверки, счётчики, канал версии.', ['Chip', 'Badge', 'Count', 'Soon', 'Channel']],
    ['Навигация', 'Пункты шапки, вкладки проекта, переключатель разделов каталога.', ['Nav Link', 'Tab', 'Type Tab']],
    ['Поля', 'Поиск и выпадающие списки.', ['Search Field', 'Select']],
    ['Карточки', 'Иконка проекта и карточка в списке / сетке.', ['Project Icon', 'Project Card']],
    ['Плашки и строки', 'Статус проекта, файлы, зависимости, версии.', ['Banner', 'File Row', 'Dependency', 'Version Row']],
    ['Каркас страницы', 'Шапка и подвал, 1440px.', ['Site Header', 'Site Footer']]
  ];
  for (const g of groups) {
    const sec = await docSection(doc, g[0], g[1]);
    const r = docRow(sec, g[0], 32);
    for (const name of g[2]) put(r, name);
  }
  figma.viewport.scrollAndZoomIntoView([doc]);
  log('UI-кит оформлен', 'ok');
}

/* ======================== Шаг 4: логотип и иконки ======================== */

function monoMark(markInst, faceHex) {
  for (const n of markInst.children) {
    if ("fills" in n && Array.isArray(n.fills) && n.fills.length) n.fills = [solid(faceHex)];
  }
}

async function tile(parent, label, bgHex, build, labelColor) {
  const box = frame(label, 'VERTICAL', { gap: 10 });
  parent.appendChild(box);
  const t = frame('Плитка', 'HORIZONTAL', { align: 'CENTER', justify: 'CENTER', r: 18 });
  t.resize(250, 190);
  t.fills = [solid(bgHex)];
  t.strokes = [vp('border/default')];
  t.strokeAlign = 'INSIDE';
  box.appendChild(t);
  await build(t);
  box.appendChild(await text(label, 'Body/Small', labelColor || 'text/secondary'));
  return box;
}

async function stepLogo() {
  log('Оформляю логотип и иконки…');
  await figma.setCurrentPageAsync(PAGES.logo);
  restoreFromDoc(PAGES.logo, DOC_LOGO, LOGO_NODES);
  indexComponents();
  const iconsMaster = PAGES.logo.children.find(n => n.name === 'Иконки · 24px');

  const doc = frame(DOC_LOGO, 'VERTICAL', { gap: 64, pad: 64, fill: 'bg/base', w: 1240 });
  PAGES.logo.appendChild(doc);
  doc.x = 0; doc.y = 0;

  const top = frame('Обложка', 'VERTICAL', { gap: 12 });
  doc.appendChild(top);
  top.appendChild(await text('Логотип и иконки', 'Display/Hero', 'text/primary'));
  top.appendChild(await text('Знак ZoneLinks — сфера из закрученных волн и значок «плюс» снизу. Плоские морские цвета без градиентов; исходник — assets/img/logo.svg.',
    'Body/Large', 'text/secondary', { w: 900 }));

  const s1 = await docSection(doc, 'Знак', 'Цветной — основной. Монохромные — для печати, водяных знаков и мест, где цвет спорит с фоном.');
  const r1 = docRow(s1, 'Варианты знака', 20);
  await tile(r1, 'Цветной · тёмный фон', '#0a1016', async t => { const m = inst('Logo/Mark', null, t); fitSize(m, 110); });
  await tile(r1, 'Цветной · светлый фон', '#f1f6f8', async t => { const m = inst('Logo/Mark', null, t); fitSize(m, 110); });
  await tile(r1, 'Монохром · светлый', '#0a1016', async t => { const m = inst('Logo/Mark', null, t); fitSize(m, 110); monoMark(m, '#e9f2f7'); });
  await tile(r1, 'Монохром · тёмный', '#2fa8d8', async t => { const m = inst('Logo/Mark', null, t); fitSize(m, 110); monoMark(m, '#03141d'); });

  const s2 = await docSection(doc, 'Знак с названием', 'Название берётся из свойства «Название» — как name в config.js.');
  const r2 = docRow(s2, 'Логотип', 20);
  for (const d of [['На тёмном', '#0a1016', null], ['На светлом', '#f1f6f8', '#0e1b23']]) {
    const box = frame(d[0], 'VERTICAL', { gap: 10 });
    r2.appendChild(box);
    const t = frame('Плитка', 'HORIZONTAL', { align: 'CENTER', justify: 'CENTER', r: 18 });
    t.resize(520, 190);
    t.fills = [solid(d[1])];
    t.strokes = [vp('border/default')]; t.strokeAlign = 'INSIDE';
    box.appendChild(t);
    const w = inst('Logo/Wordmark', null, t);
    fitSize(w, w.width * 2);
    if (d[2]) for (const tx of w.findAllWithCriteria({ types: ['TEXT'] })) tx.fills = [solid(d[2])];
    box.appendChild(await text(d[0], 'Body/Small', 'text/secondary'));
  }

  const s3 = await docSection(doc, 'Размеры', 'Знак читается от 16px — этого хватает для иконки вкладки браузера.');
  const r3 = frame('Размеры знака', 'HORIZONTAL', { gap: 40, align: 'MAX', pad: 28, fill: 'bg/surface', stroke: 'border/default', r: 18 });
  add(s3, r3, true);
  for (const size of [16, 24, 32, 48, 64, 128]) {
    const c = frame(size + 'px', 'VERTICAL', { gap: 10, align: 'CENTER' });
    r3.appendChild(c);
    const m = inst('Logo/Mark', null, c);
    fitSize(m, size);
    c.appendChild(await text(size + 'px', 'Code/Default', 'text/muted', { size: 12 }));
  }

  const s4 = await docSection(doc, 'Иконки интерфейса', '24px, обводка 2px, скруглённые концы. Цвет меняется через обводку экземпляра.');
  const grid = docRow(s4, 'Иконки с подписями', 12);
  const iconComps = iconsMaster ? iconsMaster.children.filter(n => n.type === 'COMPONENT') : [];
  for (const ic of iconComps) {
    const cell = frame(ic.name, 'VERTICAL', { gap: 8, align: 'CENTER', pad: [16, 8, 12, 8], fill: 'bg/surface', stroke: 'border/default', r: 14, w: 128 });
    grid.appendChild(cell);
    const i = ic.createInstance();
    tint(i, 'text/primary');
    cell.appendChild(i);
    cell.appendChild(await text(ic.name.replace('icon/', ''), 'Code/Default', 'text/muted', { size: 11 }));
  }

  const s5 = await docSection(doc, 'Иконки проектов', 'Если у проекта нет своей иконки, сайт рисует плитку цвета по slug и две буквы названия.');
  const r5 = docRow(s5, 'Примеры', 20);
  for (const p of PROJECTS) {
    const box = frame(p.title, 'VERTICAL', { gap: 10, align: 'CENTER' });
    r5.appendChild(box);
    if (p.icon === 'lantern') box.appendChild(LANTERN.createInstance());
    else { const i = inst('Project Icon', null, box, { 'Буквы': p.letters }); i.fills = [solid(p.color)]; }
    box.appendChild(await text(p.title, 'Body/Small', 'text/secondary'));
  }

  const s6 = await docSection(doc, 'Мастер-компоненты', 'Оригиналы: правь здесь — изменения разойдутся по всем экземплярам.');
  const r6 = docRow(s6, 'Мастера', 32);
  for (const name of ['Logo/Mark', 'Logo/Wordmark', 'Project Icon/Ember Lanterns']) put(r6, name);
  if (iconsMaster) r6.appendChild(iconsMaster);

  figma.viewport.scrollAndZoomIntoView([doc]);
  log('Логотип и иконки оформлены', 'ok');
}
