// Файл для фикса модуля angular2-text-mask.
// Сборщик кидает на него варнинг, который не влияет на работу проекта
module.exports = {
  packages: {
    'angular2-text-mask': {
      ignorableDeepImportMatchers: [
        /text-mask-core\//,
      ]
    },
  },
};
