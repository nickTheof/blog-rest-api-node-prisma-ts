import prisma from "../../prisma/client";

export default async () => {
    console.log("🧹 Global test cleanup started...");
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ Global test data cleaned.");
    await prisma.$disconnect();
};