#!/bin/bash

# Начало спрайта
cat > sprite.svg << 'SPRITE_START'
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <defs>
SPRITE_START

# Обрабатываем каждый SVG файл
for svg_file in *.svg; do
  # Пропускаем sprite.svg если он уже существует
  if [[ "$svg_file" == "sprite.svg" ]]; then
    continue
  fi
  
  # Получаем имя файла без расширения для id
  id_name=$(basename "$svg_file" .svg)
  
  # Извлекаем viewBox из исходного файла
  viewbox=$(grep -o 'viewBox="[^"]*"' "$svg_file" | head -1)
  if [[ -z "$viewbox" ]]; then
    viewbox='viewBox="0 0 256 256"'
  fi
  
  echo "    <!-- $id_name icon -->" >> sprite.svg
  echo "    <symbol id=\"$id_name\" $viewbox>" >> sprite.svg
  
  # Извлекаем содержимое между тегами svg (убираем внешние теги svg)
  sed -n '/<svg[^>]*>/,/<\/svg>/p' "$svg_file" | \
    sed '1d;$d' | \
    sed 's/^/      /' >> sprite.svg
  
  echo "    </symbol>" >> sprite.svg
  echo "" >> sprite.svg
done

# Конец спрайта
cat >> sprite.svg << 'SPRITE_END'
  </defs>
</svg>
SPRITE_END

echo "Спрайт создан! Файлы обработаны:"
ls *.svg | grep -v sprite
