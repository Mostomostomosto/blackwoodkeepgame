# ESPECIFICACIONES WEB — BLACKWOOD KEEP

**Documento de producto y diseño**  
**Versión:** 1.0 · **Fecha:** 4 de noviembre de 2026  
**Estado:** Especificación para implementación

## 1. Resumen

Sitio oficial de Blackwood Keep, juego point-and-click de terror gótico ambientado en Massachusetts en 1931. Presenta el juego sin revelar giros, establece su identidad visual y comunica el lanzamiento anunciado del Capítulo 1 gratuito para el 10 de noviembre de 2026. La fecha debe tratarse como un anuncio vigente y actualizarse si cambia. No inventar dominio, tienda ni perfiles sociales.

## 2. Propósito, audiencia y tono

La web debe explicar el juego con rapidez, llevar al visitante al tráiler oficial, comunicar la fecha y gratuidad del primer capítulo, mostrar materiales auténticos y servir como fuente oficial en inglés, español y francés. Está dirigida a personas interesadas en aventuras point-and-click, misterio, terror gótico, ficción histórica y juegos narrativos independientes.

La voz será evocadora, sobria, literaria y contenida. Sugerir misterio sin prometer mecánicas o contenidos no confirmados. Evitar spoilers, gore promocional, clichés y afirmaciones no verificadas.

## 3. Dirección visual gótico-académica

Concepto editorial de institución antigua, archivos privados, manuscritos, arquitectura severa y amenaza sugerida. Usar jerarquía clara, espacio negativo, filetes ornamentales, marcos finos y símbolos académicos con moderación.

| Uso | Color de referencia |
|---|---|
| Fondo principal | Carbón #11110F |
| Superficie secundaria | Pizarra #1B1A18 |
| Texto principal | Pergamino #E7DEC9 |
| Texto secundario | Gris cálido #AAA394 |
| Acento | Latón envejecido #B3975F |
| Acento oscuro | Borgoña #542C32 |

Titulares con serif editorial de carácter histórico; cuerpo y navegación con tipografía legible. Usar fuentes locales o proveedor con licencia y privacidad revisadas. El header.webp será la imagen principal del hero, con recorte adaptable y tratamiento oscuro para asegurar contraste. El logo generado debe comprobarse sobre fondo oscuro y revisar su transparencia. Capturas reales, sin puzles clave ni texto argumental legible. Evitar parallax intenso, destellos y animación constante.

## 4. Estructura de carpetas y recursos

El contexto confirma una carpeta web con header.webp y un logo generado en la conversación previa, recomendado para guardarse como assets/logo.png. No se pudo inspeccionar esa carpeta desde este entorno: comprobar archivos, rutas, formatos, dimensiones y licencias antes de implementar.

Estructura propuesta (no inventario confirmado):

    web/
    ├── index.html
    ├── styles.css
    ├── script.js
    ├── favicon.ico
    ├── assets/
    │   ├── header.webp
    │   ├── logo.png
    │   ├── screenshot-01.webp
    │   ├── screenshot-02.webp
    │   ├── screenshot-03.webp
    │   ├── archive-plan.webp
    │   └── trailer-poster.webp
    ├── locales/
    │   ├── en.json
    │   ├── es.json
    │   └── fr.json
    ├── robots.txt
    ├── sitemap.xml
    └── README.md

Si header.webp está directamente en web/, puede quedarse allí. Capturas, plano y poster son opcionales, pendientes de disponibilidad y aprobación. Optimizar imágenes a WebP/AVIF, aportar dimensiones para evitar saltos de diseño, usar alt descriptivo y comprobar el canal alfa del logo. No usar imágenes de ejemplo como si fueran capturas oficiales.

## 5. Secciones de página

### Cabecera y navegación
Logo enlazado al inicio; secciones El juego, Galería, Tráiler y Novedades; selector de idioma visible. En móvil, menú accesible por teclado que anuncie estado y cierre tras elegir destino. Si la cabecera es fija, compensar su altura en los destinos.

