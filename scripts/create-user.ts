import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
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

    // Ask for user details
    const username = await question("Username: ");
    const name = await question("Name: ");
    const email = await question("Email: ");
    const password = await question("Password: ");

    // Validate input
    if (!username || !name || !email || !password) {
      console.error("❌ All fields are required.");
      return;
    }

    if (password.length < 6) {
      console.error("❌ Password must be at least 6 characters.");
      return;
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      console.error(`❌ Username "${username}" already exists.`);
      return;
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      console.error(`❌ Email "${email}" already in use.`);
      return;
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the user
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
