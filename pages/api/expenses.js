import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (req.method === 'GET') {
    try {
      const expenses = await prisma.expense.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      });
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  } else if (req.method === 'POST') {
    try {
      const { description, amount, category, date, projectId } = req.body;

      // A default project is needed if none is provided.
      // For now, we will create a default project if one doesn't exist.
      let project = await prisma.project.findFirst({
        where: { userId: user.id },
      });

      if (!project) {
        project = await prisma.project.create({
          data: {
            name: 'Default Project',
            userId: user.id,
          },
        });
      }

      const newExpense = await prisma.expense.create({
        data: {
          description,
          amount: parseFloat(amount),
          category,
          date: new Date(date),
          userId: user.id,
          projectId: project.id,
        },
      });
      res.status(201).json(newExpense);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