### Hero
Imagen header.webp, logo/título, frase, ubicación y año (Massachusetts, 1931). CTA primario “Ver tráiler”. CTA secundario comunica “Capítulo 1 gratuito · 10 de noviembre de 2026”. Antes de tener enlace oficial, no fingir que hay descarga disponible.

### Presentación del juego
Copy no spoiler propuesto:

> Una casa antigua. Un pasado que no permanece enterrado.  
> Blackwood Keep es una aventura point-and-click de terror gótico ambientada en Massachusetts en 1931. Explora, observa y sigue las pistas de una historia envuelta en secretos.

No atribuir personaje, objetivo, mecánicas o desenlace sin confirmación. Traducir con naturalidad.

### Galería
Entre tres y cinco capturas auténticas. Visor ampliable opcional, accesible, con cierre, Escape, foco contenido y retorno del foco. Sin audio automático. Pies de foto solo si están aprobados.

### Tráiler
Integrar el tráiler oficial de YouTube mediante miniatura y botón; cargar el iframe solo al solicitar reproducción para reducir peso y contacto inicial con terceros. URL/ID pendiente, no inventar. Proporcionar título accesible, controles, subtítulos publicados y enlace “Ver en YouTube” cuando se conozca la dirección.

### Lanzamiento y pie
Copy: “Capítulo 1 — gratuito. La primera entrega de Blackwood Keep se anunció para el 10 de noviembre de 2026.” Antes de su publicación, CTA al tráiler. Después, cambiar a descarga/tienda solo con URL oficial confirmada. En el pie, incluir derechos, privacidad, créditos y redes únicamente cuando los datos y contenidos sean reales.

## 6. Idiomas EN/ES/FR

Idiomas: inglés (en), español (es), francés (fr). Orden de selección inicial: preferencia explícita guardada, idioma preferido del navegador y, si no está disponible, inglés. Guardar selección manual en localStorage; no usar geolocalización. Actualizar html lang, título, descripción, metadatos sociales y etiquetas accesibles. Incluir hreflang equivalentes; asegurar que el cambio actualice toda la página. Mostrar nombres nativos: English, Español, Français. Revisar traducciones con edición humana.

| English | Español | Français |
|---|---|---|
| A Gothic Point-and-Click Horror Adventure | Una aventura point-and-click de terror gótico | Une aventure point-and-click d’horreur gothique |
| Massachusetts, 1931 | Massachusetts, 1931 | Massachusetts, 1931 |
| Watch the Trailer | Ver el tráiler | Voir la bande-annonce |
| Chapter One — Free · November 10, 2026 | Capítulo 1 gratuito · 10 de noviembre de 2026 | Chapitre 1 gratuit · 10 novembre 2026 |

## 7. Navegación e interacción

Navegación por anclas: #game, #gallery, #trailer, #updates. El contenido esencial debe estar presente en HTML y funcionar razonablemente sin JavaScript. Estados hover, focus-visible, active y disabled distinguibles. Enlaces externos identificables cuando abren otra pestaña. Respetar prefers-reduced-motion y no depender del movimiento para comunicar.

## 8. Responsive, rendimiento y accesibilidad

Diseño mobile-first, desde 320 px a pantallas grandes; evitar desbordamiento, texto diminuto y objetivos táctiles pequeños. Encuadre adaptable del hero y galería en una columna en móvil. Carga diferida para imágenes fuera del primer pantallazo, prioridad para hero, dimensiones explícitas y JavaScript pequeño.

Objetivo de accesibilidad: WCAG 2.2 AA. HTML semántico, enlace para saltar al contenido, encabezados ordenados, contraste suficiente, operación por teclado, foco visible y etiquetas accesibles. Alt descriptivo sin repetir pies de foto; alt vacío para decoración. Subtítulos/transcripción cuando el vídeo incluya información esencial. Comprobar zoom 200%, reflow, lector de pantalla y movimiento reducido. Anunciar cambios de idioma y estado de componentes.

