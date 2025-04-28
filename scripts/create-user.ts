import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function createUser() {
  try {
    console.log("✨ Create new user ✨\n");

    const username = await question("Username: ");
    const name = await question("Name: ");
    const email = await question("Email: ");
    const password = await question("Password: ");

    if (!username || !name || !email || !password) {
      console.error("❌ All fields are required.");
      return;
    }

    if (password.length < 6) {
      console.error("❌ Password must be at least 6 characters.");
      return;
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      console.error(`❌ Username "${username}" already exists.`);
      return;
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      console.error(`❌ Email "${email}" already in use.`);
      return;
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log(`\n✅ User created successfully!`);
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
  } catch (error) {
    console.error("❌ Error creating user:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

void createUser();
