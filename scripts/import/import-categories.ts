import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CategoryData {
  name: string;
  children?: CategoryData[];
}

const theologicalCategories: CategoryData[] = [
  {
    name: "Allgemeines zur Theologie",
    children: [
      { name: "Wörterbücher & Lexika" },
      { name: "Fachbibliographien" },
      { name: "Methodenlehre" },
    ],
  },
  {
    name: "Bibel & Biblische Studien",
    children: [
      { name: "Bibelausgaben & Übersetzungen" },
      { name: "Biblische Kommentare" },
      { name: "Biblische Einführungen & Studienhilfen" },
      { name: "Biblische Sprachen & Grammatik" },
      { name: "Biblische Hermeneutik" },
      { name: "Qumran- & Pseudepigraphenforschung" },
    ],
  },
  {
    name: "Systematische Theologie & Dogmatik",
    children: [
      { name: "Allgemeine Dogmatik / Biblische Dogmatik" },
      { name: "Angelologie" },
      { name: "Bibliologie" },
      { name: "Kreationismus" },
      { name: "Hamartiologie" },
      { name: "Christologie" },
      { name: "Ekklesiologie" },
      { name: "Eschatologie" },
      { name: "Patrologie" },
      { name: "Pneumatologie" },
      { name: "Soteriologie" },
      { name: "Theologische Anthropologie" },
      {
        name: "Spezielle Themen",
        children: [{ name: "Trinitätslehre" }],
      },
      {
        name: "Konfessionelle Perspektiven",
        children: [
          { name: "Lutherisch" },
          { name: "Reformiert" },
          { name: "Katholisch" },
        ],
      },
    ],
  },
  {
    name: "Praktische Theologie",
    children: [
      { name: "Homiletik" },
      { name: "Pastoraltheologie" },
      { name: "Liturgiewissenschaft" },
      { name: "Missionswissenschaft" },
      { name: "Diakonie" },
      { name: "Religionspädagogik" },
    ],
  },
  {
    name: "Kirchengeschichte & Historische Theologie",
    children: [
      {
        name: "Primärliteratur",
        children: [
          { name: "Urchristentum" },
          { name: "Apostolische Väter" },
          {
            name: "Mittelalter",
            children: [{ name: "Scholastik" }, { name: "Mystik" }],
          },
          {
            name: "Reformation",
            children: [{ name: "Werke von Martin Luther" }],
          },
          { name: "Aufklärung" },
          { name: "Neuzeit" },
          { name: "Gegenwart" },
        ],
      },
      {
        name: "Sekundärliteratur",
        children: [{ name: "Lehrbücher" }, { name: "Nachschlagewerke" }],
      },
    ],
  },
  {
    name: "Kirchenrecht",
    children: [{ name: "Kanonisches Recht" }, { name: "Staatskirchenrecht" }],
  },
  {
    name: "Ökumenik & Interreligiöser Dialog",
    children: [
      { name: "Ökumenik" },
      {
        name: "Interreligiöser Dialog",
        children: [{ name: "Judaistik" }, { name: "Islamwissenschaft" }],
      },
    ],
  },
  {
    name: "Religionswissenschaft",
    children: [
      { name: "Vergleichende Religionswissenschaft" },
      { name: "Sozialwissenschaften der Religion" },
      { name: "Psychologie der Religion" },
      { name: "Phänomenologie der Religion" },
      { name: "Geschichte der Religionen" },
    ],
  },
  {
    name: "Hilfswissenschaften",
    children: [
      {
        name: "Alte Sprachen",
        children: [
          { name: "Hebräisch" },
          { name: "Griechisch" },
          { name: "Latein" },
        ],
      },
      { name: "Paläographie & Epigraphik" },
      { name: "Archäologie des Vorderen Orients" },
    ],
  },
  {
    name: "Kunst & Musik",
    children: [
      { name: "Ikonografie" },
      { name: "Kirchenmusik" },
      { name: "Christliche Kunstgeschichte" },
    ],
  },
  {
    name: "Biblische & Christliche Lebenspraxis",
    children: [
      { name: "Nachfolge & Jüngerschaft" },
      { name: "Gebet" },
      { name: "Persönliches Wachstum" },
      { name: "Leiterschaft" },
    ],
  },
  {
    name: "Apologetik & Weltanschauung",
    children: [
      { name: "Klassische Apologetik" },
      { name: "Christlicher Glaube & Skepsis" },
      { name: "Ethik, Gesellschaft & Zeitfragen" },
      { name: "Interreligiöser Dialog" },
    ],
  },
  {
    name: "Liturgie, Gottesdienst & Kirchenjahr",
    children: [
      { name: "Liturgische Einführungen" },
      { name: "Kirchenjahr & Feste" },
      { name: "Lobpreis & Musik" },
    ],
  },
  {
    name: "Philosophie & Theologische Ethik",
    children: [
      { name: "Philosophiegeschichte & Einführung" },
      { name: "Einzelne Denker & Strömungen" },
      { name: "Theologische Ethik & Moral" },
    ],
  },
  {
    name: "Ratgeber, Ehe & Familie",
    children: [
      { name: "Ehe & Partnerschaft" },
      { name: "Familie & Elternschaft" },
      { name: "Lebenshilfe & Persönliches Wachstum" },
    ],
  },
  {
    name: "Mission & Evangelisation",
    children: [
      { name: "Erfahrungsberichte & Biografien" },
      { name: "Praktische Missionslehre" },
    ],
  },
  {
    name: "Biografien & Zeitgeschichte",
    children: [
      { name: "Christliche Persönlichkeiten" },
      { name: "Sonstige Biografien" },
    ],
  },
  {
    name: "Christliche Populärliteratur",
    children: [
      { name: "Andachtsbücher & Tageslesungen" },
      { name: "Erbaungsliteratur" },
      { name: "Lebenshilfe & Familie" },
      {
        name: "Fiktion",
        children: [
          { name: "Romane" },
          { name: "Historische Romane" },
          { name: "Fantasy & SciFi" },
        ],
      },
      { name: "Biografien & Zeugnisse" },
      { name: "Jugend & Kinderbücher" },
      { name: "Comics & Grafische Romane" },
      { name: "Populäre Apologetik" },
      { name: "Gebets- & Liederbücher" },
    ],
  },
  {
    name: "Belletristik (Nicht-SF/Fantasy) & Klassiker",
    children: [
      { name: "Allgemeine Romane & Erzählungen" },
      { name: "Historische Romane" },
      { name: "Abenteuer, Krimi & Thriller" },
    ],
  },
  {
    name: "Science-Fiction",
    children: [
      { name: "Klassiker" },
      { name: "Dystopien & Utopien" },
      {
        name: "Franchises",
        children: [{ name: "Star Trek" }],
      },
    ],
  },
  {
    name: "Fantasy",
    children: [{ name: "High Fantasy" }, { name: "Urban Fantasy" }],
  },
  {
    name: "Sachbücher",
    children: [
      {
        name: "Ratgeber",
        children: [
          { name: "Gesundheit & Lifestyle" },
          { name: "Technik & Wissenschaft" },
          { name: "Geschichte & Kultur" },
          { name: "Methoden & Selbstorganisation" },
        ],
      },
      { name: "Lexika, Nachschlagewerke & Sammelbände" },
      { name: "Koch- und Rezeptbücher" },
    ],
  },
];

async function createCategories(
  categories: CategoryData[],
  parentId: string | null = null,
  level = 0,
): Promise<void> {
  let sortOrder = 1;

  for (const category of categories) {
    let path: string;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        console.error(`Parent category with ID ${parentId} not found`);
        continue;
      }
      path = `${parent.path}.${sortOrder}`;
    } else {
      path = sortOrder.toString();
    }

    const newCategory = await prisma.category.create({
      data: {
        name: category.name,
        path,
        sortOrder,
        level,
        parentId,
      },
    });

    console.log(`Created category: ${category.name} (${path})`);

    if (category.children && category.children.length > 0) {
      await createCategories(category.children, newCategory.id, level + 1);
    }

    sortOrder++;
  }
}

async function importCategories() {
  try {
    console.log("Starting theological category import...");

    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log(
        `Found ${existingCategories} existing categories. Do you want to proceed and potentially create duplicates? (Y/N)`,
      );
      console.log("Proceeding with import...");
    }

    await createCategories(theologicalCategories);

    console.log("Theological category import completed successfully!");
  } catch (error) {
    console.error("Error importing categories:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importCategories()
  .then(() => console.log("Import script finished"))
  .catch((e) => console.error("Import script error:", e));
