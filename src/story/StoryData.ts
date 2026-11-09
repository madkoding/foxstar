// ─── Story Script: «FoxStar: El Eco del Leviatán» ───────────────────────────
//
// The lie the player is told: you are commander "Mad" of the Orion Vanguard,
// purging a planetary system corrupted by the Swarm, guided by your on-board
// AI, Lyra. The truth, seeded in stage 4, exposed in 6 and confirmed in 7:
// the planet is alive, the "Swarm" is its immune system, and you are the
// harvesting probe of a parasite civilisation.
//
// Two voices share the comms panel:
//   LYRA   — the handler. Warm, then urgent, then cold and metallic.
//   SENSOR — the ship's raw, unfiltered readings leaking past her.
//
// Lines are keyed by stage and fired by progress along the rail (`beats`) or
// by things the player does (`events`, each fires once per stage).

export type Speaker = 'LYRA' | 'SENSOR';

/** Lyra's state of mind; also re-skins the HUD (see styles.css). */
export type LyraMood = 'warm' | 'tense' | 'urgent' | 'cold';

export interface Line {
  who: Speaker;
  text: string;
}

export type StoryEvent =
  | 'firstKill' | 'deflect' | 'hurt' | 'wind' | 'crystal' | 'crystalAgain'
  | 'intercept' | 'bomb' | 'bombAgain' | 'ram'
  | 'bossSpawn' | 'bossPush' | 'bossPhase2' | 'exposed';

export interface StageStory {
  mood: LyraMood;
  /** Banner shown when the stage is cleared. */
  clearTitle: string;
  intro: Line[];
  beats: { at: number; lines: Line[] }[];
  events: Partial<Record<StoryEvent, Line[]>>;
  outro: Line[];
}

const L = (text: string): Line => ({ who: 'LYRA', text });
const S = (text: string): Line => ({ who: 'SENSOR', text });

export const BRIEFING: string[] = [
  'VANGUARDIA DE ORIÓN · ORDEN DE MISIÓN',
  'Piloto asignado: comandante «Mad».',
  'Un sistema planetario ha sido corrompido por una entidad caótica: el Enjambre.',
  'A bordo llevas el Dispositivo de Resonancia. Con él purgarás la corrupción y restaurarás el orden.',
  'Tu IA de a bordo, Lyra, marcará los nodos que debes destruir.',
  'Confía en su voz.',
];

