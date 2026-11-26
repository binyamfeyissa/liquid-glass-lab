/**
 * The Signal's catalogue: entirely fictional fixture journalism.
 * Every outlet, person, place and event below was invented for this
 * template — no real news organisations, no real people. Bodies are
 * full articles (4–6 paragraphs), not lorem ipsum, so the reader
 * experience can be judged as a buyer would see it.
 */

/** Bundled portrait for the signed-in reader (Alex Rivera). */
export const USER_IMAGE = require("./assets/img/user-alex-rivera.jpg");

export const TOPICS = [
  "World",
  "Tech",
  "Business",
  "Culture",
  "Science",
  "Sport",
] as const;

export type Topic = (typeof TOPICS)[number];

export interface Article {
  id: string;
  /** Bundled cover photo (assets/img/). */
  image: number;
  topic: Topic;
  headline: string;
  /** One-line summary shown under the headline in lists and on the article. */
  dek: string;
  /** Fictional outlet the story is credited to. */
  source: string;
  author: string;
  /** Human label shown in lists, e.g. "24 min ago". */
  timeLabel: string;
  /** Rough recency, used only to keep the fixture feed ordered. */
  minutesAgo: number;
  /** Estimated reading time in minutes. */
  readMinutes: number;
  /** Cover tint + monogram colour family for the composed cover panel. */
  tint: string;
  /** Single character(s) rendered large on the composed cover. */
  monogram: string;
  /** Full article body, one string per paragraph. */
  body: string[];
  /** Ids of related stories offered at the foot of the article. */
  related: string[];
  /** True for the one story that leads the Top tab. */
  lead?: boolean;
  /** 1–5 for the stories in the morning briefing digest. */
  briefingRank?: number;
}

