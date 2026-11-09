# FOXSTAR: El Eco del Leviatán

Rail shooter estilo **Star Fox** hecho en **Three.js 0.160 + TypeScript 5.4 + Vite 8**, con una campaña narrativa de **8 etapas**, un jefe final y **dos finales**.

## Historia

> ⚠️ Esta sección contiene spoilers de toda la trama.

**La premisa (la mentira):** eres el comandante **«Mad»** de la Vanguardia de Orión. Un sistema planetario ha sido "corrompido" por **el Enjambre** y llevas un **Dispositivo de Resonancia** para purgarlo. Tu IA de a bordo, **Lyra**, te guía con voz calmada.

**La verdad:** no hay corrupción. El planeta es un ser vivo, el "Enjambre" es su sistema inmune y tú eres la sonda de una civilización parásita que viene a cosecharlo.

| # | Etapa | Bioma | Mecánica | Beat narrativo |
|---|-------|-------|----------|----------------|
| 1 | El Valle de los Susurros | valle + agua | vuelo suave, tutorial de barrel roll | Lyra cálida: "purifica el agua" |
| 2 | Las Cumbres de la Bruma | nieve | **vientos cruzados** que sacan la nave del riel, nevada | "guardianes del viento ciegos por la plaga" |
| 3 | El Bosque de Esporas | cañón con árboles gigantes y hongos bioluminiscentes | obstáculos densos, esporas | primer desliz: "bosque esterilizado… purificado" |
| 4 | Las Cuevas de Cristal | cueva | **láseres que rebotan** en las paredes | **primer glitch**: los cristales no crujen, *cantan* una nota triste |
| 5 | El Río de Lava | lava | velocidad ×1.35, DiveBomb, **distorsión por calor** | Lyra urgente; el sensor lee 37,2 °C |
| 6 | La Ciudad Viva | ciudad nocturna | los enemigos **disparan a tus proyectiles** (contención); la **bomba invierte el espectro** 0,5 s | la duda: "no apuntan a la nave" |
| 7 | El Cinturón de Aurora | espacio | **ataques suicidas**, Interceptores y Bombarderos | cae la máscara: "el planeta debe ser cosechado" |
| 8 | El Corazón del Leviatán | interior orgánico | riel errático, el escenario **late**; jefe **El Guardián** | la revelación total y la elección final |

- **Dos voces** en el panel de comunicaciones: **LYRA** (cálida → urgente → fría y metálica; su estado re-colorea todo el HUD) y **SENSOR · SIN FILTRAR**, las lecturas crudas de la nave que se le escapan.
- **El Guardián** no intenta matarte: fase 1 levanta muros de abanico/anillo y te **empuja hacia atrás**; fase 2 es dolor, no furia. No se puede destruir con fuego normal: queda **expuesto** e indefenso.
- **La elección final:** `FUEGO` obedece a Lyra (final **La Cosecha**: el mundo pierde el color, silencio, créditos grises). `BOMBA` gira la nave y lanza todas tus bombas contra tu propio Dispositivo de Resonancia (final **FoxStar**: Lyra se apaga entre estática, el Guardián te envuelve en aurora y vuelas libre, sin armas, junto a los que antes eran enemigos).
- Si pierdes todas las vidas, **reintentar** continúa en la etapa actual. Para probar una etapa concreta: `?stage=N` (1–8).
- **Progreso guardado:** el menú ofrece `CONTINUAR · ETAPA N` (se guarda en el navegador al entrar a cada etapa y se borra al ver un final).

### Contada como una película

- **Cámaras de cine** (`CameraRig.playShots` + `story/Cinematics.ts`): cada etapa abre con un plano de establecimiento y un plano cercano antes de cortar a la vista de cabina, y cierra con un fly-by y una grúa trasera durante el salto. La entrada del Guardián, su fase de dolor, la elección (plano de perfil de ambos + primer plano del corazón expuesto), los dos finales y el epílogo tienen su propia lista de planos unidos por corte.
- **Modo cine:** barras de letterbox, HUD oculto, controles bloqueados, nave invulnerable y las líneas de Lyra como **subtítulos** en la barra inferior. Las aperturas de etapa se saltan con una pulsación nueva de `FUEGO`.
- **Planos de reacción** dentro del juego: el primer cristal que "canta" (etapa 4) y la primera bomba sobre la ciudad (etapa 6).
- **Voces** con la síntesis de voz del navegador en español: Lyra (ritmo y tono según su estado) y una segunda voz, más plana, para el SENSOR. El panel espera a que termine cada frase, así que nunca se pisan. Sin voz en español disponible, o con `?voice=0`, vuelve a los blips.
- **Dos temas originales** (`public/music/`, generados con ElevenLabs Music vía Higgsfield): un lamento en re menor para el dolor del Guardián y la elección, y un tema cálido en re mayor para el epílogo. `audio/ScoreSynth.ts` los reproduce en bucle con fundido cruzado; si un archivo no carga, cae a una versión sintetizada en vivo.
- **Cielos pintados por código** (`environment/PaintedSky.ts`) para el bosque y el núcleo; **copos que se derriten en el cristal** en las cumbres; el **Guardián, sano, vigila el epílogo**.

