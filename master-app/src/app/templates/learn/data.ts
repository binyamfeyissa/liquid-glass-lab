/**
 * The Glasshouse catalogue. Static fixtures only — enrolments, lesson
 * progress and quiz results live in the store (state.tsx); everything
 * descriptive about a course lives here, in the same shape as the web
 * Academy template: course → sections → lessons.
 */

export type Level = "Beginner" | "Intermediate" | "Advanced";
export type LessonType = "video" | "reading" | "exercise";

export interface Instructor {
  name: string;
  role: string;
  bio: string;
  courses: number;
  students: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Minutes. Also the simulated playback length, sped up in the player. */
  duration: number;
  type: LessonType;
  /** 2–3 paragraphs of lesson notes shown under the player. */
  notes: string[];
}

export interface Section {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  category: string;
  level: Level;
  instructor: Instructor;
  rating: number;
  reviews: string;
  /** One hex colour for the composed cover plate, muted toward the
      mode neutral at render time. */
  cover: string;
  sections: Section[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Index into options. */
  answer: number;
  explanation: string;
}

export const CATEGORIES = [
  "All",
  "Design",
  "Development",
  "Data",
  "Business",
  "Photography",
] as const;

const MAYA: Instructor = {
  name: "Maya Lindgren",
  role: "Interface designer · ex-IDEO",
  bio: "Maya has spent twelve years designing translucent, layered interfaces for fintech and media products, and teaches the material-first process she uses in client work.",
  courses: 4,
  students: "18.2k",
};

const JONAS: Instructor = {
  name: "Jonas Weber",
  role: "React Native lead",
  bio: "Jonas leads mobile engineering at a Berlin health-tech scale-up and has shipped eleven production React Native apps, three of them featured by the stores.",
  courses: 3,
  students: "11.6k",
};

const PRIYA: Instructor = {
  name: "Priya Nair",
  role: "TypeScript consultant",
  bio: "Priya helps platform teams turn loose JavaScript codebases into typed, refactor-safe systems. She maintains two widely used open-source type utilities.",
  courses: 2,
  students: "9.4k",
};

const THEO: Instructor = {
  name: "Theo Marchetti",
  role: "Data storyteller",
  bio: "Theo turns raw event data into decisions for product teams. His visualisation work has appeared in three annual industry reports.",
  courses: 3,
  students: "7.8k",
};

const SARA: Instructor = {
  name: "Sara Okafor",
  role: "Product strategist",
  bio: "Sara has launched fourteen subscription products and now coaches founders on pricing, positioning and the first ninety days after launch.",
  courses: 2,
  students: "6.1k",
};

const LEO: Instructor = {
  name: "Leo Tanaka",
  role: "Photographer & colourist",
  bio: "Leo shoots editorial and travel work on three continents. His grading presets are used by over forty thousand photographers.",
  courses: 2,
  students: "13.9k",
};

export const COURSES: Course[] = [
  {
    id: "liquid-glass",
    title: "Liquid Glass Interface Design",
    tagline: "Design interfaces that feel like real material — depth, blur and light.",
    category: "Design",
    level: "Beginner",
    instructor: MAYA,
    rating: 4.9,
    reviews: "2,314",
    cover: "#2563eb",
    sections: [
      {
        title: "Foundations of glass",
        lessons: [
          {
            id: "lg-1-1",
            title: "Why glass works: depth cues the eye trusts",
            duration: 6,
            type: "video",
            notes: [
              "The human visual system reads depth from a handful of reliable cues: occlusion, shadow, blur and specular highlights. A glass surface borrows all four. Content scrolling beneath a blurred panel tells the eye, instantly and without conscious effort, that the panel floats above the content — no drop shadow required.",
              "That is why glass feels premium when it is done well and cheap when it is not. The moment one cue disagrees with the others — a blur that does not match the scroll speed, a highlight on the wrong edge — the illusion collapses and the surface reads as a grey rectangle.",
              "In this lesson we break down the four cues one at a time, using real product screenshots, and build the checklist you will apply to every glass surface for the rest of the course.",
            ],
          },
          {
            id: "lg-1-2",
            title: "The material stack: blur, tint, border, shadow",
            duration: 8,
            type: "video",
            notes: [
              "Every glass surface is a stack of four layers, in a fixed order. At the bottom, a backdrop blur softens whatever scrolls beneath. Above it, a translucent tint sets the surface's temperature and guarantees a minimum contrast floor. Then a one-pixel border — lighter at the top, where light would catch — separates the surface from its neighbours.",
              "The shadow comes last and is the layer most designers overdo. Real glass casts almost no shadow of its own; the depth comes from the blur. Keep shadows tight, dark and short, or remove them entirely and let the stack do the work.",
              "We assemble the stack live in this lesson, toggling each layer so you can see exactly what each one contributes — and what breaks when you skip the tint.",
            ],
          },
          {
            id: "lg-1-3",
            title: "Reading: a short history of translucent UI",
            duration: 5,
            type: "reading",
            notes: [
              "Translucency in interfaces is older than the smartphone. Operating systems experimented with frosted window chrome in the early 2000s, mostly as decoration, and mostly abandoned it because the hardware of the day could not blur in real time.",
              "The turning point came when mobile GPUs made per-pixel blur cheap. Suddenly translucency could be functional: a navigation bar that tints itself with the colour of the content beneath it communicates scroll position and hierarchy at once.",
              "Today's liquid glass pushes further — surfaces that refract rather than merely blur, bending light at their edges. The history matters because each generation kept the same lesson: translucency earns its place only when it carries information.",
            ],
          },
        ],
      },
      {
        title: "Hierarchy and legibility",
        lessons: [
          {
            id: "lg-2-1",
            title: "Surface profiles: chrome, content and modal",
            duration: 7,
            type: "video",
            notes: [
              "Not every surface should have the same strength of glass. Chrome — tab bars, toolbars, navigation — sits permanently above scrolling content and needs the strongest blur and the most opaque tint, because text must stay readable over anything.",
              "Content cards can afford a lighter touch: they scroll with the page, so their backdrop is comparatively stable, and a subtler blur keeps them feeling airy. Modals are the exception in the other direction — they must command attention, so they pair strong glass with a dimmed scrim behind them.",
              "We define three named profiles and show how a consistent profile system stops a design from drifting into a dozen one-off glass recipes.",
            ],
          },
          {
            id: "lg-2-2",
            title: "Contrast budgets over photography",
            duration: 9,
            type: "video",
            notes: [
              "Glass over photography is where legibility goes to die. A bright sky behind a translucent white card can drop your text contrast below any acceptable threshold, and the failure only appears with certain photos — usually after you have shipped.",
              "The fix is a contrast budget: decide the minimum ratio your text needs, then work backwards to the tint opacity that guarantees it over the worst plausible backdrop. A slightly stronger tint, or a subtle darkening gradient at the card's edge, buys you certainty.",
              "In this lesson we measure real examples, compute the budget for a headline and a caption, and set up a test backdrop — the busiest photo you can find — that every surface must survive before it ships.",
            ],
          },
          {
            id: "lg-2-3",
            title: "Exercise: fix a failing glass dashboard",
            duration: 12,
            type: "exercise",
            notes: [
              "Time to apply the stack. You are given a dashboard with five deliberate faults: a missing tint layer, an oversized shadow, chrome and content profiles swapped, a contrast failure over photography, and a border lit from the wrong edge.",
              "Work through the dashboard surface by surface. For each fault, name the layer responsible before you change anything — the diagnosis is the skill, the fix is arithmetic.",
              "When you are done, compare against the reference solution and check your surfaces against the busiest-backdrop test from the previous lesson.",
            ],
          },
        ],
      },
      {
        title: "Motion and shipping",
        lessons: [
          {
            id: "lg-3-1",
            title: "Springs, not easings: motion that feels like material",
            duration: 8,
            type: "video",
            notes: [
              "Glass is a physical metaphor, so its motion must obey physical intuition. A panel that slides in with a spring — slight overshoot, natural settle — reads as an object with mass. The same panel on a cubic easing curve reads as a graphic.",
              "Springs have a second advantage: they are interruptible. When a user grabs a sheet mid-animation, a spring can retarget smoothly from its current velocity; an easing curve restarts and stutters.",
              "We tune stiffness and damping for the three motions you will use constantly — sheets, tab transitions and card presses — and set the rule of thumb: if it would look wrong for a sheet of real glass, it is wrong on screen.",
            ],
          },
          {
            id: "lg-3-2",
            title: "Reduced transparency and reduced motion",
            duration: 6,
            type: "video",
            notes: [
              "Every operating system offers reduced-transparency and reduced-motion settings, and a meaningful share of your users has one of them on. Under reduced transparency, glass must degrade to a solid, opaque surface with the same layout — not disappear, not turn into an unreadable smear.",
              "Design the fallback as a first-class surface: same geometry, same hierarchy, solid fill sampled from your tint. Under reduced motion, springs collapse to short fades and slides become cuts.",
              "We walk the checklist for auditing a glass design against both settings, including the contrast re-check that reduced transparency makes necessary.",
            ],
          },
          {
            id: "lg-3-3",
            title: "Capstone: a full glass dashboard, start to finish",
            duration: 15,
            type: "exercise",
            notes: [
              "The capstone assembles everything: you will design a complete analytics dashboard — chrome, content cards, a modal flow — using the material stack, the three surface profiles and the contrast budget from this course.",
              "Start with the busiest backdrop you intend to support and design against it from the first surface, not as a final check. Keep a written profile for every surface you create; if a surface needs a fourth profile, that is a design smell worth interrogating.",
              "Finish by running the accessibility audit from the previous lesson. A dashboard that survives reduced transparency, reduced motion and the busy-photo test is ready to ship.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "react-native-craft",
    title: "React Native Craft",
    tagline: "Architecture, performance and shipping — the habits behind apps that last.",
    category: "Development",
    level: "Intermediate",
    instructor: JONAS,
    rating: 4.8,
    reviews: "1,872",
    cover: "#0ea5e9",
    sections: [
      {
        title: "Architecture that lasts",
        lessons: [
          {
            id: "rn-1-1",
            title: "Project layout: features, not folders of types",
            duration: 7,
            type: "video",
            notes: [
              "The default layout of a growing React Native app — a components folder, a screens folder, a utils folder — organises code by what it is rather than what it does. By fifty screens, every change touches six folders and nobody can say what a feature owns.",
              "Feature folders invert this: everything a feature needs — screens, components, hooks, fixtures — lives together, and shared code is only promoted to a common folder when a second feature genuinely needs it.",
              "We restructure a messy sample app live, and set the deletion test: a feature folder should be removable in one commit without breaking the rest of the app.",
            ],
          },
          {
            id: "rn-1-2",
            title: "Navigation patterns with expo-router",
            duration: 9,
            type: "video",
            notes: [
              "File-based routing makes the navigation graph visible in the folder tree, which is its greatest strength. The patterns that scale are few: a tab group for the app's main areas, stack screens pushed above the tabs for detail and flows, and modals for anything the user can abandon.",
              "Deep links are the contract that keeps this honest. Every screen reachable by push notification or shared link needs a stable route and graceful handling of missing parameters.",
              "In this lesson we build the navigation skeleton of a three-tab app with a checkout flow, and wire its deep links end to end.",
            ],
          },
          {
            id: "rn-1-3",
            title: "State: server cache vs client state",
            duration: 8,
            type: "video",
            notes: [
              "Most state bugs in React Native apps come from treating two different things as one. Server state — data the backend owns — wants a cache with staleness rules. Client state — what the user is doing right now — wants a small, local store.",
              "Mixing them produces the classics: screens that refetch on every focus, forms that fight with background refreshes, and optimistic updates that roll back for no reason.",
              "We draw the line precisely, assign every piece of state in a sample app to one side, and show how much code disappears when the boundary is respected.",
            ],
          },
        ],
      },
      {
        title: "Performance and polish",
        lessons: [
          {
            id: "rn-2-1",
            title: "FlatList deep dive: the 60fps checklist",
            duration: 11,
            type: "video",
            notes: [
              "A janky list is rarely a mystery. The checklist is short: stable keys, memoised row components, no inline closures creating new props per render, images sized to their display box, and getItemLayout wherever row heights are fixed.",
              "What matters is the order — measure first with the profiler, fix the largest cost, measure again. Most lists need only two of the five fixes; guessing which two wastes the afternoon.",
              "We profile a deliberately broken feed, rank its costs, and fix it step by step until the frame budget holds on a mid-range Android device.",
            ],
          },
          {
            id: "rn-2-2",
            title: "Gestures and haptics with Reanimated",
            duration: 10,
            type: "video",
            notes: [
              "The difference between an app that feels native and one that feels like a website is usually gesture latency. Worklet-driven gestures run on the UI thread, so a drag tracks the finger at the display's refresh rate with no bridge round-trip.",
              "Haptics are the second half of the illusion: a light selection tick when a drag crosses a snap point sells the physicality that the eye alone cannot.",
              "We build a draggable bottom sheet with snap points and haptic feedback, and cover the accessibility obligation that comes with it — every gesture needs a button equivalent.",
            ],
          },
          {
            id: "rn-2-3",
            title: "Exercise: profile and fix a janky screen",
            duration: 14,
            type: "exercise",
            notes: [
              "You are given a product screen with three planted performance faults: an unmemoised list row, a state update on every scroll frame, and oversized images. Your job is to find them with the profiler — not by reading the code.",
              "Rank the faults by frame cost before fixing any of them, and write down your measurements. The habit of measuring before and after is the actual lesson; the fixes themselves are small.",
              "Compare your final numbers with the reference device profile in the solution notes.",
            ],
          },
        ],
      },
      {
        title: "Shipping",
        lessons: [
          {
            id: "rn-3-1",
            title: "Builds, OTA updates and the review gauntlet",
            duration: 9,
            type: "video",
            notes: [
              "Shipping a React Native app means managing three artefacts at once: the store binary, the over-the-air JavaScript bundle, and the backend contract both speak to. The discipline is versioning — an OTA update must never assume a native capability the installed binary lacks.",
              "App review adds its own rules: demo accounts, privacy labels that match actual behaviour, and no placeholder content in screenshots.",
              "We assemble a release checklist that covers build channels, OTA targeting and review preparation, so release day becomes a procedure instead of an event.",
            ],
          },
          {
            id: "rn-3-2",
            title: "Capstone: release the expense app",
            duration: 16,
            type: "exercise",
            notes: [
              "For the capstone you take the expense app built across this course from a development build to a store-ready release: production build configuration, OTA channels, icons and splash, privacy labels, and a demo account for reviewers.",
              "Work the release checklist from the previous lesson in order, and note every place the sample app fails it — those notes are the real deliverable, because your own app will fail in its own places.",
              "Finish with a staged rollout plan: which percentage of users gets the release on day one, and what metric would make you halt it.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "typescript-deep-dive",
    title: "TypeScript Deep Dive",
    tagline: "Types as a design tool — model state so illegal states cannot compile.",
    category: "Development",
    level: "Advanced",
    instructor: PRIYA,
    rating: 4.9,
    reviews: "1,204",
    cover: "#3b82f6",
    sections: [
      {
        title: "Types as design",
        lessons: [
          {
            id: "ts-1-1",
            title: "Discriminated unions for real state machines",
            duration: 9,
            type: "video",
            notes: [
              "Most UI state is a machine in disguise: a request is idle, loading, succeeded or failed — never two at once. A discriminated union makes that explicit, and the compiler then guarantees you handle every state and can never read data that does not exist yet.",
              "The pattern is mechanical: one object type per state, a shared literal tag, and a switch the compiler can check for exhaustiveness. The payoff is that whole categories of defensive code simply delete themselves.",
              "We refactor a fetch hook from boolean flags to a union and count the bugs that become compile errors.",
            ],
          },
          {
            id: "ts-1-2",
            title: "Branded types for ids, money and units",
            duration: 7,
            type: "video",
            notes: [
              "A UserId and an OrderId are both strings to the runtime, but swapping them is a bug the compiler could have caught. A branded type adds a phantom tag that exists only at compile time, making the two incompatible where it matters.",
              "The same trick separates dollars from cents, seconds from milliseconds, and sanitised HTML from raw user input — the unit confusions behind a surprising number of production incidents.",
              "We build a small branding helper, apply it to a checkout flow, and discuss the honest cost: a cast at the system boundary, where the brand is earned.",
            ],
          },
          {
            id: "ts-1-3",
            title: "Exercise: type a checkout flow end to end",
            duration: 13,
            type: "exercise",
            notes: [
              "The checkout flow you are given compiles — and contains three type-level holes: an optional that should be a union, an id that can be swapped, and an amount whose unit is ambiguous.",
              "Fix the types, not the runtime code. Where a fix forces a runtime change, that is the type system showing you a real design flaw; note it rather than casting around it.",
              "The exercise is complete when the three planted runtime bugs each fail to compile.",
            ],
          },
        ],
      },
      {
        title: "Advanced generics",
        lessons: [
          {
            id: "ts-2-1",
            title: "Inference: letting the compiler do the work",
            duration: 8,
            type: "video",
            notes: [
              "Good generic code is written once and inferred everywhere. The skill is knowing where to place type parameters so callers never have to write them: on the arguments the caller already has, never on configuration they must spell out.",
              "We study three library functions — a typed event emitter, a route builder and a form state helper — and identify the exact inference site that makes each one feel effortless.",
              "The anti-pattern to unlearn: annotating what the compiler already knows, which adds noise and quietly stops being true as the code evolves.",
            ],
          },
          {
            id: "ts-2-2",
            title: "Conditional and mapped types, honestly assessed",
            duration: 10,
            type: "video",
            notes: [
              "Conditional and mapped types can express astonishing transformations — and produce error messages nobody can read. This lesson is deliberately two-sided: we build genuinely useful transformations, then set the limit beyond which a runtime function is the better tool.",
              "The test is the reader. A type that takes a colleague ten minutes to decode has spent the time it saved, with interest, every time it is read.",
              "We finish with a decision rule you can apply in review: if the type cannot be explained in one sentence, simplify it or wrap it behind a named alias with a comment.",
            ],
          },
          {
            id: "ts-2-3",
            title: "Capstone: refactor a loose API layer",
            duration: 15,
            type: "exercise",
            notes: [
              "The capstone hands you an API layer typed mostly with any and stringly-typed responses. Refactor it into a typed client: branded ids, union-typed responses, and inference at every call site.",
              "Work endpoint by endpoint, keeping the test suite green throughout. The suite is your proof that the refactor changed types only, not behaviour.",
              "Finish by writing the one-paragraph guide your team would need to extend the client — the capstone's real test of whether the types explain themselves.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "data-storytelling",
    title: "Data Storytelling & Visualisation",
    tagline: "Turn event data into charts that make decisions happen.",
    category: "Data",
    level: "Intermediate",
    instructor: THEO,
    rating: 4.7,
    reviews: "986",
    cover: "#f59e0b",
    sections: [
      {
        title: "Finding the story",
        lessons: [
          {
            id: "ds-1-1",
            title: "From metrics to narrative: the decision first",
            duration: 8,
            type: "video",
            notes: [
              "A chart that does not change a decision is decoration. Start every visualisation by writing the decision it serves — renew or cancel, hire or wait, ship or iterate — and the story becomes a matter of finding the two or three numbers that bear on it.",
              "This inversion is uncomfortable for analysts trained to explore first. Exploration still happens; it just happens in private, and only the findings that survive contact with the decision get presented.",
              "We take a real churn dataset and draft three candidate narratives, then kill two of them with the decision test.",
            ],
          },
          {
            id: "ds-1-2",
            title: "Choosing the honest chart",
            duration: 7,
            type: "video",
            notes: [
              "Every chart type makes some comparisons easy and others nearly impossible. Bars compare lengths honestly; lines show change; scatterplots reveal relationships; pies mostly reveal that a pie was chosen.",
              "Honesty also lives in the axes. A truncated axis is not always a lie — but it is always a choice, and the reader deserves it to be a deliberate one, labelled where it could mislead.",
              "We run the same dataset through five chart types and grade each on the comparison the decision actually needs.",
            ],
          },
        ],
      },
      {
        title: "Building the visual",
        lessons: [
          {
            id: "ds-2-1",
            title: "Annotation: the layer that does the persuading",
            duration: 9,
            type: "video",
            notes: [
              "The data shows; the annotation tells. A single sentence placed at the point of interest — the dip, the spike, the crossover — does more persuasive work than any amount of axis polish.",
              "Good annotation follows a rule of scarcity: one headline claim, at most two supporting callouts, and everything else quiet. Readers trust a chart that argues one point well far more than one that argues five points loudly.",
              "We annotate a retention chart three ways — minimal, maximal and dishonest — and study how the same data earns three different levels of trust.",
            ],
          },
          {
            id: "ds-2-2",
            title: "Exercise: rebuild a misleading dashboard chart",
            duration: 12,
            type: "exercise",
            notes: [
              "The chart you are given is technically accurate and practically deceptive: a truncated axis, a cherry-picked window and a dual axis implying a relationship that is not there.",
              "Rebuild it honestly without losing its one true finding. You may change the chart type, the window and the annotation — but the headline claim must survive your rebuild, or you must say plainly that it does not.",
              "That last clause is the professional skill: telling a stakeholder their favourite chart does not hold up.",
            ],
          },
          {
            id: "ds-2-3",
            title: "Capstone: a one-page data story",
            duration: 14,
            type: "exercise",
            notes: [
              "The capstone is a single page: one decision, one headline chart, two supporting visuals, and annotations that carry the argument. Everything you have practised, at the size stakeholders actually read.",
              "Draft the decision sentence first and tape it above your desk, metaphorically. Every element that does not serve it gets cut, however beautiful.",
              "Finish with the sixty-second spoken version of the page. If you cannot say it in a minute, the page does not yet know what it thinks.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sql-foundations",
    title: "SQL Foundations for Builders",
    tagline: "Query with confidence — joins, windows and the queries products run on.",
    category: "Data",
    level: "Beginner",
    instructor: THEO,
    rating: 4.8,
    reviews: "1,530",
    cover: "#10b981",
    sections: [
      {
        title: "Reading data",
        lessons: [
          {
            id: "sql-1-1",
            title: "SELECT, WHERE and the shape of a table",
            duration: 6,
            type: "video",
            notes: [
              "A table is a set of rows that share a shape, and a query is a description of the rows you want — not a set of instructions for finding them. That declarative mindset is the whole foundation: you say what, the database decides how.",
              "SELECT chooses columns, WHERE filters rows, and the order of the result is never guaranteed until you ask for it with ORDER BY. Most beginner surprises are one of those three facts being quietly violated.",
              "We query a small shop database together and build the habit of predicting the result before running the query.",
            ],
          },
          {
            id: "sql-1-2",
            title: "Joins without fear",
            duration: 9,
            type: "video",
            notes: [
              "A join is a matching exercise: rows from two tables are paired where a key agrees. INNER JOIN keeps only matches; LEFT JOIN keeps every row from the left table and fills the gaps with NULL — and that one difference answers most real questions.",
              "The fear around joins usually comes from row multiplication: join on a non-unique key and your counts silently explode. Checking the grain of each table before joining is the professional habit that prevents it.",
              "We join customers to orders to payments, verifying the row count at each step like a pilot checking instruments.",
            ],
          },
          {
            id: "sql-1-3",
            title: "GROUP BY and the aggregate mindset",
            duration: 8,
            type: "video",
            notes: [
              "Aggregation collapses many rows into one number per group — revenue per month, orders per customer, errors per release. GROUP BY is where SQL stops being a lookup tool and becomes an analysis tool.",
              "The discipline is in the SELECT list: every column must be either grouped or aggregated. Databases that let you cheat produce answers that are quietly arbitrary.",
              "We build a monthly revenue report and then break it on purpose, so you can recognise a grain mistake when a dashboard shows you one.",
            ],
          },
        ],
      },
      {
        title: "Writing real queries",
        lessons: [
          {
            id: "sql-2-1",
            title: "Window functions: ranking and running totals",
            duration: 10,
            type: "video",
            notes: [
              "Window functions answer questions GROUP BY cannot: rank customers within each region, compute a running total, compare a row to the one before it — all without collapsing the rows away.",
              "The mental model is a frame moving over an ordered partition of the result. Once that picture clicks, ROW_NUMBER, RANK and LAG stop being incantations and become obvious.",
              "We write a top-three-products-per-category query — the canonical window-function problem — and a running-total revenue query.",
            ],
          },
          {
            id: "sql-2-2",
            title: "Exercise: the weekly product report",
            duration: 13,
            type: "exercise",
            notes: [
              "Your task is the report every product team asks for weekly: new signups, active users, revenue, and the top five features by usage — one query set, four answers.",
              "Each answer needs a different technique from this course: a filter, a join, an aggregation and a window function. Choose deliberately and note which is which.",
              "The report is done when a teammate could re-run it next week by changing only the date range.",
            ],
          },
          {
            id: "sql-2-3",
            title: "Capstone: audit a schema for the questions it cannot answer",
            duration: 12,
            type: "exercise",
            notes: [
              "The capstone reverses the direction: given a schema, find the business questions it cannot answer — the missing column, the overwritten timestamp, the status stored as free text.",
              "This audit skill is what separates builders who query data from builders who design it. Every unanswerable question you find is a migration that will never have to happen in a panic.",
              "Deliver the audit as a short list: the question, why the schema blocks it, and the smallest change that unblocks it.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "product-launch",
    title: "Launch Your First Product",
    tagline: "Pricing, positioning and the first ninety days, from a coach who has done it.",
    category: "Business",
    level: "Beginner",
    instructor: SARA,
    rating: 4.8,
    reviews: "764",
    cover: "#ec4899",
    sections: [
      {
        title: "Before you build",
        lessons: [
          {
            id: "pl-1-1",
            title: "Positioning: the customer, the problem, the alternative",
            duration: 7,
            type: "video",
            notes: [
              "Positioning is a sentence with three slots: for this customer, with this problem, we are the alternative to that. The third slot is the one founders skip — and it is the one that does the work, because customers never evaluate you in a vacuum.",
              "If the honest alternative is a spreadsheet and a weekly meeting, your competitor is not the other startup; it is inertia with good tooling. Price and pitch against the real alternative and both get easier.",
              "We draft positioning sentences for three sample products and stress-test each against its true alternative.",
            ],
          },
          {
            id: "pl-1-2",
            title: "Pricing from value, not from cost",
            duration: 9,
            type: "video",
            notes: [
              "Cost-plus pricing leaves money on the table in both directions: too cheap for the customers who would pay for the outcome, too dear for the ones buying a chore off their list. Value pricing starts from what the result is worth and works backwards.",
              "The practical method is a ladder: a free tier that proves the core value, a main tier priced at a clear fraction of the value delivered, and a top tier that exists partly to make the main tier look reasonable.",
              "We price a sample product three ways and watch how the same features become three different businesses.",
            ],
          },
        ],
      },
      {
        title: "The first ninety days",
        lessons: [
          {
            id: "pl-2-1",
            title: "Launch week: channels, sequence and the ask",
            duration: 8,
            type: "video",
            notes: [
              "A launch is a sequence, not a day. Warm the smallest audience first — the people who already trust you — and let their feedback fix the embarrassing problems before the big channels see the product.",
              "Every channel needs one clear ask, sized to the audience: a reply, a signup, a share. Launches fail quietly when the ask is 'check it out' — there is no verb in it a person can complete.",
              "We build a five-day launch sequence for a sample product, with the ask written out for each day.",
            ],
          },
          {
            id: "pl-2-2",
            title: "Reading the first cohort: signal vs noise",
            duration: 8,
            type: "video",
            notes: [
              "Your first hundred users are not a sample; they are a story. The skill is knowing which numbers are signal at that size — activation and week-two retention — and which are noise dressed as data, like average session length.",
              "Talk to the churned users first. The ones who stayed will tell you what you built; the ones who left will tell you what you actually built.",
              "We review a first-cohort dashboard and sort its metrics into act, watch and ignore — the triage you will repeat every week for ninety days.",
            ],
          },
          {
            id: "pl-2-3",
            title: "Capstone: your ninety-day plan",
            duration: 11,
            type: "exercise",
            notes: [
              "The capstone is a plan you could start Monday: positioning sentence, pricing ladder, launch sequence, and the two metrics you will triage weekly — all on one page.",
              "Bring a real product if you have one; the sample product is provided if you do not. Either way, the plan must name its alternative honestly and price against it.",
              "Finish by writing the sentence you will say when the first cohort disappoints you — because some week it will, and the plan should survive that week.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "photo-grading",
    title: "Photo Editing & Colour Grading",
    tagline: "A repeatable grading workflow — from flat RAW files to a signature look.",
    category: "Photography",
    level: "Intermediate",
    instructor: LEO,
    rating: 4.9,
    reviews: "2,041",
    cover: "#f97316",
    sections: [
      {
        title: "The workflow",
        lessons: [
          {
            id: "pg-1-1",
            title: "Reading a histogram like a weather report",
            duration: 6,
            type: "video",
            notes: [
              "The histogram is the only honest witness on your camera. Highlights piled against the right edge are clipped and gone; shadows crushed against the left are mud. Everything between is negotiable in the edit.",
              "Learn to read it as exposure zones rather than a shape to perfect: a night street scene should lean left, a beach portrait right. The correct histogram is the one that matches the scene you stood in.",
              "We read six histograms against their scenes and predict the edit each one needs before touching a slider.",
            ],
          },
          {
            id: "pg-1-2",
            title: "The correction pass: exposure, white balance, contrast",
            duration: 9,
            type: "video",
            notes: [
              "Grading before correcting is painting a house before fixing the roof. The correction pass is deliberately boring: set exposure so the subject sits where the scene says it should, neutralise white balance, then rebuild contrast with the tone curve.",
              "Order matters because each step changes what the next one sees. White balance after contrast will fight you; contrast before exposure chases a moving target.",
              "We correct three flawed files end to end, and build the checklist you will run — in order — on every shoot from now on.",
            ],
          },
          {
            id: "pg-1-3",
            title: "Building a look: colour wheels and split toning",
            duration: 10,
            type: "video",
            notes: [
              "A look is a small set of colour decisions applied consistently: where the shadows lean, where the highlights lean, and which hues get saturated or muted. Split toning — cool shadows, warm highlights — is the classic because it mimics how film and memory both render a scene.",
              "The craft is restraint. A look that announces itself in every photo becomes a filter; a look you sense rather than see becomes a signature.",
              "We build two looks from the same file — editorial cool and travel warm — and save both as reusable starting points rather than finished answers.",
            ],
          },
        ],
      },
      {
        title: "Signature and output",
        lessons: [
          {
            id: "pg-2-1",
            title: "Consistency across a shoot",
            duration: 7,
            type: "video",
            notes: [
              "A portfolio is judged by its weakest transition: two photos from the same shoot that look graded by different people break the story. The fix is a sync discipline — grade the hardest frame first, then sync its settings and adjust only exposure per frame.",
              "Lighting changes across a shoot are real and should stay visible; grading changes are accidents and should not. Learning to tell those apart is most of consistency.",
              "We grade a twelve-frame shoot together and flag the three frames where sync alone is not enough.",
            ],
          },
          {
            id: "pg-2-2",
            title: "Exercise: grade a set to a brief",
            duration: 13,
            type: "exercise",
            notes: [
              "You are given six RAW files and a magazine brief: bright, warm, optimistic, skin tones protected. Grade the set to the brief, not to your taste — the professional skill is serving a brief you did not write.",
              "Run the correction pass first, in order, on every frame. Then apply your look, then the consistency sync from the previous lesson.",
              "The exercise is graded on the transitions between frames as much as on any single image.",
            ],
          },
          {
            id: "pg-2-3",
            title: "Capstone: your signature preset pack",
            duration: 12,
            type: "exercise",
            notes: [
              "The capstone packages your look as a small preset pack: three variants — a standard, a low-light and a high-key version of the same signature — each documented with the scenes it suits and the ones it ruins.",
              "Documenting what a preset ruins is the mark of an honest pack; every look has scenes that defeat it, and your users deserve to know before the shoot, not after.",
              "Test the pack on twenty frames you did not grade while building it. A signature that only works on its own examples is not a signature yet.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ux-research",
    title: "UX Research Essentials",
    tagline: "Interview, observe and synthesise — evidence for design decisions.",
    category: "Design",
    level: "Intermediate",
    instructor: MAYA,
    rating: 4.7,
    reviews: "893",
    cover: "#8b5cf6",
    sections: [
      {
        title: "Talking to users",
        lessons: [
          {
            id: "ux-1-1",
            title: "Interview questions that do not lead the witness",
            duration: 7,
            type: "video",
            notes: [
              "A leading question manufactures the answer it wants: 'Would you use a faster checkout?' has never once been answered no. Research questions ask about the past instead — 'Tell me about the last time you abandoned a checkout' — because behaviour that happened is evidence, and opinions about the future are fiction.",
              "The second discipline is silence. The three seconds after a participant finishes are where the real answer usually lives; filling them is the most common interview error there is.",
              "We rewrite five leading questions into evidence-seeking ones and practise holding the silence.",
            ],
          },
          {
            id: "ux-1-2",
            title: "Recruiting: five participants, the right five",
            duration: 6,
            type: "video",
            notes: [
              "Five participants find most usability problems — but only if they are the right five. Recruiting is a screening exercise: define the behaviour you need to observe, then find people who did it recently, not people who match a demographic sketch.",
              "The screener is the deliverable of this lesson: three questions that separate your actual users from the merely willing, including the disqualifier you will be tempted to skip.",
              "We also cover incentives honestly — pay fairly, pay promptly, and never make payment depend on finishing.",
            ],
          },
          {
            id: "ux-1-3",
            title: "Watching sessions: notes that survive synthesis",
            duration: 8,
            type: "video",
            notes: [
              "Session notes fail in one of two ways: they record interpretations ('user was confused') instead of observations ('user re-read the label three times, then opened help'), or they are so raw that nobody can use them a week later.",
              "The format that survives is two columns: what happened, timestamped, and — kept strictly separate — what you think it means. Synthesis later depends on being able to re-derive meaning from the observations.",
              "We take notes on a recorded session together and compare observation columns; the spread between them is the lesson.",
            ],
          },
        ],
      },
      {
        title: "Making it count",
        lessons: [
          {
            id: "ux-2-1",
            title: "Synthesis: from sticky notes to findings",
            duration: 9,
            type: "video",
            notes: [
              "Synthesis is where research becomes decisions. The method is affinity mapping with discipline: observations cluster into themes, themes must earn the title of finding by pointing at a decision someone will make differently.",
              "A finding is phrased as a claim with evidence and a consequence: 'New users cannot tell whether saving worked — four of five hesitated or re-saved — so confirmation feedback needs redesign before launch.'",
              "We synthesise the notes from the previous lessons into three findings and one honest non-finding — something interesting that changes nothing, which you must learn to let go.",
            ],
          },
          {
            id: "ux-2-2",
            title: "Capstone: a research plan for a real decision",
            duration: 12,
            type: "exercise",
            notes: [
              "The capstone starts from a decision your team genuinely faces — a redesign, a pricing change, a feature cut — and produces the full research plan: questions, screener, session guide and synthesis date.",
              "Every element must trace back to the decision. A question that cannot change the decision, however interesting, is cut — that ruthlessness is what gets research plans approved.",
              "Close the plan with the sentence stakeholders will hear at the end: the finding format from this course, left blank, waiting for evidence.",
            ],
          },
        ],
      },
    ],
  },
];

/** Flat lesson list for a course, in curriculum order. */
export function courseLessons(course: Course): Lesson[] {
  return course.sections.flatMap((s) => s.lessons);
}

export function courseMinutes(course: Course): number {
  return courseLessons(course).reduce((sum, l) => sum + l.duration, 0);
}

export function findCourse(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

export function findLesson(
  courseId: string,
  lessonId: string,
): { course: Course; lesson: Lesson; index: number } | undefined {
  const course = findCourse(courseId);
  if (!course) return undefined;
  const lessons = courseLessons(course);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) return undefined;
  return { course, lesson: lessons[index], index };
}

/* ------------------------------------------------------------------ */
/*  The quiz — attached to Liquid Glass Interface Design.              */
/* ------------------------------------------------------------------ */

export const QUIZ_COURSE_ID = "liquid-glass";
export const QUIZ_PASS_PERCENT = 80;

export const QUIZ: QuizQuestion[] = [
  {
    question: "Which depth cue does a backdrop blur primarily provide?",
    options: [
      "It tells the eye the surface floats above the content beneath it",
      "It makes text heavier and easier to read",
      "It hides the content so users focus on the panel's shadow",
      "It reduces the rendering cost of the screen",
    ],
    answer: 0,
    explanation:
      "Blur is an occlusion cue: content softening as it passes beneath a panel tells the visual system the panel sits on a nearer plane — no conscious effort required.",
  },
  {
    question: "What is the correct order of the glass material stack, bottom to top?",
    options: [
      "Shadow, border, tint, blur",
      "Blur, tint, border, shadow",
      "Tint, blur, shadow, border",
      "Border, shadow, blur, tint",
    ],
    answer: 1,
    explanation:
      "Backdrop blur first, then the translucent tint that guarantees a contrast floor, then the one-pixel border lit from the top, and the shadow last — the layer to use most sparingly.",
  },
  {
    question: "Why do chrome surfaces (tab bars, toolbars) need a stronger glass profile than content cards?",
    options: [
      "Chrome is drawn by the operating system, not the app",
      "Chrome is wider than content cards",
      "Chrome sits permanently over arbitrary scrolling content, so text must stay readable over anything",
      "Content cards are not allowed to use blur",
    ],
    answer: 2,
    explanation:
      "Chrome never moves with the page, so any content can pass beneath it. Its blur and tint must survive the worst backdrop, while content cards scroll with a comparatively stable background.",
  },
  {
    question: "What is a contrast budget?",
    options: [
      "The number of colours allowed in a design system",
      "A limit on how many shadows a screen may use",
      "The maximum file size for photographic backdrops",
      "A minimum text contrast ratio you guarantee by working backwards to the tint opacity needed over the worst backdrop",
    ],
    answer: 3,
    explanation:
      "You decide the contrast your text needs, then derive the tint opacity that guarantees it over the busiest plausible photo — certainty by construction, not by testing one lucky backdrop.",
  },
  {
    question: "Under reduced transparency, what should a glass surface become?",
    options: [
      "A solid, opaque surface with the same layout and hierarchy",
      "Fully invisible, so the content shows through",
      "A heavily blurred surface with no tint",
      "A wireframe outline of the original surface",
    ],
    answer: 0,
    explanation:
      "The fallback is a first-class surface: same geometry, same hierarchy, solid fill sampled from the tint. It must never disappear or turn into an unreadable smear.",
  },
];