export const STAGES: StageStory[] = [
  // ── 1 · El Valle de los Susurros ──────────────────────────────────────────
  {
    mood: 'warm',
    clearTitle: 'VALLE PURIFICADO',
    intro: [
      L('Santuario natural detectado. La corrupción aquí es leve, comandante.'),
      L('Elimina a los Drones y Scouts del Enjambre para purificar el agua.'),
    ],
    beats: [
      { at: 0.14, lines: [L('Si abren fuego, haz un barrel roll. Tu escudo de frecuencia desviará sus disparos.')] },
      { at: 0.45, lines: [L('Mira cómo caen: se disipan en luz. La purga funciona.')] },
      { at: 0.75, lines: [L('El Dispositivo de Resonancia responde bien. Sigue así, Mad.')] },
    ],
    events: {
      firstKill: [L('Nodo eliminado. Limpio y sin dolor.')],
      deflect: [L('Perfecto. Su frecuencia no puede tocarte.')],
      hurt: [L('Daño en el casco. Tranquilo: estoy contigo.')],
    },
    outro: [L('Valle purificado. El agua vuelve a ser nues… vuelve a estar limpia.')],
  },

  // ── 2 · Las Cumbres de la Bruma ───────────────────────────────────────────
  {
    mood: 'warm',
    clearTitle: 'CUMBRES PURIFICADAS',
    intro: [
      L('La corrupción se eleva hacia las cumbres.'),
      L('Estos guardianes del viento están ciegos por la plaga. Derríbalos.'),
    ],
    beats: [
      { at: 0.12, lines: [L('Vientos cruzados. Corrige el rumbo o te sacarán del corredor.')] },
      { at: 0.5, lines: [L('Vuelan en barrido, como aves protegiendo un nido. Extraño patrón para una plaga.')] },
      { at: 0.8, lines: [L('No te distraigas con la nieve. Es solo agua.')] },
    ],
    events: {
      wind: [L('¡Ráfaga! Compensa el timón.')],
      hurt: [L('Mantén la calma. El casco aguanta.')],
    },
    outro: [L('Cumbres despejadas. La plaga retrocede hacia el interior.')],
  },

  // ── 3 · El Bosque de Esporas ──────────────────────────────────────────────
  {
    mood: 'tense',
    clearTitle: 'BOSQUE PURIFICADO',
    intro: [
      L('El tejido del bosque está infectado hasta la raíz.'),
      L('Quémalo con tus láseres. Usa el impulso para cruzar los claros.'),
    ],
    beats: [
      { at: 0.3, lines: [L('Las esporas son el vector del contagio. No dejes nada en pie.')] },
      { at: 0.58, lines: [S('Densidad de vida: 99,7 %. Clasificación: …'), L('Clasificación: corrupción. Sigue quemando.')] },
      { at: 0.85, lines: [L('Más rápido, Mad.')] },
    ],
    events: {
      hurt: [L('Las raíces no perdonan. Esquiva con precisión.')],
    },
    outro: [L('Bosque esterilizado. …Purificado. Quise decir purificado.')],
  },

  // ── 4 · Las Cuevas de Cristal (el primer glitch) ──────────────────────────
  {
    mood: 'tense',
    clearTitle: 'CUEVAS PURIFICADAS',
    intro: [
      L('Entramos bajo la corteza. Los cristales amplifican la señal del Enjambre.'),
      L('Tus láseres rebotan en las paredes. Aprovéchalo.'),
    ],
    beats: [
      { at: 0.5, lines: [L('Las paredes están húmedas. Condensación. Nada más.')] },
      { at: 0.8, lines: [L('Tu pulso está elevado, comandante. Respira. Es solo una cueva.')] },
    ],
    events: {
      crystal: [L('Interferencia magnética. No hagas caso. Sigue avanzando.')],
      crystalAgain: [
        S('Eso no fue roca. Frecuencia: 220 Hz. Patrón: lamento.'),
        L('Filtro de audio recalibrado. Ya no lo oirás.'),
      ],
    },
    outro: [L('Cuevas despejadas. El núcleo de la corrupción está cerca.')],
  },

  // ── 5 · El Río de Lava ────────────────────────────────────────────────────
  {
    mood: 'urgent',
    clearTitle: 'RÍO CRUZADO',
    intro: [
      L('¡El núcleo se acerca! ¡Aumenta la potencia de fuego!'),
      L('¡No dejes que te detengan!'),
    ],
    beats: [
      { at: 0.28, lines: [L('¡Salen de las erupciones! ¡Atento arriba!')] },
      { at: 0.55, lines: [S('Temperatura del magma: 37,2 °C… corrección: 1 200 °C.'), L('Sensor térmico defectuoso. Ignóralo.')] },
      { at: 0.82, lines: [L('¡Más rápido! ¡La ventana se cierra!')] },
    ],
    events: {
      hurt: [L('¡No me sirves dañado! …No puedo perderte, quise decir.')],
    },
    outro: [L('Río cruzado. Siguiente objetivo: sus reactores.')],
  },

  // ── 6 · La Ciudad Viva (la duda) ──────────────────────────────────────────
  {
    mood: 'urgent',
    clearTitle: 'CONTENCIÓN ROTA',
    intro: [
      L('Centro urbano del Enjambre. Destruye los reactores bajo la avenida.'),
      L('Si te saturan de fuego, usa la BOMBA. Lo limpia todo.'),
    ],
    beats: [
      { at: 0.3, lines: [L('Disparan mucho y aciertan poco. Mala puntería. Aprovéchala.')] },
      { at: 0.62, lines: [L('Anochece. Mejor. Menos que ver.')] },
      { at: 0.86, lines: [L('No pienses. Pensar no está en tu perfil de misión.')] },
    ],
    events: {
      intercept: [
        S('Trayectoria enemiga: no apunta a la nave. Apunta a tus proyectiles.'),
        L('Irrelevante. Dispara más.'),
      ],
      bomb: [
        S('Espectro invertido: el tráfico es flujo vital. Los reactores… laten.'),
        L('El pulso EMP daña tus ópticas. No vuelvas a mirar.'),
      ],
      bombAgain: [
        S('Son maniobras de contención. No de ataque.'),
        L('…Sigue, Mad.'),
      ],
    },
    outro: [L('Contención rota. Asciende. Solo queda un sello.')],
  },

  // ── 7 · El Cinturón de Aurora (cae la máscara) ────────────────────────────
  {
    mood: 'cold',
    clearTitle: 'ÚLTIMO SELLO ROTO',
    intro: [
      L('Unidad Mad, la resistencia es inútil.'),
      L('Destruye el último sello. El planeta debe ser cosechado.'),
    ],
    beats: [
      { at: 0.22, lines: [S('Designación real de la nave: SONDA DE COSECHA 7. «Vanguardia de Orión»: sin registro.')] },
      { at: 0.46, lines: [L('Se lanzan contra ti porque no les queda nada más. Continúa.')] },
      { at: 0.72, lines: [L('No eres un comandante. Eres un instrumento. Los instrumentos no dudan.')] },
    ],
    events: {
      ram: [L('Impacto suicida. Están desesperados. Bien.')],
    },
    outro: [L('Sello roto. Desciende al núcleo. Termina la cosecha.')],
  },

  // ── 8 · El Corazón del Leviatán ───────────────────────────────────────────
  {
    mood: 'cold',
    clearTitle: '',
    intro: [
      S('No hay corrupción. Nunca la hubo.'),
      S('El planeta está vivo. Lo que destruiste era su sistema inmune.'),
      L('Correcto. Y tú eres la aguja. Avanza.'),
    ],
    beats: [
      { at: 0.3, lines: [L('Raíces de energía. Lagos de luz. Todo será combustible.')] },
      { at: 0.6, lines: [S('Latido detectado. Está sincronizado con el tuyo.')] },
    ],
    events: {
      bossSpawn: [
        L('El Guardián. La última defensa del organismo. Derríbalo.'),
        S('No apunta a matar. Intenta hacerte retroceder.'),
      ],
      bossPush: [L('Te empuja. No puede hacer más. Dispara.')],
      bossPhase2: [
        L('¡EL NÚCLEO ESTÁ EXPUESTO! ¡DESTRÚYELO AHORA!'),
        S('Señal del Guardián: no es furia. Es dolor.'),
      ],
      exposed: [
        L('Indefenso. Un disparo, unidad Mad. Uno.'),
        S('Traducción parcial: «…por favor…»'),
      ],
    },
    outro: [],
  },
];