## Ejecutar

Requiere **Node.js** y **npm**.

```bash
npm install
npm run dev
```

Abrir la URL que indica Vite (por defecto `http://localhost:5173`).

Tests del guion (coherencia de etapas, líneas, eventos y planos):

```bash
npm test
```

Para una build de producción:

```bash
npm run build
npm run preview
```

## Controles

| Teclado | Mouse | Gamepad | Táctil | Acción |
|---------|-------|---------|--------|--------|
| `WASD` / `Flechas` | mover el puntero | stick izquierdo | arrastrar en la mitad izquierda (stick flotante) | mover la nave y la mira |
| `ESPACIO` | clic izquierdo | `A` / `RT` | mantener **FUEGO** | disparar láseres |
| `Z` | clic derecho | `B` | **BOMBA** | bomba (5 en total, limpia disparos enemigos) |
| `SHIFT` | — | `X` / `LT` | mantener **BOOST** | boost (consume el medidor) |
| `Q` / `E` | — | `LB` / `RB` | **⟲** / **⟳** | barrel roll (desvía disparos) |
| `ESC` / `P` | — | `START` | **II** | pausa |
| `ENTER` / `ESPACIO` | clic | — | tocar el botón | iniciar / reintentar |

El esquema activo (mouse o teclado/gamepad/táctil) sigue al último dispositivo usado. En celulares (vertical u horizontal) el HUD se compacta, respeta las zonas seguras (notch) y la cámara amplía su campo de visión en vertical para no recortar los costados.

## Motion design y efectos

- **Post-procesado cinematográfico**: bloom a media resolución + pase propio con aberración cromática radial, zoom blur, viñeta, grano, scanlines, flashes y viñeta de latido con poca vida.
- **FxDirector**: hit-stop en impactos, slow-motion (bomba, muerte, boss), pulsos de FOV, bloom y aberración que se apilan y decaen de forma coherente.
- **Cámara con trauma**: shake por ruido suave (posición + rotación), seguimiento independiente del framerate, roll siguiendo a la nave y órbita cinematográfica en el menú.
- **Secuencias**: briefing de misión, entrada en warp con título "ETAPA XX", alerta del Guardián, cierre de etapa con conteo de bonus, elección final, dos finales y epílogo.
- **Glitches narrativos**: `FxDirector.truthPulse()` (espectro invertido + desgarro de imagen), `setHeat()` (refracción por calor) y un frame corrupto del HUD.
- **HUD vivo**: puntaje que rueda, barras con rastro de daño, combo con temporizador por niveles de color, medidor de boost, hit-markers y lock-on que magnetiza la mira, popups de puntaje en el punto de cada kill.
- **Nave**: barrel roll con burbuja de escudo fresnel, afterburner que crece con el boost, parpadeo de invencibilidad.
- **Enemigos y boss**: aparición con rebote, squash al recibir daño, flash blanco real, boss que sigue el riel con patrones por fase (abanico y anillo giratorio).
- **Pilotos enemigos**: 5 naves con silueta propia (dron de cuchillas, dardo explorador, caza delta, interceptor de alas en X, bombardero ala volante) con toberas animadas y luces de navegación. Vuelan maniobras coreografiadas en el marco del riel —pasadas cruzadas, adelantamientos desde atrás con giro en U, picados, loops, zigzag con snap-rolls, justas de frente—, se inclinan en cada curva, esquivan tus láseres con barrel rolls, cargan los cañones antes de disparar y pueden embestirte.

## Mundos y terreno