export const ARTICLES: Article[] = [
  {
    id: "a1",
    image: require("./assets/img/article-a1-port-cities.jpg"),
    topic: "World",
    headline: "Port cities sign a shared pact to rebuild their storm walls together",
    dek: "Twelve coastal cities will pool engineers, money and hard lessons as sea defences move from local projects to a shared network.",
    source: "Harbor Wire",
    author: "Ines Duarte",
    timeLabel: "18 min ago",
    minutesAgo: 18,
    readMinutes: 5,
    tint: "#0e7490",
    monogram: "W",
    lead: true,
    briefingRank: 1,
    related: ["a8", "a4", "a11"],
    body: [
      "The mayors of twelve port cities signed the Meridian Accord on Tuesday, committing their harbours to a single shared programme of storm-wall design, joint purchasing and mutual aid crews. The agreement, negotiated over fourteen months, is the first time rival ports have agreed to treat sea defences as shared infrastructure rather than a local competition.",
      "Under the pact, each city contributes engineers to a common design office that will publish open plans for barriers, pumps and floodable parks. Smaller ports, which could never afford such work alone, gain access to the same modelling tools as the largest members, while wealthier cities get something they have lacked: neighbours whose walls are as strong as their own.",
      "\"A storm does not check which harbour it is flooding,\" said Ines Halvorsen, mayor of the host city of Brannvik, at the signing. \"For decades we each built our own wall and hoped the water respected the boundary. It does not, and now neither do we.\"",
      "The fund behind the accord starts at the equivalent of 900 million in pooled contributions, weighted by coastline length and cargo volume. Its first projects are deliberately unglamorous: standardised pump stations, a shared stockpile of barrier sections, and a training school for the crews who will maintain them.",
      "Sceptics note that previous port alliances have dissolved over cost-sharing disputes, and the accord's dispute clause will be tested the first time a storm damages one city more than another. But the signatories argue the arithmetic has changed: with insurance premiums for unprotected harbours tripling in five years, cooperation is now the cheaper option.",
      "The design office opens in January, and its first open plans — for a modular barrier that can be raised in stages as seas rise — are expected before the next storm season. If the model works, landlocked river cities have already asked whether they can join.",
    ],
  },
  {
    id: "a2",
    image: require("./assets/img/article-a2-dumbphone.jpg"),
    topic: "Tech",
    headline: "The quiet comeback of the dumbphone",
    dek: "Sales of basic handsets have tripled in two years. The buyers are not nostalgic — they are tired, and they have done the maths on their attention.",
    source: "Circuit Journal",
    author: "Marcus Webb",
    timeLabel: "42 min ago",
    minutesAgo: 42,
    readMinutes: 4,
    tint: "#7c3aed",
    monogram: "T",
    briefingRank: 3,
    related: ["a7", "a13", "a5"],
    body: [
      "The handset on Lena Okafor's desk makes calls, sends texts, and does almost nothing else. It cost less than a family pizza night, its battery lasts nine days, and Okafor — a software designer who builds apps for a living — describes it as the best technology purchase she has made in a decade.",
      "She is part of a measurable shift. Shipments of basic feature phones have tripled in two years across the markets tracked by the analyst firm Counterline, and the growth is concentrated among buyers under forty — the same demographic that was supposed to have abandoned the category forever.",
      "Retailers describe the typical purchase as a second phone rather than a replacement: a device for weekends, holidays and evenings, while the smartphone stays in a drawer. Manufacturers have responded with models that add a hotspot and little else, deliberately marketing what the phones cannot do.",
      "Psychologists are cautious about crediting the hardware itself. The benefit, they say, comes from friction: a phone that makes scrolling awkward makes the decision to scroll a conscious one. \"Willpower is a terrible strategy,\" one researcher notes. \"Environment design is a much better one, and a dumbphone is environment design you can hold.\"",
      "Whether the trend survives its own fashion cycle is an open question. But the major platforms have noticed: every flagship operating system now ships with a prominent minimal mode, an admission that for a growing number of customers, less has become a feature worth advertising.",
    ],
  },
  {
    id: "a3",
    image: require("./assets/img/article-a3-four-day-week.jpg"),
    topic: "Business",
    headline: "Four-day weeks stop being a perk and start being a schedule",
    dek: "What began as a pandemic experiment is hardening into rosters, contracts and hiring strategy at mid-size firms.",
    source: "The Ledger Post",
    author: "Priya Raman",
    timeLabel: "1 hr ago",
    minutesAgo: 64,
    readMinutes: 5,
    tint: "#b45309",
    monogram: "B",
    briefingRank: 2,
    related: ["a10", "a5", "a13"],
    body: [
      "When Hartwell Logistics moved its dispatch teams to a four-day week in 2023, the company's directors expected a morale boost and braced for a service dip. Two years on, the dip never arrived — and the experiment has quietly become the firm's single most effective recruiting tool in a tight labour market.",
      "Hartwell is no longer an outlier. A survey of 2,400 mid-size employers by the staffing firm Aldgate Partners found that 31 percent now operate some form of compressed week, up from 9 percent in 2021, and — more telling — that the share describing the policy as temporary has fallen every year.",
      "The models vary. Some firms close on Fridays; others stagger days off so coverage never lapses; a few compress forty hours into four long days, an arrangement unions watch carefully. What unites the successful versions, consultants say, is that they were designed around output measures first and calendars second.",
      "\"The failures we see are almost never about the day off,\" says Aldgate's lead researcher. \"They are about companies that removed a day but kept every meeting, every report and every approval chain exactly as it was. The work has to be redesigned, not just rescheduled.\"",
      "The next test is contractual. Employment lawyers report a sharp rise in four-day terms being written into offer letters and collective agreements, which converts a revocable perk into an expectation. Once it is in the contract, the experiment is over — it is simply the schedule.",
    ],
  },
  {
    id: "a4",
    image: require("./assets/img/article-a4-whale-song.jpg"),
    topic: "Science",
    headline: "A deep-sea observatory hears the ocean's slowest conversation",
    dek: "Hydrophones anchored two kilometres down have recorded years of whale song — and the phrases are spreading between oceans like rumours.",
    source: "Field Notes",
    author: "Tomas Lindqvist",
    timeLabel: "2 hrs ago",
    minutesAgo: 121,
    readMinutes: 6,
    tint: "#0369a1",
    monogram: "S",
    briefingRank: 4,
    related: ["a11", "a1", "a8"],
    body: [
      "Two kilometres beneath the surface, where sunlight has never reached, a string of hydrophones has been listening for six years. The Kestrel Deep Observatory's recordings now span 40,000 hours of ocean sound, and the team's latest analysis reveals something no one expected to find at that depth: culture, travelling at the speed of song.",
      "The researchers tracked a distinctive five-note phrase sung by humpback whales in one ocean basin. Within three seasons, the same phrase — ornamented, the way a tune changes as it passes between singers — appeared in recordings from a population an entire ocean away, carried by males who had migrated between the two groups.",
      "\"We knew songs spread within a population,\" says the study's lead author, marine acoustician Dr. Farah Nasser. \"What the deep array gives us is the full journey. We can hear a phrase being simplified as it travels, the way a story loses details each time it is retold. It is the closest thing to watching a rumour move.\"",
      "The observatory was built to monitor the health of deep ecosystems through sound — the clicks of squid-hunting whales, the groan of shifting ice, the rising hum of shipping. Its microphones have become a census tool as well, identifying individual whales by voice with enough reliability to track their movements without ever seeing them.",
      "The team is now opening the archive to outside researchers, arguing that six years of continuous listening is too valuable to sit in one laboratory. The first public dataset, released this week, comes with a listening guide for the public. The whales, Nasser notes, have been broadcasting all along. We have only just learned to keep the tape running.",
    ],
  },
  {
    id: "a5",
    image: require("./assets/img/article-a5-lending-library.jpg"),
    topic: "Culture",
    headline: "The lending library is back — and it lends everything except books",
    dek: "Tools, tents, projectors, a pasta machine shaped like a train: neighbourhood lending libraries are quietly becoming the most interesting shelves in town.",
    source: "The Commons Review",
    author: "June Castellano",
    timeLabel: "3 hrs ago",
    minutesAgo: 178,
    readMinutes: 4,
    tint: "#be185d",
    monogram: "C",
    related: ["a13", "a9", "a3"],
    body: [
      "The most borrowed item at the Marigold Street lending library is a pressure washer. Second is a six-person tent. Third — to the staff's enduring surprise — is a pasta machine shaped like a small locomotive, which has been checked out 214 times and returned, every single time, in working order.",
      "Marigold is one of roughly 900 \"libraries of things\" now operating in converted shops, community halls and, in one case, a former book library that simply expanded its definition. Members pay a small annual fee and borrow from shelves of tools, instruments, sports kit and party equipment — the long tail of objects that households need twice a year and store for the other 363 days.",
      "The economics are plain. The average power drill is used for about thirteen minutes in its entire life; a lending model turns that waste into a shared asset. But organisers insist the balance sheet is not the point. The point, they say, is the noticeboard by the door, where borrowing has a way of turning into skill-swaps, repair nights and street parties.",
      "Challenges are real: insurance, maintenance, and the diplomacy of the late return. Most libraries solve them with deposits, volunteer repair crews and a culture of gentle reminders. A few have added \"stewards\" — members who adopt a category of objects and keep it in order.",
      "The movement's next chapter is municipal. Three city councils have folded lending libraries into their waste-reduction plans, reasoning that a borrowed ladder is a ladder not manufactured, shipped or landfilled. The pasta train, meanwhile, has a waiting list until February.",
    ],
  },
  {
    id: "a6",
    image: require("./assets/img/article-a6-sprinter.jpg"),
    topic: "Sport",
    headline: "At 41, Mara Iversen is somehow getting faster",
    dek: "The veteran sprinter's late-career surge has sports scientists re-examining everything they assumed about ageing and speed.",
    source: "The Final Straight",
    author: "Deshawn Cole",
    timeLabel: "3 hrs ago",
    minutesAgo: 196,
    readMinutes: 5,
    tint: "#15803d",
    monogram: "S",
    related: ["a12", "a9", "a4"],
    body: [
      "Mara Iversen ran the fastest 100 metres of her life last Saturday. She is 41 years old, she has been a professional for two decades, and her time of 10.94 seconds has forced a conversation that sports science has been politely avoiding: what if the decline curve is not a law, but an average — and averages have exceptions with better training plans?",
      "Iversen's resurgence is not a mystery so much as a method. Four years ago she rebuilt her programme around recovery rather than volume: fewer sessions, each of higher quality; sleep treated as a training input with the same seriousness as intervals; and a strength programme designed for tendon stiffness, the quality that ageing actually erodes.",
      "\"Everyone told me what I would lose,\" she said after the race. \"Nobody could tell me the order I would lose it in, or how much of it was training and how much was just expectation. So we measured everything, and we kept the things that were still improving.\"",
      "Her coaches are careful not to oversell. Sprinting at elite level past forty remains vanishingly rare, and Iversen's injury history — two lost seasons in her thirties — means her career mileage is lower than her age suggests. Longevity, in other words, may partly be the compound interest of enforced rest.",
      "Still, the queue of young sprinters asking to visit her training group grows each season. What they find is unglamorous: meticulous logs, early nights, and a whiteboard that reads, in her handwriting, \"The plan is the recovery. The running is the easy part.\"",
    ],
  },
  {
    id: "a7",
    image: require("./assets/img/article-a7-modular-laptop.jpg"),
    topic: "Tech",
    headline: "Your next laptop may arrive as a box of parts — on purpose",
    dek: "Modular machines that owners can repair and upgrade themselves have moved from hobbyist curiosity to the big brands' roadmaps.",
    source: "Circuit Journal",
    author: "Marcus Webb",
    timeLabel: "4 hrs ago",
    minutesAgo: 243,
    readMinutes: 5,
    tint: "#7c3aed",
    monogram: "T",
    related: ["a2", "a13", "a10"],
    body: [
      "The box that arrived at reviewer Sana Iqbal's office did not contain a laptop. It contained a mainboard, a screen, a keyboard deck, six expansion cards and a screwdriver — the complete kit for a machine she assembled in twenty-two minutes, following a guide printed on the inside of the lid.",
      "Modular laptops have existed at the industry's edges for years, sold to enthusiasts willing to trade sleekness for sovereignty. What has changed is the guest list: two of the five largest PC makers have shown modular designs this year, driven less by hobbyist demand than by regulation — right-to-repair laws now covering most of their markets — and by corporate buyers who want fleets they can service instead of replace.",
      "The engineering trade-offs are real but shrinking. A socketed port is thicker than a soldered one; a replaceable battery carries slightly less charge than a glued one. The modular makers' counter is arithmetic: a machine whose screen, battery and board can each be replaced tends to stay in service twice as long, and total cost of ownership is the number fleet buyers actually read.",
      "Repairability advocates, who spent a decade being treated as a niche, are enjoying the moment while keeping their scorecards out. \"A modular flagship is wonderful,\" says one repair-network director. \"The test is whether the spare parts are still on sale in seven years, at prices that make repair rational. That is where good intentions usually expire.\"",
      "For now, the screwdriver in the box is doing quiet rhetorical work. It tells the buyer, before the machine is even switched on, that the device is theirs in a way sealed units never quite manage to say.",
    ],
  },
  {
    id: "a8",
    image: require("./assets/img/article-a8-night-trains.jpg"),
    topic: "World",
    headline: "Night trains are selling out. The railways are scrambling to add more.",
    dek: "Sleeper routes once headed for the scrapyard now have waiting lists, as travellers trade airport queues for couchettes and border crossings at dawn.",
    source: "Harbor Wire",
    author: "Ines Duarte",
    timeLabel: "5 hrs ago",
    minutesAgo: 302,
    readMinutes: 5,
    tint: "#0e7490",
    monogram: "W",
    briefingRank: 5,
    related: ["a1", "a4", "a12"],
    body: [
      "The overnight train from the capital to the northern lakes leaves at 21:40, and for the past eleven weeks every berth has been sold before the week began. The operator, which planned to retire the route's ageing sleeper cars in 2022, has instead begun refurbishing them — and ordering more.",
      "The pattern repeats across the continent. Sleeper bookings are up 60 percent on pre-pandemic levels, load factors on the marquee routes exceed those of many short-haul flights, and operators that spent decades treating night trains as a legacy burden now compete to announce new ones.",
      "The passengers are a coalition of the unlikely: climate-conscious students in the couchettes, business travellers who discovered they prefer arriving at a city-centre station at 7 a.m. to a dawn alarm and an airport bus, and a growing class of tourists for whom the journey itself has become the holiday.",
      "Railways are discovering that their bottleneck is not demand but hardware. Sleeper cars take years to build, few manufacturers kept production lines warm, and the second-hand market has been picked clean. \"Everyone wants to launch a route,\" one operator admits. \"The honest constraint is that there are only so many beds on wheels in existence.\"",
      "Governments, sensing both votes and emissions savings, have begun offering the night network what it lacked for decades: path guarantees and subsidy frameworks that treat a sleeper berth like the public service its passengers already believe it is.",
    ],
  },
  {
    id: "a9",
    image: require("./assets/img/article-a9-two-hour-film.jpg"),
    topic: "Culture",
    headline: "The two-hour film is becoming an endangered species",
    dek: "Average runtimes keep creeping up, but a stubborn school of directors is making the case for ninety tight minutes.",
    source: "The Commons Review",
    author: "June Castellano",
    timeLabel: "6 hrs ago",
    minutesAgo: 361,
    readMinutes: 4,
    tint: "#be185d",
    monogram: "C",
    related: ["a5", "a6", "a13"],
    body: [
      "Somewhere between the second act and the third streaming-service bathroom break, the movies got long. The average runtime of the year's fifty most-watched films now sits at 2 hours 21 minutes, up from 1 hour 58 two decades ago — and audiences, judging by the complaints, have started to notice their evenings going missing.",
      "Directors give structural reasons: franchise storytelling carries more characters, more mythology, more obligatory endings. Exhibitors give economic ones: a longer film justifies a premium ticket. But a counter-movement is forming among filmmakers who treat brevity as a discipline rather than a limitation.",
      "\"Ninety minutes is not a smaller canvas,\" says director Amara Chen, whose last two features both clocked in under 100 minutes to strong reviews. \"It is a stricter one. Every scene has to earn the next. When I cut a scene and the film gets better, that is not losing material — that is the material telling me what it was.\"",
      "The streaming era cuts both ways. Freed from the tyranny of the programme slot, runtimes ballooned; but the same platforms' data shows completion rates falling off a cliff past the two-hour mark on weeknights, and commissioners have quietly begun asking for tighter cuts again.",
      "The likeliest future is a split: spectacle runs long, everything else rediscovers the virtues of the early finish. The two-hour film may not vanish, but it is losing its status as the default — and audiences with trains to catch are not mourning.",
    ],
  },
  {
    id: "a10",
    image: require("./assets/img/article-a10-corner-bakery.jpg"),
    topic: "Business",
    headline: "The corner bakery learned to sell out by noon — and stopped trying to grow",
    dek: "A family bakery's decision to cap production instead of expanding has become a case study in enough.",
    source: "The Ledger Post",
    author: "Priya Raman",
    timeLabel: "7 hrs ago",
    minutesAgo: 428,
    readMinutes: 4,
    tint: "#b45309",
    monogram: "B",
    related: ["a3", "a5", "a7"],
    body: [
      "By 11:40 most mornings, the chalkboard outside Bröd & Co. reads the same way: Sold out. See you tomorrow. The family bakery could sell three times what it bakes. It has been offered second locations, wholesale contracts and a franchising deal. It has declined all of them, and its refusal has become one of the most argued-about business decisions in the neighbourhood.",
      "The maths, as second-generation baker Tomas Lind explains it, is about what growth would cost the product. The bakery's sourdough takes two days and one pair of hands he trusts — his own. A second site means either a lesser loaf or a production bakery, and either way, the thing people queue for stops existing.",
      "Instead, the bakery optimised for sufficiency: a fixed daily bake, priced to pay four people well, with the afternoon given back to recipe development, a community bread class, and the radical luxury of evenings. The queue, counterintuitively, grew — scarcity did the marketing.",
      "Business schools have begun sending students to interview the family, filing the bakery under a growing literature on \"enough-based\" enterprises: firms that define a target income and design backwards from it, rather than treating growth as an obligation. The model does not scale, its proponents admit cheerfully. That, they say, is rather the point.",
      "Lind is pragmatic about the romance. \"We are not against growth,\" he says, sliding the day's last loaf across the counter. \"We grew — from two people to four, from surviving to comfortable. We just decided that was the size of the dream.\"",
    ],
  },
  {
    id: "a11",
    image: require("./assets/img/article-a11-sideways-rain-planet.jpg"),
    topic: "Science",
    headline: "Astronomers find a planet where it rains sideways, forever",
    dek: "A tidally locked world 400 light-years away has a permanent storm band — and it is teaching scientists how atmospheres move heat.",
    source: "Field Notes",
    author: "Tomas Lindqvist",
    timeLabel: "8 hrs ago",
    minutesAgo: 487,
    readMinutes: 5,
    tint: "#0369a1",
    monogram: "S",
    related: ["a4", "a1", "a14"],
    body: [
      "The planet Kestrel-9b does not rotate relative to its star: one face bakes in permanent noon, the other freezes in permanent night. Between them, along the twilight seam, new observations show a storm band that has likely been raging, uninterrupted, for longer than life has existed on Earth.",
      "The finding comes from four years of transit observations that let astronomers map the planet's atmosphere by watching starlight filter through it. The data shows winds at the seam reaching 3,000 kilometres per hour, carrying heat — and vaporised minerals — from the dayside into the dark, where they condense and fall as a sideways rain of glassy droplets.",
      "\"Every model we had said the seam should be turbulent,\" says Dr. Farah Nasser, who led the analysis. \"None of them said it would organise itself into a single permanent storm with a structure this stable. The atmosphere found an equilibrium we did not predict, and now the models have to catch up with the planet.\"",
      "The stakes are more than meteorological curiosity. Tidally locked planets are among the most common worlds in the galaxy, and their habitability depends entirely on whether their atmospheres can move heat from the bright side to the dark. Kestrel-9b is far too hot for life — but it is a working demonstration that an atmosphere can act as a planetary radiator.",
      "Next, the team wants the night side's weather: what falls there, and whether the rain ever stops. The telescope time has been approved. The storm, indifferent and eternal, will be waiting.",
    ],
  },
  {
    id: "a12",
    image: require("./assets/img/article-a12-supporters-trust.jpg"),
    topic: "Sport",
    headline: "The supporters' trust now owns the club. The hard part started after the party.",
    dek: "Fan ownership delivered romance and a famous victory. Then came the accounts, the plumbing, and the real work of running a football club.",
    source: "The Final Straight",
    author: "Deshawn Cole",
    timeLabel: "9 hrs ago",
    minutesAgo: 545,
    readMinutes: 6,
    tint: "#15803d",
    monogram: "S",
    related: ["a6", "a8", "a10"],
    body: [
      "The night Eastvale United's supporters' trust completed its buyout, the social club bar stayed open until two and the chairman-for-the-evening — a bus driver named Paul Okafor — was carried around the car park on shoulders. Eighteen months later, Okafor chairs the finance subcommittee, and his opening report to members began with the words: \"Right. The roof.\"",
      "Eastvale's story is the fan-ownership movement in miniature. The trust rescued the club from an owner who had loaded it with debt, won promotion in a season of delirious overperformance, and then discovered that community ownership's real product is not romance but administration: insurance renewals, safeguarding audits, a drainage system older than most of the squad.",
      "The trust's answer has been radical transparency as an operating system. Accounts are published quarterly in plain language; the catering contract was debated at an open meeting; when the club chose a cheaper kit supplier over a beloved local one, the board showed its workings and survived the argument.",
      "Membership has grown past 6,000, including supporters of other clubs who joined, as one put it, \"to keep the idea alive somewhere.\" The playing side has stabilised in mid-table, which the members — who set the budget — voted to prioritise over a promotion gamble. \"We have seen what gambling looks like,\" Okafor says. \"We were the stake.\"",
      "Other trusts now visit Eastvale the way young managers once visited famous academies, notebooks out. What they copy is rarely the ownership structure itself. It is the meeting discipline, the published numbers, and the roof — finally, this spring, replaced.",
    ],
  },
  {
    id: "a13",
    image: require("./assets/img/article-a13-handwriting.jpg"),
    topic: "Culture",
    headline: "Handwriting's defenders have a new argument: your brain",
    dek: "As keyboards finish their takeover of the classroom, researchers keep finding that the pen does something for memory that typing does not.",
    source: "The Commons Review",
    author: "June Castellano",
    timeLabel: "10 hrs ago",
    minutesAgo: 603,
    readMinutes: 4,
    tint: "#be185d",
    monogram: "C",
    related: ["a5", "a9", "a2"],
    body: [
      "The lecture hall is full, the laptops are open, and in the third row a student is writing in a paper notebook with what looks, to her neighbours, like a museum artefact. She is not being nostalgic. She has read the research — a growing pile of it — and she is exploiting it.",
      "Study after study finds the same pattern: students who take notes by hand remember concepts better than students who type, even though typists capture far more words. The leading explanation is that handwriting is too slow for transcription, so the brain is forced to summarise and connect as it goes — the effort is the encoding.",
      "Newer work adds a developmental twist. Children learning letters by hand show stronger activation in reading circuits than children who learn by keyboard, suggesting the shape-making itself helps wire the symbol to its sound. Several school systems that removed handwriting from the curriculum a decade ago have quietly reinstated it.",
      "Nobody serious is proposing the abolition of the keyboard; the same researchers publish their papers on laptops. The emerging consensus is duller and more useful: handwriting is a tool with a specific job — learning — and like any tool it should be picked up when the job is at hand, and put down without guilt when it is not.",
      "As for the student in the third row: she finished top of her cohort in the winter exams. Her notebook, she reports, is a mess. That, the research suggests, may be exactly why it works.",
    ],
  },
  {
    id: "a14",
    image: require("./assets/img/article-a14-fungus.jpg"),
    topic: "Science",
    headline: "A fungus in the walls turns out to be eating the pollution",
    dek: "The black mould nobody wanted is breaking down industrial solvents — and remediation teams are learning to farm it instead of fighting it.",
    source: "Field Notes",
    author: "Tomas Lindqvist",
    timeLabel: "12 hrs ago",
    minutesAgo: 719,
    readMinutes: 5,
    tint: "#0369a1",
    monogram: "S",
    related: ["a11", "a4", "a1"],
    body: [
      "The stain on the wall of the old dye-works in Karstadt was, for thirty years, simply a stain — black mould in a derelict building awaiting demolition. It became something else when a remediation surveyor noticed the soil readings: the ground nearest the stain was the cleanest on the site, in a factory yard soaked with industrial solvents since the 1960s.",
      "The fungus, a strain of a common black yeast, was doing what no one had asked it to do. Presented with a banquet of solvents leaching through the wall, it had learned to eat them, breaking the compounds down into harmless residues. Laboratory tests confirmed the trick and measured its appetite: the strain degrades some solvents faster than any engineered system the team had trialled.",
      "\"We spend fortunes designing organisms to clean up our messes,\" says mycologist Dr. Ines Halvorsen. \"Meanwhile the messes have been running their own design programme for decades, selecting for whatever can survive in them. Sometimes the winning design is already on the wall.\"",
      "Remediation firms are now cultivating the strain for use in contained treatment beds — not released into the wild, but grown on waste material through which contaminated water is passed. Two pilot plants are running, and the early numbers suggest costs a third lower than chemical treatment.",
      "The dye-works itself has been reprieved, at least in part. The stained wall is being preserved behind glass in the site's new remediation centre, with a plaque that gives the fungus its due: the building's most valuable tenant, and the only one that never paid rent.",
    ],
  },
];

