import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

interface UploadMenuRequestBody {
  canteenName: string;
  menuUrl: string;
}


export const uploadMenu = async(req: Request, res: Response) => {
    const {canteenName, menuUrl} = req.body ;
    const { userId } = req as any; 
    
    if (!canteenName || !menuUrl) {
        return res.status(400).json({ message: "Canteen name and menu URL are required" });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== "ADMIN") return res.status(404).json({ message: "User not found." });
        
        const canteen = await prisma.canteen.findUnique({ where: { canteenName } });

        if(canteen){
            await prisma.canteen.update({ where: { canteenName }, data: { menuUrl } });
            return res.status(200).json({ message: "Menu updated successfully." });
        }

        await prisma.canteen.create({data: {canteenName, menuUrl}});
        return res.status(201).json({ message: "Menu uploaded successfully." });

    } catch (error) {
        console.error("Error uploading menu:", error);
        return res.status(500).json({ message: "Server error: " + error });
    }

}

export const getMenuByCanteen = async(req: Request, res: Response) => {
    const { canteenName } = req.params;

    if (!canteenName) {
        return res.status(400).json({ message: "Canteen name is required." });
    }

    try {
        const canteen = await prisma.canteen.findUnique({ where: { canteenName } });

        if (!canteen || !canteen.menuUrl) {
            return res.status(404).json({ message: "Canteen Menu not found." });
        }

        return res.status(200).json({
            canteenName: canteen.canteenName,
            menuUrl: canteen.menuUrl
        });
    } catch (error) {
        console.error("Error fetching menu:", error);
        return res.status(500).json({ message: "Server error: " + error });
    }
}

export const addReview = async(req: Request, res: Response) => {

    const { canteenName, rating, messageReview, foodTried } = req.body;
    const { userId } = req as any; 

    if (!canteenName || !rating || !messageReview || !foodTried) {
        return res.status(400).json({ message: "Canteen name, rating, review message, and food tried are required." });
    }
    
    try {
        const canteen = await prisma.canteen.findUnique({ where: { canteenName } });
        if (!canteen) return res.status(404).json({ message: "Canteen not found." });

        const review = await prisma.canteenReview.create({
            data: {
                rating,
                messageReview,
                foodTried,
                canteenId: canteen.id,
                userId
            }
        });

        return res.status(201).json({ message: "Review added successfully.", review });
    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Server error: " + error });
    }
}



export const getReviewsByCanteen = async(req: Request, res: Response) => {
    const { canteenName } = req.params;

    if (!canteenName) {
        return res.status(400).json({ message: "Canteen name is required." });
    }

    try {
        const canteen = await prisma.canteen.findUnique({
            where: { canteenName },
            include: {
                reviews: {
                    include: { user: true }, 
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!canteen) return res.status(404).json({ message: 'Canteen not found' });

        const reviews = canteen.reviews.map(r => ({
            rating: r.rating,
            messageReview: r.messageReview,
            foodTried: r.foodTried,
            user : {
                username: r.user.username,
                profilePic: r.user.profilePic
            },
            createdAt: r.createdAt
          }));

        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ message: "Server error: " + error });
    }
}