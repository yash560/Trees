import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongo';

type TreeNode = {
  name: string;
  data?: string;
  children?: TreeNode[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();

    switch (req.method) {

      case 'GET': {
        const trees = await db.collection('trees').find({}).toArray();

        if (!trees || trees.length === 0) {
          const defaultTree = {
            name: 'root',
            children: [],
          };

          await db.collection('trees').insertOne(defaultTree);
          return res.status(200).json([defaultTree]);
        }


        return res.status(200).json(trees);
      }

      case 'POST': {
        const { parentName, child } = req.body;

        if (!parentName || !child) {
          return res.status(400).json({ message: 'Invalid data' });
        }

        try {
          const tree = await db.collection('trees').findOne({ name: "root" });
          if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
          }


          const updateParentNode = (node: TreeNode) => {
            if (node.name === parentName) {
              if (!node.children) {
                node.children = [];
              }
              node.children.push(child);
              return true;
            }

            if (node.children) {
              for (const childNode of node.children) {
                const found = updateParentNode(childNode);
                if (found) return true;
              }
            }

            return false;
          };

          const parentFound = updateParentNode(tree);
          if (!parentFound) {
            return res.status(404).json({ message: 'Parent node not found' });
          }

          const result = await db.collection('trees').updateOne(
            { name: "root" },
            { $set: tree }
          );

          if (result.modifiedCount === 0) {
            return res.status(500).json({ message: 'Failed to update the tree' });
          }

          return res.status(200).json({ message: 'Child node added successfully' });
        } catch (err) {
          console.error('Error updating tree:', err);
          return res.status(500).json({ message: 'Failed to add child to the tree' });
        }
      }


      case 'PUT': {
        const { tree } = req.body;

        if (!tree || typeof tree !== 'object') {
          return res.status(400).json({ message: 'Invalid tree data provided' });
        }

        if (!tree.name) {
          return res.status(400).json({ message: 'Tree name is required to update' });
        }
        delete tree._id
        const result = await db.collection('trees').updateOne(
          { name: tree.name },
          { $set: tree },
          { upsert: true }
        );

        if (result.matchedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).json({ message: 'Tree not found' });
        }

        return res.status(200).json({
          message: 'Tree hierarchy updated successfully',
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