export const articleById = (id: string): Article | undefined =>
  ARTICLES.find((a) => a.id === id);

/** Headlines for the live ticker strip on the Top tab. */
export const TICKER: string[] = [
  "Meridian Accord signing closes with all twelve ports in",
  "Night-train sleeper bookings up 60% on pre-pandemic levels",
  "Iversen runs 10.94 — fastest 100m of her career at 41",
  "Feature-phone shipments triple in two years, analysts say",
  "Kestrel Deep archive opens to outside researchers",
  "Eastvale trust publishes quarterly accounts in plain language",
  "Four-day week now in contracts at a third of mid-size firms",
];

/** Fixture market + weather summary for the briefing screen. */
export const BRIEFING_MARKETS = {
  label: "Sample data — fixtures, not live figures",
  rows: [
    { name: "Meridian Index", value: "4,812.6", change: "+0.8%" },
    { name: "Harbor Composite", value: "1,204.3", change: "+0.3%" },
    { name: "Continental 50", value: "7,655.1", change: "−0.2%" },
    { name: "Northlight Bond 10Y", value: "3.41%", change: "+0.04" },
  ],
  weather: [
    { city: "Brannvik", detail: "Clear, 9°C" },
    { city: "Karstadt", detail: "Light rain, 12°C" },
    { city: "Port Alba", detail: "Windy, 17°C" },
  ],
};