## 9. SEO

Título y meta descripción únicos por idioma; metadatos Open Graph y tarjeta social con imagen aprobada. URL canónica, sitemap y robots solo al confirmar dominio/rutas. Contenido rastreable sin depender de JavaScript. Datos estructurados de videojuego únicamente con campos verificados; no inventar estudio, plataforma, precio o fecha de plataformas. Favicon coherente.

## 10. Analítica y privacidad

Recomendada y opcional: analítica ligera, agregada y sin cookies de seguimiento; solicitar consentimiento cuando corresponda a la jurisdicción. Eventos útiles: visita, clic/reproducción del tráiler, cambio de idioma y clic en descarga oficial cuando exista. No recopilar datos sensibles ni añadir píxeles publicitarios por defecto. Publicar política de privacidad real si se activan herramientas que la requieran. El iframe de YouTube implica terceros, por lo que debe cargarse al interactuar.

## 11. Requisitos técnicos

Sitio estático para GitHub Pages, HTML/CSS/JavaScript estándar y sin backend obligatorio. Rutas relativas compatibles con publicación bajo la ruta de un repositorio (Project Pages). Dependencias externas mínimas, con versión fijada. Contenido por idioma en JSON u objeto de traducción mantenible. No incluir secretos ni credenciales. README con instrucciones locales, edición de copy, incorporación de imágenes y publicación. HTTPS.

## 12. Despliegue con GitHub Pages

1. Mantener la fuente en el repositorio aprobado.
2. Elegir publicación desde rama/carpeta acordada o GitHub Actions.
3. Comprobar las rutas bajo la URL de Project Pages.
4. Activar HTTPS.
5. Configurar dominio personalizado y CNAME solo tras recibir el dominio confirmado.
6. Revisar versión publicada en móvil/escritorio, idiomas, enlaces, metadatos y recursos.
7. Documentar cómo revertir una publicación defectuosa.

## 13. Prioridades

**P0 — primera publicación:** página única en tres idiomas; detección y preferencia persistente; hero con header.webp; copy aprobado; fecha y gratuidad; tráiler solo con URL oficial; adaptación móvil, teclado, contraste, metadatos y GitHub Pages; verificar recursos y derechos.

**P1 — presentación:** galería real y visor accesible; carga diferida de YouTube; subtítulos; favicon y Open Graph; analítica mínima respetuosa con privacidad; revisión lingüística y rendimiento.

**P2 — ampliaciones:** archivo de novedades, más materiales aprobados, créditos u otros idiomas si el contenido lo justifica.

## 14. Criterios de aceptación

- Se entienden género, ambientación, propósito y tono sin spoilers.
- La gratuidad y fecha del capítulo aparecen como anuncio y se pueden actualizar.
- No hay dominio, redes, descarga, plataforma o contacto inventados.
- header.webp carga; logo legible y transparencia comprobada.
- Contenido y metadatos completos en EN/ES/FR; preferencia guardada precede al navegador y el fallback es inglés.
- Selector accesible y persistente.
- Tráiler oficial con controles, subtítulos disponibles y sin autoplay.
- Sin enlaces rotos, recursos faltantes ni desplazamiento horizontal móvil.
- Teclado, foco, contraste, títulos, alt y movimiento reducido comprobados.
- Sitio funciona bajo ruta final de GitHub Pages con HTTPS.
- Analítica y terceros cumplen la política publicada.
- Revisiones visuales móvil/escritorio y sustitución de todos los textos provisionales.

## 15. Datos pendientes

- Dominio y dirección pública del repositorio/sitio.
- URL e ID del tráiler, además de subtítulos.
- Titular de derechos, estudio y créditos confirmados.
- URL oficial de descarga/tienda cuando exista.
- Redes sociales oficiales, si se mostrarán.
- Inventario real de web/, ubicación exacta del logo y dimensiones de header.webp.
- Capturas aprobadas y guía de marca o traducciones existentes.