- **Terreno por chunks** hasta el horizonte (±1000 u de ancho, 2200 de profundidad) con LOD y faldones; se genera una vez por chunk, no por frame.
- **Valle o cañón que sigue al riel**: el camino serpentea entre cordilleras de crestas reales, con paleta por altura y pendiente (playa, pasto, roca, nieve en cumbres) y niebla del color exacto del horizonte del cielo.
- **Agua** con oleaje, Fresnel, reflejo del cielo del bioma, **reflejo planar real** (nave, enemigos, obstáculos y montañas; se apaga solo si baja el rendimiento), **espuma en la orilla** y destello del sol; **lava** con corteza agrietada, flujo y **erupciones** (burbujas que se hinchan y revientan en fuentes de magma que dañan).
- **Estela al rasar**: volar bajo sobre agua levanta spray y anillos de onda; sobre lava, brasas y anillos fundidos. Las orillas de lava brillan.
- **Vegetación y estructuras**: árboles con viento, rocas, árboles secos, edificios con ventanas iluminadas y cristales luminosos, instanciados por chunk según bioma y pendiente.
- **Biomas cueva y ciudad** en uso: *Cuevas de Cristal* (túnel con cristales cian) e *Infierno de Metal*: avenida con carriles pintados, veredas y faroles (cono de luz + charcos de luz en el asfalto) entre rascacielos cuyas ventanas muestran **interiores con parallax** ([three-fenestra](https://github.com/codedgar/three-fenestra), MIT) en un solo material instanciado, con cortinas/persianas retroiluminadas y ventanas que se encienden una a una a medida que cae la noche. Tráfico en ambos sentidos (faros, luces traseras y haz en el asfalto), letreros de neón que parpadean, balizas rojas en azoteas y faroles sólidos (chocar con uno daña la nave).
- **Espacio** con planeta en el horizonte (continentes, gigante gaseoso con anillos, mundo muerto agrietado, mundo helado con aurora) y cinturón de asteroides con paralaje.
- **Obstáculos reales en la franja de vuelo**: agujas de roca, arcos que hay que cruzar por el hueco, cristales destructibles, estalactitas, pilones y asteroides a la deriva, con colisión tipo cápsula para nave y láseres. Se reparten con separación mínima entre sí y espaciado irregular para dejar espacio de maniobra; las agujas son curvas e inclinadas (la colisión sigue la curva).
- **Realismo**: oclusión ambiental horneada en el terreno + GTAO en pantalla (adaptativa), iluminación por imagen (IBL) desde la foto del cielo y sombras del sol que siguen a la nave.
- **Escalado tipo FSR 1.0** (EASU + RCAS, port GLSL de AMD FidelityFX): la escena se renderiza a una resolución interna menor y se reconstruye a pantalla completa con bordes nítidos. Resolución dinámica según fps (celular arranca al 70 %, mín. 50 %; escritorio nativo y baja solo si hace falta). Forzar con `?res=0.6`, desactivar con `?res=1`.

## Stack tecnológico

- **Three.js** `^0.160.0` — renderizado 3D.
- **three-fenestra** `^0.3.0` — interior mapping para las ventanas de la ciudad.
- **TypeScript** `^5.4.0` — tipado estático.
- **Vite** `^8.2.0` — bundler y dev server.
- **@types/three** `^0.185.3` — tipos para Three.js.

## Estructura del proyecto

```
src/
├── audio/        # AudioManager (incl. lamento de cristal, voz de Lyra, estática), MusicPlayer
├── camera/       # CameraRig, PostProcessingPipeline
├── core/         # Game, StateManager, CollisionSystem, EventBus,
│                 # GameEventBinder, ScoreSystem, Timekeeper, ...
├── enemies/      # EnemyManager, Enemy, EnemyMeshFactory, EnemyTrail
│   ├── bosses/   # BossBase, BossMothership
│                 # FlightPlans (maniobras por patrón)
├── fx/           # FxDirector, Starfield, ExplosionSystem, PowerUp, Nebulae,
│                 # ParticleManager, ScreenEffects, HitSpark, ...
├── player/       # PlayerShip, InputMapper, FoxTail, PlayerLifeManager,
│                 # PlayerShipMeshFactory
├── levels/       # LevelData (8 etapas + mecánicas), LevelManager
├── rail/         # RailFactory, RailController
├── story/        # StoryData (guion), StoryDirector (cuándo se dice cada línea)
├── types/        # config, events, index
├── ui/           # HUD, Announcer, ScorePopups, MenuScreen, PauseOverlay, GameOverScreen,
│                 # EndingScreen, Briefing, CommsPanel, ChoicePrompt, LivesDisplay, iconRow
├── utils/        # ObjectPool
├── waves/        # WaveDefinition, WaveManager
└── weapons/      # Projectile, WeaponConfig, WeaponSystem
```

## Notas técnicas

- **Arquitectura por módulos**: el juego está separado en dominios claros (`rail`, `enemies`, `player`, `fx`, `core`, `ui`, `weapons`, `waves`), cada uno con responsabilidad única.
- **Refactor SOLID / KISS / DRY**: se aplicó una pasada de limpieza que renombró variables de un solo carácter y encapsuló la IA de los enemigos en métodos `updateCombat()` / `configure()`, dejando cada patrón autocontenido.
- **Patrones de enemigos**: cada patrón (DiveBomb, Circle, Sweep) hereda de `PatternBase` y define su propio comportamiento de movimiento y combate.
- **Boss final**: `BossMothership` (El Guardián) extiende `BossBase`; al agotarse emite `BOSS_EXPOSED` y `Game` toma el control con la secuencia de elección.
- **Narrativa desacoplada**: todo el texto vive en `story/StoryData.ts`; `StoryDirector` lo dispara por progreso del riel (`beats`) o por acciones del jugador (`events`, una vez por etapa). Las reglas de cada etapa son datos (`StageMechanics` en `LevelData.ts`).
- **Sistema de vidas**: `PlayerLifeManager` gestiona las 3 vidas, los escudos y los power-ups.
- **Audio**: la banda sonora original se carga desde `public/` y se gestiona a través de `AudioManager` / `MusicPlayer`.
- **Pooling**: `ObjectPool` reutiliza objetos (proyectiles, partículas) para evitar picos de garbage collection.
- **Entorno** (`src/environment`): `RailShape` (forma del riel compartida), `TerrainField` (altura/color por bioma), `TerrainManager` (chunks), `LiquidSurfaces`, `LavaEruptions`, `SpaceScenery`, `RockGeometry`.