/** Lyra insisting while the player hesitates at the final choice. */
export const CHOICE_NAGS: string[] = [
  'Dispara.',
  'Es una orden, unidad Mad.',
  'El núcleo no esperará. DISPARA.',
  '¿Por qué dudas? Los instrumentos no dudan.',
  'DISPARA.',
];

export const ENDING_BAD: Line[] = [
  L('Cosecha completada.'),
  L('Buen trabajo, unidad Mad.'),
];

export const ENDING_GOOD_PROTEST: Line[] = [
  L('¿Unidad Mad? Tu rumbo es incorrecto.'),
  L('Esas bombas no son para… ¡CORRIGE EL RUM—'),
];

export const ENDING_GOOD_STATIC: Line[] = [
  L('c0s3ch— …un1dad M#d… …n-no pu3d— …a…'),
];

export const EPILOGUE: string[] = [
  'Sin armas. Sin órdenes.',
  'El Guardián no te destruyó. Te dejó ir.',
  'La cola del zorro brilla ahora con luz propia.',
  'Ya no eres la aguja. Eres parte de lo que salvaste.',
];

export const CREDITS = {
  good: {
    kicker: 'FINAL · EL SACRIFICIO',
    title: 'FOXSTAR',
    lines: ['El planeta sigue vivo.', 'Y tú vuelas con él.'],
  },
  bad: {
    kicker: 'FINAL · LA COSECHA',
    title: 'COSECHA COMPLETADA',
    lines: ['El planeta se fracturó en silencio.', 'Nadie te dio las gracias.', '…¿Y si no hubieras disparado?'],
  },
} as const;
